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
        db.get(
            `SELECT enrolled FROM courses WHERE course_id = 
                (SELECT course_id FROM modules WHERE module_id = ?)`,
            [moduleId],
            (err, course) => {
                if (err) return reject(err);
                if (!course) return resolve([]);

                const enrolledUsers = JSON.parse(course.enrolled || "[]"); 
                const isEnrolled = enrolledUsers.includes(userId); 

                db.all(
                    `SELECT submodule_id, submodule_name, submodule_description, module_id, created_at 
                    ${isEnrolled ? ', video' : ''} 
                     FROM submodules 
                     WHERE module_id = ?`,
                    [moduleId],
                    (err, submodules) => {
                        if (err) return reject(err);
                        resolve(submodules);
                    }
                );
            }
        );
    });
}

};

module.exports = submoduleModelController;
