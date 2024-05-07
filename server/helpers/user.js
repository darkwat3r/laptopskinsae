const jwt = require('jsonwebtoken');

module.exports = {
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },    
    formatNumberWithCommas: (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    JWTVerify: (token) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.SECRET, (err, user) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(user);
                }
            });            
        });
    },
    //Sign User - Version 1.0
    JSONSignUser: (userData) => {
        //Return Login Token
        return jwt.sign(userData, process.env.SECRET, { expiresIn: '168h'});        
    },
    getAdminData : (req) => {
        return new Promise((resolve, reject) => {
            if (typeof req.headers.authorization !== "undefined") {
                let token = req.headers.authorization.split(" ")[1];
                jwt.verify(token, process.env.SECRET, (err, user) => {
                    if (err) {
                        reject({
                            "error": true,
                            "msg": err
                        })
                    } else {
                        console.log("User", user);
                        if (!user.admin) {
                            reject({
                                "error": true,
                                "msg": "No Admin Rights"
                            });                        
                            return;                                
                        }
                        resolve(user);
                    }
                });
            } else {
                reject({
                    "error": true,
                    "msg": "Token Not Found"
                });
            }
        });
    },
    getUserData : (req) => {
        return new Promise((resolve, reject) => {
            if (typeof req.headers.authorization !== "undefined") {
                let token = req.headers.authorization.split(" ")[1];
                jwt.verify(token, process.env.SECRET, (err, user) => {
                    if (err) {
                        reject({
                            "error": true,
                            "msg": err
                        })
                    } else {
                        resolve(user);
                    }
                });
            } else {
                reject({
                    "error": true,
                    "msg": "Token Not Found"
                });
            }
        });
    },
    //Sign User - Function - Version 2.0
    signUser: (userInfo) => { 
        console.log("User Info", userInfo);
        //Create Signing Request - Authentication
        var signUser = {
            "id":       userInfo._id.toString(),
            "name":     userInfo.name,
            "email":    userInfo.email,
            "phone":    userInfo.phone,
            "admin":    userInfo.admin || false
        };

        //Verification Complete - Generate Token
        var token = module.exports.JSONSignUser(signUser);        
        
        //User Object
        var userObject = {
            "name":     userInfo.name,
            "email":    userInfo.email,
            "phone":    userInfo.phone,
            "profile":  userInfo.profile || null,
            //"type":     userInfo.type
        };   
        

        
        return {
            user: userObject,
            token: token
        }
    }    
}