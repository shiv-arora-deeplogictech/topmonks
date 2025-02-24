const authController = require('../controllers/authController');

const authRoutes = (req,res)=>{
    if(req.url ==="/auth/users/register" && req.method==="POST"){
        authController.userRegister(req,res);
    }
    else if(req.url==="/auth/users/login"&& req.method==="POST"){
        authController.login(req,res);
    } 
    else if(req.url==="/auth/instructor/register"&& req.method==="POST"){
        authController.instructorRegister(req,res);
    } 
    else if(req.url==="/auth/instructor/login"&& req.method==="POST"){
        authController.login(req,res);
    } 
    else if(req.url==="/auth/forgotPass"&& req.method==="POST"){
        authController.forgotPassword(req,res);
    } 
    else if (req.url==="/auth/resetPass"&& req.method==="POST"){
        authController.resetPassword(req,res);
    } 
}

module.exports = authRoutes;
