const AdminController = require('../controllers/adminController');
const courseController = require('../controllers/courseController');

const url = require('url');

function adminRoutes(req, res) {
    res.setHeader('Content-Type', 'application/json');
    

    

    if (req.url === '/admin/main' && req.method === 'GET') {
        AdminController.viewInstructorRequests(req, res);
    } else if (req.url === '/admin/main' && req.method === 'POST') {
        AdminController.approveInstructor(req, res);
    } else if (req.url === '/admin/courses' && req.method === 'GET') {
        courseController.getAllCourses(req, res);
    } else if (req.url === '/admin/courses' && req.method === 'DELETE') {
        courseController.togglePublishCourse(req, res);
    } else if (req.url === '/admin/users' && req.method === 'GET') {
        AdminController.getUsers(req, res);
    } else if (req.url === '/admin/users' && req.method === 'DELETE') {
        AdminController.deleteUser(req, res);
    } else {
        res.writeHead(404).end(JSON.stringify({ code: 404, message: "Not Found" }));
    }
}

module.exports = adminRoutes;