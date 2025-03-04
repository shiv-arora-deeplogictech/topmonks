const db = require("../models/moduleModel");
const { getSubmodulesByModuleId } = require("./submoduleModelController");

const moduleModelController = {

async insertModule(moduleData) {
    return new Promise((resolve, reject) => {
        const { module_name, course_id } = moduleData;
        db.run(
            `INSERT INTO modules (module_name, course_id, created_at) 
            VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [module_name, course_id],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
},

async upsertModule(module, courseId) {
    return new Promise((resolve, reject) => {
        if (module.module_id) {
            // Update existing module (no change in no_of_modules)
            db.run(
                `UPDATE modules SET module_name = ? WHERE module_id = ? AND course_id = ?`,
                [module.module_name, module.module_id, courseId],
                function (err) {
                    if (err) return reject(err);
                    resolve(module.module_id);
                }
            );
        } else {
            // Insert new module
            db.run(
                `INSERT INTO modules (module_name, course_id, created_at) 
                 VALUES (?, ?, CURRENT_TIMESTAMP)`,
                [module.module_name, courseId],
                function (err) {
                    if (err) return reject(err);

                    const newModuleId = this.lastID;

                    // Update no_of_modules in courses table
                    db.run(
                        `UPDATE courses SET no_of_modules = no_of_modules + 1 WHERE course_id = ?`,
                        [courseId],
                        function (err) {
                            if (err) return reject(err);
                            resolve(newModuleId);
                        }
                    );
                }
            );
        }
    });
},

// Not used anywhere in the code 
async getModulesByCourseId(courseId) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM modules WHERE course_id = ?`,
            [courseId],
            async (err, modules) => {
                if (err) return reject(err);

                try {
                    for (let module of modules) {
                        module.submodules = await getSubmodulesByModuleId(module.module_id);
                    }
                    resolve(modules);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}
};


module.exports = moduleModelController;
