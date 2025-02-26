const AdminController = require('../controllers/adminController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const url = require('url');

function adminRoutes(req, res) {
    res.setHeader('Content-Type', 'application/json');
    

    function handleAuth(allowedRoles, callback) {
        AuthMiddleware.authenticate(allowedRoles)(req, res, () => callback());
    }

    if (req.url === '/admin/main' && req.method === 'GET') {
        handleAuth(['admin'], () => AdminController.viewInstructorRequests(req, res));
    } else if (req.url === '/admin/main' && req.method === 'POST') {
        handleAuth(['admin'], () => AdminController.approveInstructor(req, res));
    } else if (req.url === '/admin/courses' && req.method === 'GET') {
        handleAuth(['admin'], () => AdminController.getAllCourses(req, res));
    } else if (req.url === '/admin/courses' && req.method === 'DELETE') {
        handleAuth(['admin'], () => AdminController.deleteCourse(req, res));
    } else if (req.url === '/admin/users' && req.method === 'GET') {
        handleAuth(['admin'], () => AdminController.getAllUsers(req, res));
    } else if (req.url === '/admin/users' && req.method === 'DELETE') {
        handleAuth(['admin'], () => AdminController.deleteUser(req, res));
    } else {
        res.writeHead(404).end(JSON.stringify({ code: 404, message: "Not Found" }));
    }
}

module.exports = adminRoutes;