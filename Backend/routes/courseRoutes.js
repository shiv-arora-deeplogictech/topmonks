
const courseController = require("../controllers/courseController");
function courseRoutes(req, res) {
    if (req.method === "POST" && req.url === "/instructor/course/createCourse") {
        return courseController.createCourse(req, res);
    }
    // // Endpoint for fetching courses by category

    if (req.method === "PATCH" && req.url.startsWith("/instructor/course/updateCourse")) {
        return courseController.updateCourse(req, res);
    }

    if (req.method === "GET" && req.url.startsWith("/instructor/course/getInstructorCourses")) {
        return courseController.getInstructorCourses(req, res);
    }

    if (req.method === "GET" && req.url.startsWith("/instructor/course/getInstructorSingleCourse")) {
        return courseController.getInstructorSingleCourse(req, res);
    }

    if (req.method === "PATCH" && req.url.startsWith("/instructor/course/togglePublishCourse")) {
        return courseController.togglePublishCourse(req, res);
    }

    if (req.method === "GET" && req.url.startsWith("/user/course/getCoursesForCards")) {  
        return courseController.getCoursesForCards(req, res);
    }

    if (req.method === "GET" && req.url.startsWith("/user/course/getCoursesByCategory")) {
        return courseController.getCoursesByCategory(req, res);
    }
    if (req.method === "GET" && req.url.startsWith("/user/course/landingPage")) {
        return courseController.getCoursesByCategoryLanding(req, res);
    }

    if (req.method === "GET" && req.url.startsWith("/user/course/getCourseInfo")) {
        return courseController.getCourseInfo(req, res);
    }
    if (req.method === "GET" && req.url.startsWith("/user/course/getEnrolledCourse")) {
        return courseController.getEnrolledCoursesForUser(req, res);
    }
    if (req.method === "GET" && req.url.startsWith("/user/course/getUnenrolledCourse")) {
        return courseController.getUnenrolledCoursesForUser(req, res);
    }
    if (req.method === "GET" && req.url.startsWith("/user/course/getPendingCourse")) {
        return courseController.getPendingCourses(req, res);
    }
    if (req.method === "GET" && req.url.startsWith("/user/course/getCompletedCourse")) {
        return courseController.getCompletedCourses(req, res);
    }
    if (req.method === "PATCH" && req.url.startsWith("/user/course/enrollUser")) {
        return courseController.enrollUser(req, res);
    }

}

module.exports = courseRoutes;
