const db = require("../models/subModuleModel");

const submoduleModelController = {
async insertSubmodule(submoduleData) {
    return new Promise((resolve, reject) => {
        const { submodule_name, submodule_description, module_id, video } = submoduleData;
        db.run(
            `INSERT INTO submodules (submodule_name, submodule_description, module_id, video, created_at) 
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [submodule_name, submodule_description, module_id, video || null],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
},
async upsertSubmodule(submodule, moduleId) {
    return new Promise((resolve, reject) => {
        if (submodule.submodule_id) {
            // Update existing submodule
            db.run(
                `UPDATE submodules SET 
                    submodule_name = ?, 
                    submodule_description = ?, 
                    video = ?, 
                 WHERE submodule_id = ? AND module_id = ?`,
                [submodule.submodule_name, submodule.submodule_description, submodule.video, submodule.submodule_id, moduleId],
                function (err) {
                    if (err) reject(err);
                    else resolve(submodule.submodule_id);
                }
            );
        } else {
            // Insert new submodule
            db.run(
                `INSERT INTO submodules (submodule_name, submodule_description, module_id, video, created_at) 
                 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [submodule.submodule_name, submodule.submodule_description, moduleId, submodule.video || null],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        }
    });
},

// Not used anywhere in the code
async getSubmodulesByModuleId(moduleId, userId) {
    return new Promise((resolve, reject) => {
        // Get the enrolled list from the course that contains this module
        db.get(
            `SELECT enrolled FROM courses WHERE course_id = 
                (SELECT course_id FROM modules WHERE module_id = ?)`,
            [moduleId],
            (err, course) => {
                if (err) {
                    console.error("Database error while fetching enrolled users:", err);
                    return reject(err);
                }

                if (!course) {
                    console.log(`No course found for module_id ${moduleId}`);
                    return resolve([]); // No course, no submodules
                }

                let enrolledUsers = [];

                try {
                    // Parse the enrolled JSON string to get the array
                    enrolledUsers = course.enrolled
                        ? JSON.parse(course.enrolled)
                        : [];
                } catch (parseError) {
                    console.error(`Error parsing enrolled field for course:`, parseError);
                    return reject(parseError);
                }

                // Check if the user is enrolled in this course
                const isEnrolled = Array.isArray(enrolledUsers) &&
                enrolledUsers.includes(userId); 

                console.log(`User ${userId} is ${isEnrolled ? '' : 'NOT '}enrolled in course`);

                // Select submodules, include 'video' only if enrolled
                const query = `
                    SELECT submodule_id, submodule_name, submodule_description, module_id
                    ${isEnrolled ? ', video' : ''} 
                    FROM submodules 
                    WHERE module_id = ?
                `;

                db.all(query, [moduleId], (err, submodules) => {
                    if (err) {
                        console.error("Database error while fetching submodules:", err);
                        return reject(err);
                    }

                    resolve(submodules);
                });
            }
        );
    });
}


};

module.exports = submoduleModelController;
