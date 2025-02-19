const authController = require('../controllers/authController');

const authRoutes = {
    "/users/register": authController.register,
    "/users/login": authController.login,
    "/users/forgotPass": authController.forgotPassword,
    "/users/resetPass": authController.resetPassword
};

module.exports = authRoutes;
