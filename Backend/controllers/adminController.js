const InstructorRequest = require('../models/instructorRequests');
const Course = require('../modelController/adminModelController');
const Role = require('../modelController/adminModelController');

class AdminController {
    static async viewInstructorRequests(req, res) {
        try {
            const requests = await InstructorRequest.getAllPending();
            res.end(JSON.stringify({ message: 'Pending Instructor Requests', requests }));
        } catch (err) {
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }

    static async approveInstructor(req, res) {
        try {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', async () => {
                const { user } = JSON.parse(body);
                await InstructorRequest.approve(user);
                res.end(JSON.stringify({ message: 'Instructor request approved' }));
            });
        } catch (err) {
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }
// not working due to no intergration
    static async getAllCourses(req, res) {
        try {
            const courses = await Course.getAll();
            res.end(JSON.stringify({ message: 'Available Courses', courses }));
        } catch (err) {
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }
// not working due to no integration
    static async deleteCourse(req, res) {
        try {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', async () => {
                const { course_id } = JSON.parse(body);
                await Course.delete(course_id);
                res.end(JSON.stringify({ message: 'Course deleted successfully' }));
            });
        } catch (err) {
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }
    static async getAllRoles(req, res) {
        try {
            const roles = await Role.getAllRoles();
            res.end(JSON.stringify({ message: 'Available Roles', roles }));
        } catch (err) {
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }

    static async deleteRole(req, res) {
        try {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', async () => {
                const { role } = JSON.parse(body);
                await Role.deleteRole(role);
                res.end(JSON.stringify({ message: `Role '${role}' deleted successfully` }));
            });
        } catch (err) {
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }
}

module.exports = AdminController;