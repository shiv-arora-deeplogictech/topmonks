const db = require("../models/questionModel");

// Insert multiple questions for a quiz
const questionModelController = {
async insertQuestion(quizId, question) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(
            `INSERT INTO questions (quiz_id, question_title, options, correct_ans) VALUES (?, ?, ?, ?)`
        );

            stmt.run(
                quizId,
                question.question_title,
                JSON.stringify(question.options),
                JSON.stringify(question.correct_ans)
            );
        

        stmt.finalize((err) => {
            if (err) reject(err);
            resolve(true);
        });
    });
},

// Fetch questions by quiz ID
async getQuestionsByQuizId(quizId) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT question_id, question_title, options, correct_ans FROM questions WHERE quiz_id = ?`,
            [quizId],
            (err, rows) => {
                if (err) reject(err);
                // Parse JSON fields before returning
                rows.forEach((row) => {
                    row.options = JSON.parse(row.options);
                    row.correct_ans = JSON.parse(row.correct_ans);
                });
                resolve(rows);
            }
        );
    });
},
async upsertQuestions(quiz_id, question) {
    if (question.question_id) {
        const updated_fields = {};
        if(question.question_title) updated_fields.question_title = question.question_title;
        if(question.options) updated_fields.options = JSON.stringify(question.options)
        if(question.correct_ans) updated_fields.correct_ans = JSON.stringify(question.correct_ans)
        const fields = Object.keys(updated_fields);
        const values = Object.values(updated_fields);
        const setClause = fields.map((field) => `${field} = ?`).join(", ");
        const query = `UPDATE questions SET ${setClause} WHERE question_id = ?`;

        return new Promise((resolve, reject) => {
            db.run(query, [...values, question.question_id], function (err) {
                if (err) return reject(err);
                resolve(true);
            });
        });
    } else {
        return await questionModelController.insertQuestion(quiz_id, question); // Insert and return new question_id
    }
},

async deleteQuestion(questionId) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM questions WHERE question_id = ?`, [questionId], function (err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
}



};

module.exports = questionModelController;
