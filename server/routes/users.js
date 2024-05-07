const { ObjectId } = require("mongodb");
const { mongoClient } = require("../frameworks/mongoUtil");
const { sendEmail, sendSMS } = require("../helpers/email/email");
const { userRegisterationEmail, welcomeEmailTemplate, verificationEmailTemplate } = require("../helpers/email_templates");
const { validateUser, validateAdmin } = require("../helpers/middleware");
const { encrpytPass, verifyPass } = require('../helpers/password');
const { signUser } = require("../helpers/user");
const moment = require("moment");

module.exports = (app) => {
    
    //Collections
    var usersCollection = mongoClient.db(process.env.DB).collection("users");

    //List User - Admin
    /**
 * @api {post} /admin/users/list List Users (Admin)
 * @apiName ListUsersAdmin
 * @apiGroup Admin
 *
 * @apiParam {Number} pageSize Number of items per page.
 * @apiParam {Number} page Page number.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 * @apiSuccess {Object[]} data Array of users.
 * @apiSuccess {Number} pageCount Total number of pages.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true,
 *          "data": [
 *              {
 *                  "_id": "60742a9d546ff0c0c018e23a",
 *                  "name": "John Doe",
 *                  "email": "john@example.com",
 *                  "createdAt": "2022-04-12T10:15:00.000Z"
 *              },
 *              {
 *                  "_id": "60742a9d546ff0c0c018e23b",
 *                  "name": "Jane Doe",
 *                  "email": "jane@example.com",
 *                  "createdAt": "2022-04-13T08:20:00.000Z"
 *              }
 *          ],
 *          "pageCount": 3
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": false,
 *       "error": "Message from Server"
 *     }
 */
    app.post('/admin/users/list', validateAdmin, async (req, res) => {
        data = req.body;

        //Parameters        
        var pageSize = parseInt(data.pageSize);
        var currentPage = Math.max(0, data.page);

        try {
            //Remove ID
            //const projection = { _id: 0 };
            var news = await usersCollection.find({})
                //.project(projection)
                .skip(pageSize * (currentPage - 1)) 
                .limit(pageSize)
                .sort({"timestamp": -1})
                .toArray();

            //Page Count
            const pageCount = await usersCollection.countDocuments();

            res.json({
                'success': true,
                'data': news,
                "pageCount": Math.round(pageCount / pageSize)
            });            
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });
        }
    });

    //Forget Password - Verify and Update
    /**
 * @api {post} /public/user/forget/password/verify Verify Password Reset Request
 * @apiName VerifyPasswordResetRequest
 * @apiGroup Public
 *
 * @apiParam {String} email Email address of the user.
 * @apiParam {String} phone Phone number of the user.
 * @apiParam {Number} auth Authorization code for password reset.
 * @apiParam {String} password New password for the user account.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 * @apiSuccess {Boolean} validated Indicates whether the password reset request was validated.
 * @apiSuccess {String} token Authentication token for the user.
 * @apiSuccess {String} email Email address of the user.
 * @apiSuccess {String} name Name of the user.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true,
 *          "validated": true,
 *          "token": "eyJhbGci ... ",
 *          "email": "example@example.com",
 *          "name": "Test User"
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.post('/public/user/forget/password/verify', async (req, res) => {
        /* 
            email: string,
            phone: string,
            auth: number,
            password: string,
        */
        data = req.body;
        try {
            
            await mongoClient.connect();

            //Verification - Email
            results = await usersCollection.find({
                'email': data.email,
                'verification.password_auth': data.auth
            })
            .toArray();   

            if (results.length != 1) {
                //await mongoClient.close();
                throw new Error("Email Address or Authorization Code did not match");
            }

            //Encrypt Password
            var password = await encrpytPass(data.password);

            //Update Password
            var results = await users.updateOne(
                {'_id': ObjectID(results[0]._id.toString())},
                { 
                    $set: {
                        "password": password
                    } 
                }
            );
                 
            if (!results.acknowledged) {
                //await mongoClient.close();
                throw new Error("Database Query Error");
            }

            //Response
            res.json({
                'success': true,
                'validated': true,
                ...signUser(results[0])
            });

            //await mongoClient.close();
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });
        }
    });     
    
    

    //Forget Password - Reset by Email
    /**
 * @api {post} /public/user/forget/password/email Request Password Reset Email
 * @apiName RequestPasswordResetEmail
 * @apiGroup Public
 *
 * @apiParam {String} email Email address of the user.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.post('/public/user/forget/password/email', async (req, res) => {
        /* 
        {
            email: string
        }
        */
        data = req.body;
        try {
            await mongoClient.connect();
            
            //Verify Email
            var results = await usersCollection.find({
                    'email': data.email
                })
                .toArray();

            if (results.length != 1) {
                //await mongoClient.close(); //Graceful Mongo Exit
                throw new Error("Email Address not Found");
            }

            
            //Generate Auth Code
            var email_auth_code =  (Math.random() * (999999 - 100000) + 100000).toFixed(0);            

            //Update Collection
            var id = results[0]._id.toString();

            var results = await usersCollection.updateOne(
                                    {'_id': ObjectID(id)},
                                    { 
                                        $set: {
                                            "verification.password_auth": email_auth_code
                                        } 
                                    }
                                );       
            
            //Response
            res.json({
                success: true
            });
            
            //await mongoClient.close(); //Graceful Mongo Exit

            //Send Verification Email
            var subject = "Password Reset | BreatheIO System";
            var msg = "\
            <p>Your Email Verification Code: <span style='font-weight: bold; font-size: 20px; color: grey;'>" + email_auth_code + "</span></p> \
            <p> \
            This email is sent to reset your password, Click on the following link to reset your Password \
            </p>\
            <a target='_blank' rel='noopener' href='https://www.tripjojo.com/reset/password/email/" + email_auth_code + "'>https://www.tripjojo.com/reset/password/email/" + email_auth_code + "</a>\
            ";
            await sendEmail(data.email, subject, msg);    

        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });
        }
    });   

    //Login
    /**
     * @api {post} /public/user/login Login
     * @apiName Login
     * @apiGroup User
     *
     * @apiBody {String} email Email Address of User.
     * @apiBody {String} password  Password by User.
     * 
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *          'success': true,
     *          'validated': true,
     *          "token": "ASJDOIASJD....",
     *          "user": {
     *              name: String,
     *              email: String,
     *              phone: String
     *          }
     *     }
     *
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "success": false,
     *       "error": "Message from Server"
     *     }
     */    
    app.post('/public/user/login', async (req, res) => {
        data = req.body;
        try {
            //Connect to Users Collection
            await mongoClient.connect();

            var results = await usersCollection.find({
                'email': data.email
            })
            //.project({_id: 1, name: 1, email: 1, password: 1, phone: 1, profile: 1, push_notification: 1, admin: 1, type: 1})
            .toArray();    
            
            //Check if User Found
            if (results.length != 1) {
                //await mongoClient.close();
                throw new Error("Check Email or Password");
            }
            
            //Password Verification
            var passVerification = await verifyPass(data.password, results[0].password);

            //Invalid Password
            if (!passVerification) {
                //await mongoClient.close();
                throw new Error("Check Email or Password");
            }
            
            //Response
            res.json({
                'success': true,
                'validated': true,
                ...signUser(results[0])
            });

            //Graceful Exit
            //await mongoClient.close();

        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });
        }
    });

    //Register User
    /**
     * @api {post} /public/user/register Register New User
     * @apiName Register User
     * @apiGroup User
     *
     * @apiBody {String} email Email Address of User.
     * @apiBody {String} password  Password by User.
     * @apiBody {String} phone  Phone Number of the User.
     * @apiBody {String} name  Full Name of the User.
     * 
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *          'success': true,
     *          'validated': true,
     *          "token": "ASJDOIASJD....",
     *          "user": {
     *              name: String,
     *              email: String,
     *              phone: String
     *          }
     *     }
     *
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "success": false,
     *       "error": "Message from Server"
     *     }
     */
    app.post('/public/user/register', async (req, res) => {
        data = req.body;
        try {
            //Create Connection
            await mongoClient.connect();     
            
            //Find Duplicate Emails
            var results = await usersCollection
                .find({ email: data.email })
                .toArray();   
                
            //console.log("Results", results);
            if (results.length > 0) {
                //await mongoClient.close();
                throw new Error("Email Address Already Exists");
            }
            
            //Encrypt Password
            var password = await encrpytPass(data.password); 
            
            //Generate Verification Code
            var email_auth_code = (Math.random() * (999999 - 100000) + 100000).toFixed(0); 
            var sms_auth_code = (Math.random() * (999999 - 100000) + 100000).toFixed(0); 
            
            //Insert User
            results = await usersCollection.insertOne({
                timestamp: moment().utc().toDate(),
                email: data.email,
                name: data.name,
                password: password,
                phone: data.phone,
                //type: data.type,
                //Verification
                verification: {
                    email: false,
                    email_auth: email_auth_code,
                    phone: false,
                    phone_auth: sms_auth_code
                },
                /* 
                //Check Push Notifications
                ...data.push_notification_key && {
                    push_notification: {
                        key: data.push_notification_key,
                        type: data.push_device_type,
                        enable: true
                    }
                }
                 */
            });
            
            //Database Error
            if (!results.acknowledged) {
                //await mongoClient.close(); //Graceful Mongo Exit
                throw new Error("System Entry Error"); 
            }
            
            console.log("Entry Results", results.insertedId);
            
            //Attached Inserted ID
            data["_id"] = results.insertedId;

            //Response
            res.json({
                'success': true,
                'validated': true,
                ...signUser(data)
            });            
            
            //await mongoClient.close(); //Graceful Mongo Exit
            console.log("MongoDB Closed") 

            //User Registration
            await sendEmail(data.email, 
                userRegisterationEmail(data.email, data.password).subject, 
                userRegisterationEmail(data.email, data.password).msg, 
                );
            console.log("User Registeration Email Sent");
                
            //Welcome Email     
            await sendEmail(data.email, 
                welcomeEmailTemplate(data.name).subject,
                welcomeEmailTemplate(data.name).msg                    
                ); 
        
                /* 
            //Generate Auth - Send Email - Verify Email
                await sendEmail(data.email, 
                    verificationEmailTemplate(email_auth_code).subject, 
                    verificationEmailTemplate(email_auth_code).msg);      
                */
                

        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });
        }
    });

    //Verify Token - User
    app.get('/verify/user/token', validateUser, async (req, res) => {
        try {
            res.json({
                success: true
            });
        } catch (error) {
            res.json({
                success: false,
                error: error.message
            });
        }
    });    


    /**
 * @api {get} /verify/user/token Verify User Token
 * @apiName VerifyUserToken
 * @apiGroup Authentication
 * @apiDescription Verify user token for authentication purposes.
 *
 * @apiHeader {String} Authorization User's access token prefixed with "Bearer ".
 *
 * @apiSuccess {Boolean} success Indicates whether the token is valid.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    //Verify Token - User
    app.get('/verify/admin/token', validateAdmin, async (req, res) => {
        try {
            res.json({
                success: true
            });
        } catch (error) {
            res.json({
                success: false,
                error: error.message
            });
        }
    });        
    



    //Get User Info
    /**
 * @api {get} /get/user/info Get User Information
 * @apiName GetUserInfo
 * @apiGroup Users
 * @apiDescription Get user information based on the provided authentication token.
 *
 * @apiHeader {String} Authorization User's access token prefixed with "Bearer ".
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 * @apiSuccess {Object} data User information.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true,
 *          "data": {
 *              "_id": "User ID",
 *              "name": "User's Name",
 *              "email": "User's Email",
 *              // Other user information
 *          }
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.get('/get/user/info', validateUser, async (req, res) => {
        try {
            console.log("Fetching User Info");
            await mongoClient.connect();

            var results = await usersCollection
                                .find({ _id: new ObjectId(req.USER.id)})
                                .project({ password: 0 })
                                .toArray();
                                
            if (results.length != 1) {
                throw new Error("User does not exists");
            }

            res.json({
                success: true,
                data: results[0]
            });
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });            
        }
    });     




    //User - Update Info
    /**
 * @api {post} /user/update/info Update User Information
 * @apiName UpdateUserInfo
 * @apiGroup Users
 * @apiDescription Update user information for the authenticated user.
 *
 * @apiHeader {String} Authorization User's access token prefixed with "Bearer ".
 *
 * @apiParam {String} name User's name.
 * @apiParam {String} contact User's contact information.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.post('/user/update/info', validateUser, async (req, res) => {
        data = req.body;
        try {

            //Users Collection
            await mongoClient.connect();
                
            //Update Password
            var results = await usersCollection.updateOne(
                {'_id': new ObjectId(req.USER.id)},
                { 
                    $set: {
                        "name": data.name,
                        "phone": data.contact,
                    } 
                }
            );
            
            await mongoClient.close();
            
            if (!results.acknowledged) {
                throw new Error("Database Query Error");
            }

            res.json({
                success: true
            });                
            
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });                
        }
    });    
    



    //User - Update Password
    /**
 * @api {post} /user/update/password Update User Password
 * @apiName UpdateUserPassword
 * @apiGroup Users
 * @apiDescription Update the password for the authenticated user.
 *
 * @apiHeader {String} Authorization User's access token prefixed with "Bearer ".
 *
 * @apiParam {String} current_password Current password of the user.
 * @apiParam {String} new_password New password for the user.
 *
 * @apiSuccess {Boolean} success Indicates whether the request was successful.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "success": false,
 *       "error": "Error message from server."
 *     }
 */
    app.post('/user/update/password', validateUser, async (req, res) => {
        /* 
            {
                current_password: string,
                new_password: string
            }
        */
        data = req.body;
        try {
            var user = req.USER;

            //Users Collection
            await mongoClient.connect();

            var results = await usersCollection
                                .find({ _id: new ObjectId(user.id)})
                                .project({ password: 1 })
                                .toArray();

            if (results.length != 1) {
                await mongoClient.close();
                throw new Error("User Not Found");
            }

            //Compare Password
            var pwMatch = await passHelper.verifyPass(data.current_password, results[0].password);
                        
            if (!pwMatch) {
                await mongoClient.close();
                throw new Error("Password Didnt Match");
            }

            //Encrypt Password
            var password = await encrpytPass(data.new_password);

            //Update Password
            var results = await usersCollection.updateOne(
                {'_id': new ObjectId(user.id)},
                { 
                    $set: {
                        "password": password
                    } 
                }
            );
            
            await mongoClient.close();
            
            if (!results.acknowledged) {
                throw new Error("Database Query Error");
            }

            res.json({
                success: true
            });
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });
        }
    });    




/* 
    //Test Email
    app.post('/test/email',  async (req, res) => {
        data = req.body;
        try {
    
            //Send Email
            await sendEmail(
                "Irfankhn881@gmail.com", 
                "TripJoJo Mailing System just went Online", 
                "Welcome to TripJoJo LLC, Irfan Khan. We are ready to take over the world");

            var sms = await sendSMS(
                    "+971581242350", 
                    "Your Activation Code is " + 123432 + " by TripJoJo LLC");                

            console.log("SSMS response", sms);
            res.json({
                'success': true
            });
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error: error.message
            });               
        }
    });

     */
}