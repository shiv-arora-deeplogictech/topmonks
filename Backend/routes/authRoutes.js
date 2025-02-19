const authController = require('../controllers/authController');

const authRoutes = (req,res)=>{
    if(req.url ==="/users/register" && req.method==="POST"){
        authController.register(req,res);
    }
    else if(req.url==="/users/login"&& req.method==="POST"){
        authController.login(req,res);
    } 
    else if(req.url==="/users/forgotPass"&& req.method==="POST"){
        authController.forgotPassword(req,res);
    } 
    else if (req.url==="/users/resetPass"&& req.method==="POST"){
        authController.resetPassword(req,res);
    } 
}

module.exports = authRoutes;
