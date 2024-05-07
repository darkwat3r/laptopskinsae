const { getAdminData, getUserData } = require("./user");

module.exports = {      
    validateUser: async (req, res, next) => {
        try {
            
            //Get User
            var user = await getUserData(req);

            if (user == undefined) {
                res.status(401).json({
                    success: false,
                    error: "You need to Login, to Access"
                });
                return;
            }
            
            //Attach Userinfo to Request
            req.USER = user;

            next();
        } catch (error) {
            console.log("Middleware Error:", error);
            res.json({
                success: false,
                error: error
            });
        }
    },    
    validateAdmin: async (req, res, next) => {
        try {
            
            //Get User
            var user = await getAdminData(req);

            if (!user) {
                console.log("No User Data");
                res.status(401).json({
                    success: false,
                    error: "Unauthorized Access Detected"
                });
                return;                
            }            

            //Only Admins
            if (!user.admin) {
                console.log("No Admin Data");
                res.status(401).json({
                    success: false,
                    error: "Unauthorized Access Detected"
                });
                return;                
            }         
            
            //Attach Userinfo to Request
            req.USER = user;

            next();

        } catch (error) {
            console.log("Middleware Error:", error);
            /* 
            res.json({
                success: false,
                error: error.msg
            }); 
            */


            res.status(401).json({
                success: false,
                error: error.msg
            });            
        }
    }
}