const UserModelController = require("../modelControllers/userModelController");



const profileRoutes=(req,res)=>{
    if (req.method === "PATCH" && req.url === "/profile/updateProfile") {
        return UserModelController.updateProfile(req, res);
    }
    if (req.method === "GET" && req.url.startsWith("/profile/getProfile")) { 
        return UserModelController.getProfile(req, res);
    }
}











module.exports=profileRoutes;