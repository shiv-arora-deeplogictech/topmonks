const db = require("../models/courseModel");
const { getModulesByCourseId } = require("./moduleModelController");

const courseModelController = {
    
async insertCourse(courseData) {
    return new Promise((resolve, reject) => {
        const { course_title, course_description, category_id, instructor_id, instructor, designation, duration, thumbnail,no_of_modules,instructor_img } = courseData;
        db.run(
            `INSERT INTO courses (course_title, course_description, category_id, instructor_id, instructor, designation, duration, thumbnail, enrolled, no_of_modules, instructor_img, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,CURRENT_TIMESTAMP)`,
            [course_title, course_description, category_id, instructor_id, instructor, designation, duration, thumbnail, JSON.stringify([]), no_of_modules, instructor_img],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
},

async updateCourseModel(courseId, updateFields) {
    return new Promise((resolve, reject) => {
        const fields = Object.keys(updateFields);
        const values = Object.values(updateFields);

        if (fields.length === 0) return resolve(); // No fields to update

        const setClause = fields.map((field) => `${field} = ?`).join(", ");
        const query = `UPDATE courses SET ${setClause} WHERE course_id = ?`;

        db.run(query, [...values, courseId], function (err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
},

async getAllCoursesModel() {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT c.*, cat.category_title 
             FROM courses c 
             JOIN categories cat ON c.category_id = cat.category_id`,
            [],
            async (err, courses) => {
                if (err) return reject(err);

                try {
                    for (let course of courses) {
                        // Convert enrolled string to count
                        course.enrolled = JSON.parse(course.enrolled).length;

                        // Fetch modules for this course
                        course.modules = await new Promise((res, rej) => {
                            db.all(
                                `SELECT * FROM modules WHERE course_id = ?`,
                                [course.course_id],
                                async (err, modules) => {
                                    if (err) return rej(err);

                                    for (let module of modules) {
                                        // Fetch submodules for each module
                                        module.submodules = await new Promise((resolveSub, rejectSub) => {
                                            db.all(
                                                `SELECT * FROM submodules WHERE module_id = ?`,
                                                [module.module_id],
                                                (err, submodules) => {
                                                    if (err) return rejectSub(err);
                                                    resolveSub(submodules);
                                                }
                                            );
                                        });
                                    }

                                    res(modules);
                                }
                            );
                        });
                    }

                    resolve(courses);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
},


async getActiveCourses() {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT courses.course_id, courses.course_title, courses.course_description, courses.instructor, 
                    courses.duration 
             FROM courses
             JOIN categories ON courses.category_id = categories.category_id
             WHERE courses.status = 1`, //Only fetch active courses
            [],
            (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            }
        );
    });
},

async getSingleCourse(courseId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM courses WHERE course_id = ?`,
            [courseId],
            (err, row) => {
                if (err) reject(err);
                resolve(row);
            }
        );
    });
},

async toggleCourseStatus(courseId, newStatus) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE courses SET status = ? WHERE course_id = ?`,
            [newStatus, courseId],
            (err) => {
                if (err) reject(err);
                resolve();
            }
        );
    });
},


async getInstructorCoursesHelper(instructorId) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT course_id, course_title, instructor, course_description, duration, thumbnail, enrolled, status 
             FROM courses WHERE instructor_id = ?`,
            [instructorId],
            (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            }
        );
    });
},

async getInstructorSingleCourseModel(courseId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT c.*, cat.category_title 
             FROM courses c 
             JOIN categories cat ON c.category_id = cat.category_id 
             WHERE c.course_id = ?`,
            [courseId],
            async (err, course) => {
                if (err) reject(err);
                if (!course) return resolve(null);

                try {
                    // Fetch modules
                    const modules = await new Promise((res, rej) => {
                        db.all(
                            `SELECT * FROM modules WHERE course_id = ?`,
                            [courseId],
                            (err, rows) => {
                                if (err) rej(err);
                                res(rows);
                            }
                        );
                    });

                    // Fetch submodules for each module
                    for (let module of modules) {
                        module.submodules = await new Promise((res, rej) => {
                            db.all(
                                `SELECT * FROM submodules WHERE module_id = ?`,
                                [module.module_id],
                                (err, rows) => {
                                    if (err) rej(err);
                                    res(rows);
                                }
                            );
                        });
                    }

                    // Convert enrolled string to count
                    course.enrolled = JSON.parse(course.enrolled).length;
                    course.modules = modules;
                     
                    resolve(course);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
},

async getCoursesByCategoryModel(categoryId) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT courses.course_id, courses.course_title, courses.course_description, 
                    courses.instructor, courses.duration, courses.enrolled,courses.thumbnail,courses.instructor_img
             FROM courses   
             JOIN categories ON courses.category_id = categories.category_id
             WHERE categories.category_id = ? AND courses.status = 1`, // Fetch active courses only
            [categoryId],
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            }
        );
    });
},

async getCourseInfoModel(courseId,userId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT courses.course_id, courses.course_title, courses.course_description, 
                    courses.instructor, courses.duration, courses.instructor_img,courses.designation
             FROM courses 
             WHERE courses.course_id = ?`,
            [courseId],
            async (err, course) => {
                if (err) return reject(err);
                if (!course) return resolve(null);

                try {
                    // Fetch modules and submodules using helper function
                    const modules = await getModulesByCourseId(course.course_id,userId);

                 
                   
                    course.modules = modules; // Attach modules & submodules

                    resolve(course);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
},

async getCoursesEnrolled(userId) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM courses`, [], (err, rows) => {
            if (err) {
                console.error("Database error:", err);
                return reject(err);
            }

            const enrolledCourses = [];

            rows.forEach((course) => {
                try {
                    const enrolledUsers = JSON.parse(course.enrolled);
                
                    if (Array.isArray(enrolledUsers) && enrolledUsers.includes(userId)) {
                        enrolledCourses.push(course);
                    }
                } catch (parseError) {
                    console.error(`Error parsing enrolled field for course_id ${course.course_id}:`, parseError);
                }
            });
            resolve(enrolledCourses);
        });
    });
},

async getUnenrolledCourses(userId) {
    
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM courses`, [], (err, rows) => {
            if (err) {
                console.error("Database error:", err);
                return reject(err);
            }

            const unenrolledCourses = [];

            rows.forEach((course) => {
                try {
                    // Parse enrolled users as JSON
                    const enrolledUsers = course.enrolled
                        ? JSON.parse(course.enrolled)
                        : [];

                    // If not enrolled, add to unenrolled courses list
                    if (
                        Array.isArray(enrolledUsers) &&
                        !enrolledUsers.includes(userId)
                    ) {
                        unenrolledCourses.push(course);
                    }
                } catch (parseError) {
                    console.error(
                        `Error parsing enrolled field for course_id ${course.course_id}:`,
                        parseError
                    );
                }
            });
            resolve(unenrolledCourses);
        });
    });
},


async getPendingCourses(userId) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT c.*
        FROM courses c
        JOIN (
            SELECT course_id, COUNT(*) AS total_modules, SUM(completed) AS completed_modules
            FROM modules
            GROUP BY course_id
        ) m ON c.course_id = m.course_id
        WHERE m.total_modules > m.completed_modules
        AND EXISTS (
            SELECT 1 FROM json_each(c.enrolled) 
            WHERE value = ?
        );
    `;

        db.all(query, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
},

async getCompletedCourses(userId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT c.*
            FROM courses c
            JOIN (
                SELECT course_id, COUNT(*) AS total_modules,
                       SUM(completed) AS completed_modules
                FROM modules
                GROUP BY course_id
            ) m ON c.course_id = m.course_id
            WHERE m.total_modules = m.completed_modules
            AND EXISTS (
                SELECT 1 FROM json_each(c.enrolled) 
                WHERE value = ?
            );
        `;

        db.all(query, [userId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
},

async enrollUserModel(courseId, userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT enrolled FROM courses WHERE course_id = ?`, [courseId], (err, course) => {
            if (err) return reject(err);
            if (!course) return reject(new Error("Course not found"));

            // Parse the enrolled field (always expected to be a JSON string)
            let enrolledUsers=[];
            try {
                enrolledUsers = Array.isArray(JSON.parse(course.enrolled))?JSON.parse(course.enrolled):[];
            } catch (parseError) {
                return reject(new Error("Invalid enrolled data format"));
            }

            // Check if user is already enrolled
            if (enrolledUsers.includes(userId)) {
                return reject(new Error("User already enrolled"));
            }

            // Add userId to the array
            enrolledUsers.push(userId);

            // Convert back to JSON string
            const updatedEnrolled = JSON.stringify(enrolledUsers);

            // Update the enrolled field in the database
            db.run(
                `UPDATE courses SET enrolled = ? WHERE course_id = ?`,
                [updatedEnrolled, courseId],
                function (err) {
                    if (err) return reject(err);
                    resolve({
                        message: "User enrolled successfully",
                        enrolled: enrolledUsers,
                    });
                }
            );
        });
    });
}




}


module.exports = courseModelController;