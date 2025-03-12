const categoryDb = require("../models/categoryModel");
const courseModelController = require("../modelControllers/courseModelController");
const quizModelController = require("../modelControllers/quizModelController");
const questionModelController = require("../modelControllers/questionModelController");
const moduleModelController = require("../modelControllers/moduleModelController");
const submoduleModelController = require("../modelControllers/submoduleModelController");
const SECRET_KEY = process.env.JWT_SECRET || "s0m3R@nd0m$tr0nGKeY!";
const jwt = require("jsonwebtoken");


const courseController =
{

    async createCourse(req, res) {
        let body = "";
        req.on("data", (chunk) => (body += chunk.toString()));
        req.on("end", async () => {
            try {
                const { course_title, course_description, category_title, instructor_id, instructor_img, instructor, designation, duration, thumbnail, modules } = JSON.parse(body);

                if (!course_title || !category_title || !instructor_id || !instructor || !designation || !duration || !Array.isArray(modules) || !instructor_img) {
                    res.setHeader("status", 400);
                    return res.end(JSON.stringify({ message: "Missing required fields or invalid module structure" }));
                }

                // Fetch category_id using category_title
                const category = await new Promise((resolve, reject) => {
                    categoryDb.get("SELECT category_id FROM categories WHERE category_title = ?", [category_title], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });

                if (!category) {
                    res.setHeader("status", 404)
                    return res.end(JSON.stringify({ message: "Category not found" }));
                }

                const category_id = category.category_id;

                // Insert course using model controller
                const courseId = await courseModelController.insertCourse({
                    course_title,
                    course_description,
                    category_id,
                    instructor_id,
                    instructor,
                    designation,
                    duration,
                    thumbnail,
                    no_of_modules: modules.length,
                    instructor_img
                });

                // Insert modules and submodules
                for (const module of modules) {
                    const moduleId = await moduleModelController.insertModule({
                        module_name: module.module_name,
                        course_id: courseId
                    });

                    for (const submodule of module.submodules) {
                        await submoduleModelController.insertSubmodule({
                            submodule_name: submodule.submodule_name,
                            submodule_description: submodule.submodule_description,
                            module_id: moduleId,
                            video: submodule.video
                        });
                    }
                }

                // const quizId=null;
                // if (quiz && quiz.quiz_title && quiz.quiz_duration && Array.isArray(quiz.questions) && quiz.questions.length > 0) {
                //     // Insert quiz
                //     quizId=await createQuizWithQuestions(courseId, quiz);
                // }

                res.setHeader("status", 201)
                res.end(JSON.stringify({
                    code: 201,
                    message: "Course created successfully",
                    course_id: courseId
                    // quiz_id: quizId
                }));
            } catch (err) {
                res.setHeader("status", 500)
                res.end(JSON.stringify({ error: err.message }));
            }
        });
    },



    async updateCourse(req, res) {
        const courseId = req.url.split("/")[4];
        let body = "";

        req.on("data", (chunk) => (body += chunk.toString()));
        req.on("end", async () => {
            try {
                const {
                    course_title,
                    course_description,
                    category_id,
                    instructor_id,
                    instructor_img,
                    instructor,
                    designation,
                    thumbnail,
                    duration,
                    modules
                    // quiz
                } = JSON.parse(body);

                // Create an object with only the provided fields
                const updateFields = {};
                if (course_title) updateFields.course_title = course_title;
                if (course_description) updateFields.course_description = course_description;
                if (category_id) updateFields.category_id = category_id;
                if (instructor_id) updateFields.instructor_id = instructor_id;
                if (instructor) updateFields.instructor = instructor;
                if (designation) updateFields.designation = designation;
                if (thumbnail) updateFields.thumbnail = thumbnail;
                if (duration) updateFields.duration = duration;
                if (instructor_img) updateFields.instructor_img = instructor_img;

                // If no fields are provided, return an error
                if (Object.keys(updateFields).length === 0 && !modules) {
                    res.setHeader("status", 400);
                    return res.end(JSON.stringify({ code: 400, message: "No fields provided for update" }));
                }

                // Update course details
                if (Object.keys(updateFields).length > 0) {
                    await courseModelController.updateCourseModel(courseId, updateFields);
                }

                // Update or Insert Modules
                if (Array.isArray(modules)) {
                    for (const module of modules) {
                        const moduleId = await moduleModelController.upsertModule(module, courseId);

                        // Update or Insert Submodules
                        if (Array.isArray(module.submodules)) {
                            for (const submodule of module.submodules) {
                                await submoduleModelController.upsertSubmodule(submodule, moduleId);
                            }
                        }
                    }
                }

                // Update or Insert Quiz (if provided)
                // if (quiz && quiz.quiz_title && quiz.quiz_duration && Array.isArray(quiz.questions) && quiz.questions.length > 0) {
                //     const quizId = await quizModelController.upsertQuiz(courseId, quiz.quiz_title, quiz.quiz_duration);

                //     await upsertQuestions(quizId, quiz.questions);
                // }


                res.setHeader("status", 200)
                res.end(JSON.stringify({ code: 200, message: "Course updated successfully" }));

            } catch (err) {
                console.error(err);
                res.setHeader("status", 500)
                res.end(JSON.stringify({ code: 500, message: err.message }));
            }
        });
    },



    async getAllCourses(req, res) {
        try {
            const courses = await courseModelController.getAllCoursesModel();

            if (courses.length === 0) {
                res.setHeader("status", 404)
                return res.end(JSON.stringify({ code: 404, message: "No courses found" }));
            }


            res.writeHead(200, { "Content-Type": "application/json" });

            res.end(JSON.stringify({
                code: 200,
                message: "Fetched all courses successfully",
                courses
            }));
        } catch (err) {
            res.setHeader("status", 500)
            res.end(JSON.stringify({ code: 500, message: err.message }));
        }
    },




    //for cards
    async getCoursesForCards(req, res) {
        try {
            const courses = await courseModelController.getActiveCourses();

            if (courses.length === 0) {
                res.setHeader("status", 404)
                return res.end(JSON.stringify({ code: 404, message: "No courses found" }));
            }

            res.setHeader("status", 200)
            res.end(JSON.stringify({
                code: 200,
                message: "Fetched all courses successfully",
                courses
            }));

        } catch (err) {
            res.setHeader("status", 500)
            res.end(JSON.stringify({ code: 500, message: err.message }));
        }
    },

    async getInstructorSingleCourse(req, res) {
        const courseId = req.url.split("/")[4];

        try {
            let courseDetails = await courseModelController.getInstructorSingleCourseModel(courseId);
            if (!courseDetails) {
                res.setHeader("status", 404)
                return res.end(JSON.stringify({ code: 404, message: "Course not found" }));
            }
            const quizData = await quizModelController.getQuizByCourseId(courseId)
            if (!quizData) {
                res.setHeader("status", 200);
                res.end(JSON.stringify({
                    code: 200,
                    message: "Course details fetched successfully",
                    course: courseDetails
                }));
                return;
            }
            const questions = await questionModelController.getQuestionsByQuizId(quizData.quiz_id) || [];

            courseDetails.quiz = quizData;
            courseDetails.quiz.questions = questions;
            res.setHeader("status", 200)
            res.end(JSON.stringify({
                code: 200,
                message: "Course details with quiz details fetched successfully",
                course: courseDetails
            }));

        } catch (err) {
            res.setHeader("status", 500)
            res.end(JSON.stringify({ code: 500, message: err.message }));
        }
    },



    // ✅ Fix: Get instructor courses by instructor_id instead of name
    async getInstructorCourses(req, res) {
        const instructorId = req.url.split("/")[4];
        // console.log(instructorId);

        try {
            const courses = await courseModelController.getInstructorCoursesHelper(instructorId);

            if (courses.length === 0) {
                res.setHeader("status", 404)
                return res.end(JSON.stringify({ code: 404, message: "No courses found for this instructor" }));
            }

            // Convert enrolled from JSON and count enrolled users
            const formattedCourses = courses.map(course => ({
                course_id: course.course_id,
                course_title: course.course_title,
                course_description: course.course_description,
                instructor: course.instructor,
                thumbnail: course.thumbnail,
                duration: course.duration,
                enrolled: JSON.parse(course.enrolled).length,  // Count enrolled users
                status: course.status
            }));

            res.setHeader("status", 200);
            res.end(JSON.stringify({
                code: 200,
                message: "Fetched instructor's courses successfully",
                instructor_id: instructorId,
                courses: formattedCourses
            }));

        } catch (err) {
            res.setHeader("status", 500);
            res.end(JSON.stringify({ code: 500, message: err.message }));
        }
    },

    async togglePublishCourse(req, res) {
        const courseId = req.url.split("/")[4];

        try {
            const course = await courseModelController.getSingleCourse(courseId);

            if (!course) {
                res.setHeader("status", 404)
                return res.end(JSON.stringify({ code: 404, message: "Course not found" }));
            }

            // Toggle status (0 → 1 OR 1 → 0)
            const newStatus = course.status === 1 ? 0 : 1;

            await courseModelController.toggleCourseStatus(courseId, newStatus);

            const statusMessage = newStatus === 1 ? "published" : "unpublished";

            res.setHeader("status", 200)
            res.end(JSON.stringify({ code: 200, message: `Course successfully ${statusMessage}` }));

        } catch (err) {
            res.setHeader("status", 500)
            res.end(JSON.stringify({ code: 500, message: err.message }));
        }
    },




    // FOR Students
    async getCoursesByCategory(req, res) {
        try {

            const authHeader = req.headers["authorization"];
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                res.writeHead(401, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 401, message: "Unauthorized: Missing token" }));
            }

            const token = authHeader.split(" ")[1];
            // Verify Token
            let decoded;
            try {
                decoded = jwt.verify(token, SECRET_KEY);
            } catch (err) {
                console.error("JWT Verification Error:", err);
                res.writeHead(403, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Forbidden: Invalid token' }));
            }

            const userId = decoded.id;
            // console.log(userId); 
            if (!userId) {
                res.writeHead(403, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 403, message: "Forbidden: Invalid token payload" }));
            }


            const parts = req.url.split("/");
            const categoryId = parts[parts.length - 1];

            if (!categoryId || isNaN(categoryId)) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 400, message: "Bad Request: Invalid category ID" }));
            }


            const rows = await courseModelController.getCoursesByCategoryModel(categoryId);
            if (rows.length === 0) {
                res.writeHead(404, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 404, message: "No course found" }));
            }


            const unenrolledCourses = rows.filter(course => {
                const enrolledUsers = JSON.parse(course.enrolled || "[]");
                return !enrolledUsers.includes(userId); // ✅ Exclude enrolled user
            });

            if (unenrolledCourses.length === 0) {
                res.writeHead(404, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 404, message: "No unenrolled courses found" }));
            }

            res.setHeader("status", 200)
            res.end(JSON.stringify({
                code: 200,
                message: "Fetched courses Successfully",
                categoryTitle: unenrolledCourses[0].category_title, // Get category title from DB result
                courses: unenrolledCourses.map(course => ({
                    id: course.course_id,
                    courseTitle: course.course_title,
                    description: course.course_description,
                    instructor: course.instructor,
                    duration: course.duration,
                    thumbnail: course.thumbnail,
                    instructor_img: course.instructor_img,

                    // enrolled: "no", // User is not enrolled
                    rating: course.rating || 4.5 // Default rating if missing
                }))
            }));

        } catch (err) {
            res.setHeader("status", 500)
            return res.end(JSON.stringify({ code: 500, message: err.message }));
        }
    },
    async getCoursesByCategoryLanding(req, res) {
        try {

            const parts = req.url.split("/");
            const categoryId = parts[parts.length - 1];

            if (!categoryId || isNaN(categoryId)) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 400, message: "Bad Request: Invalid category ID" }));
            }


            const rows = await courseModelController.getCoursesByCategoryModel(categoryId);
            if (rows.length === 0) {
                res.writeHead(404, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 404, message: "No course found" }));
            }

            res.setHeader("status", 200)
            res.end(JSON.stringify({
                code: 200,
                message: "Fetched courses Successfully",
                categoryTitle: rows[0].category_title, // Get category title from DB result
                courses: rows.map(course => ({
                    id: course.course_id,
                    courseTitle: course.course_title,
                    description: course.course_description,
                    instructor: course.instructor,
                    duration: course.duration,
                    thumbnail: course.thumbnail,
                    instructor_img: course.instructor_img,

                    // enrolled: "no", // User is not enrolled
                    rating: course.rating || 4.5 // Default rating if missing
                }))
            }));

        } catch (err) {
            res.setHeader("status", 500)
            return res.end(JSON.stringify({ code: 500, message: err.message }));
        }
    },

    async getCourseInfo(req, res) {
        const courseId = req.url.split("/")[4];

        try {

            const authHeader = req.headers["authorization"];
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                res.writeHead(401, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 401, message: "Unauthorized: Missing token" }));
            }

            const token = authHeader.split(" ")[1];

            // Verify Token
            let decoded;
            try {
                decoded = jwt.verify(token, SECRET_KEY);
            } catch (err) {
                console.error("JWT Verification Error:", err);
                res.writeHead(403, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Forbidden: Invalid token' }));
            }

            // Extract userId from Token
            const userId = decoded.id;
            console.log("User ID:", userId);

            if (!userId) {
                res.writeHead(403, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 403, message: "Forbidden: Invalid token payload" }));
            }
            const row = await courseModelController.getCourseInfoModel(courseId, userId);

            if (!row) {
                res.setHeader("status", 404)
                return res.end(JSON.stringify({ code: 404, message: "Course not found" }));
            }

            res.setHeader("status", 200)
            res.end(JSON.stringify({
                code: 200,
                message: "Fetched course info successfully",
                course: row
            }));

        } catch (err) {
            res.setHeader("status", 500)
            res.end(JSON.stringify({ code: 500, message: err.message }));
        }
    },

    async getEnrolledCoursesForUser(req, res) {
        try {
            const authHeader = req.headers["authorization"];
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                res.writeHead(401, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 401, message: "Unauthorized: Missing token" }));
            }

            const token = authHeader.split(" ")[1];
            // Verify Token
            let decoded;
            try {
                decoded = jwt.verify(token, SECRET_KEY);
            } catch (err) {
                console.error("JWT Verification Error:", err);
                res.writeHead(403, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Forbidden: Invalid token' }));
            }

            const userId = decoded.id;
            // console.log(userId);
            if (!userId) {
                res.writeHead(403, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 403, message: "Forbidden: Invalid token payload" }));
            }

            const courses = await courseModelController.getCoursesEnrolled(userId);

            if (courses.length === 0) {
                res.writeHead(404, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 404, message: "No enrolled courses found" }));
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
                code: 200,
                message: "Fetched enrolled courses successfully",
                courses
            }));

        } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ code: 500, message: err.message }));
        }
    },

    async getUnenrolledCoursesForUser(req, res) {
        try {
            // Extract Token from Header
            const authHeader = req.headers["authorization"];
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                res.writeHead(401, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 401, message: "Unauthorized: Missing token" }));
            }

            const token = authHeader.split(" ")[1];

            // Verify Token
            let decoded;
            try {
                decoded = jwt.verify(token, SECRET_KEY);
            } catch (err) {
                console.error("JWT Verification Error:", err);
                res.writeHead(403, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Forbidden: Invalid token' }));
            }

            // Extract userId from Token
            const userId = decoded.id;
            console.log("User ID:", userId);

            if (!userId) {
                res.writeHead(403, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 403, message: "Forbidden: Invalid token payload" }));
            }

            // Fetch Unenrolled Courses
            const courses = await courseModelController.getUnenrolledCourses(userId);

            if (courses.length === 0) {
                res.writeHead(404, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 404, message: "No unenrolled courses found" }));
            }

            // Return Response
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
                code: 200,
                message: "Fetched unenrolled courses successfully",
                courses
            }));

        } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ code: 500, message: err.message }));
        }
    },

    async getPendingCourses(req, res) {
        try {
            // Extract Token from Header
            const authHeader = req.headers["authorization"];
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                res.writeHead(401, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 401, message: "Unauthorized: Missing token" }));
            }

            const token = authHeader.split(" ")[1];

            // Verify Token
            let decoded;
            try {
                decoded = jwt.verify(token, SECRET_KEY);
            } catch (err) {
                console.error("JWT Verification Error:", err);
                res.writeHead(403, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Forbidden: Invalid token' }));
            }

            // Extract userId from Token
            const userId = decoded.id;
            console.log("User ID:", userId);

            if (!userId) {
                res.writeHead(403, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 403, message: "Forbidden: Invalid token payload" }));
            }
            const pendingCourses = await courseModelController.getPendingCourses(userId);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ pendingCourses }));
        } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: error.message }));
        }
    },

    async getCompletedCourses(req, res) {
        try {
            const authHeader = req.headers["authorization"];
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                res.writeHead(401, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 401, message: "Unauthorized: Missing token" }));
            }

            const token = authHeader.split(" ")[1];

            // Verify Token
            let decoded;
            try {
                decoded = jwt.verify(token, SECRET_KEY);
            } catch (err) {
                console.error("JWT Verification Error:", err);
                res.writeHead(403, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Forbidden: Invalid token' }));
            }

            // Extract userId from Token
            const userId = decoded.id;
            console.log("User ID:", userId);

            if (!userId) {
                res.writeHead(403, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ code: 403, message: "Forbidden: Invalid token payload" }));
            }

            const completedCourses = await courseModelController.getCompletedCourses(userId);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ code: 200, data: completedCourses }));
        } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
        }
    },

    async enrollUser(req, res) { 
        
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.writeHead(401, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ code: 401, message: "Unauthorized: Missing token" }));
        }

        const token = authHeader.split(" ")[1];

        // Verify Token
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            console.error("JWT Verification Error:", err);
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Forbidden: Invalid token' }));
        }

        // Extract userId from Token
        const userId = decoded.id;
        console.log("User ID:", userId);

        if (!userId) {
            res.writeHead(403, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ code: 403, message: "Forbidden: Invalid token payload" }));
        }

        let body = "";
    
        req.on("data", chunk => {
            body += chunk.toString();
        });
    
        req.on("end", async () => {
            try {
                    
                const { courseId } = JSON.parse(body); // Get courseId from request body
    
                if (!userId) {
                    res.setHeader("status", 400);
                    return res.end(JSON.stringify({ code: 400, message: "User ID is required" }));
                }
    
                const result = await courseModelController.enrollUserModel(courseId, userId);
                res.setHeader("status", 200);
                res.end(JSON.stringify({ code: 200, message: "User enrolled successfully", enrolled: result.enrolled }));
            } catch (error) {
                res.setHeader("status", 500);
                res.end(JSON.stringify({ code: 500, message: error.message }));
            }
        });
    }
    


};


module.exports = courseController;
