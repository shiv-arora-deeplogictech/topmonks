const db = require("../models/quizModel");
const questionModelController = require("./questionModelController");

const quizModelController = {
    async insertQuiz(courseId, quizTitle, quizDuration) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO quizzes (course_id, quiz_title, quiz_duration) VALUES (?, ?, ?)`,
                [courseId, quizTitle, quizDuration],
                function (err) {
                    if (err) return reject(err);
                    resolve(this.lastID); // Returns the new quiz_id
                }
            );
        });
    },

    async getQuizByCourseId(courseId) {
        console.log(courseId);
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM quizzes WHERE course_id = ?`,
                [courseId],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                }
            );
        });
    },

    async getQuizDurationModel(courseId) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM quizzes WHERE course_id = ?`,
                [courseId],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                }
            );
        });
    },

    async createQuizWithQuestions(courseId, quizData) {
        if (!quizData || !quizData.quiz_title || !quizData.quiz_duration || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
            throw new Error("Invalid quiz data");
        }

        // Insert quiz      
        const quizId = await quizModelController.insertQuiz(courseId, quizData.quiz_title, quizData.quiz_duration);

        // Insert questions
        if(Array.isArray(quizData.questions) && quizData.questions.length > 0){
            for(let question of quizData.questions){
                await questionModelController.insertQuestion(quizId, question);
                }
        }
        return quizId; // Return the quiz ID
    },

    async updatequizModel(courseId, updateFields) {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(updateFields);
            const values = Object.values(updateFields);
    
            if (fields.length === 0) return resolve(null); // No fields to update
    
            const setClause = fields.map((field) => `${field} = ?`).join(", ");
            const query = `UPDATE quizzes SET ${setClause} WHERE course_id = ?`;
            db.run(query, [...values, courseId], function (err) {
                if (err) return reject(err);
                if (this.changes === 0) return resolve(null); // No rows updated
    
                // Fetch quiz_id after update
                db.get(`SELECT quiz_id FROM quizzes WHERE course_id = ?`, [courseId], (err, row) => {
                    if (err) return reject(err);
                    resolve(row ? row.quiz_id : null);
                });
            });
        });
    },

    async deleteQuiz(quizId) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM quizzes WHERE quiz_id = ?`, [quizId], function (err) {
                if (err) return reject(err);
                resolve(this.changes); // Returns number of rows deleted
            });
        });
    },
    async deleteQuestionsByQuizId(quizId) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM questions WHERE quiz_id = ?`, [quizId], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }
    
};

module.exports = quizModelController;
