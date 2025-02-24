const InstructorRequest = require('../modelController/instructorModelController');
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
                const { user_id, action, user } = JSON.parse(body);

                // Fetch user details from instructor_requests
                const instructor = await InstructorRequest.getRequestById(user_id);
                if (!instructor || instructor.status !== 'pending') {
                    return res.writeHead(404).end(JSON.stringify({ code: 404, message: 'User not found or not pending approval' }));
                }

                if (action === 'approve') {
                    // Move user to the users table with role 'instructor'
                    await InstructorRequest.approve(user);
                    return res.writeHead(200).end(JSON.stringify({
                        code: 200,
                        message: 'Instructor request approved',
                        user: {
                            user_id: user_id,
                            name: user.name,
                            email: user.email,
                            role: 'instructor',
                            status: 'approved'
                        }
                    }));
                } else if (action === 'decline') {
                    // Update instructor_requests status to 'declined'
                    await InstructorRequest.reject(user_id);
                    return res.writeHead(200).end(JSON.stringify({
                        code: 200,
                        message: 'Instructor request declined',
                        user: {
                            user_id: user_id,
                            status: 'declined'
                        }
                    }));
                } else {
                    return res.writeHead(400).end(JSON.stringify({ code: 400, message: 'Invalid request data' }));
                }
            });
        } catch (err) {
            res.writeHead(500).end(JSON.stringify({ code: 500, message: 'Internal Server Error' }));
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