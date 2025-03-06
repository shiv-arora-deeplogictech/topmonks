const questionModelController = require("../modelControllers/questionModelController");
const quizModelController = require("../modelControllers/quizModelController");


const quizController = {
    async createQuiz(req, res) {
        let body = "";
        req.on("data", (chunk) => (body += chunk.toString()));
        req.on("end", async () => {
            try {
                const { course_id, quiz_title, quiz_duration, questions } = JSON.parse(body);

                if (!course_id) {
                    throw new Error("Course ID is required to create a quiz"); // course id is re
                }

                if (Array.isArray(questions) && questions.length === 0) {
                    throw new Error("At least one question is required to create a quiz");
                }

                const quizId = await quizModelController.createQuizWithQuestions(course_id, { quiz_title, quiz_duration, questions });

                res.setHeader("status", 201);
                res.end(JSON.stringify({
                    code: 201,
                    message: "Quiz created successfully",
                    quiz_id: quizId
                }));
            } catch (err) {
                res.setHeader("status", 500);
                res.end(JSON.stringify({ code: 500, message: err.message }));
            }
        });
    },

    async getQuiz(req, res) {
        const courseId = req.url.split("/")[3]; 
       
        try {
            if (!courseId) {
                res.setHeader("status", 400);
                return res.end(JSON.stringify({ code: 400, message: "Course ID is required" }));
            }
            
            const quizData = await quizModelController.getQuizByCourseId(courseId);
            
            if (!quizData) {
                res.setHeader("status", 404);
                return res.end(JSON.stringify({ code: 404, message: "No quiz found for this course" }));
            }

            const questions = await questionModelController.getQuestionsByQuizId(quizData.quiz_id) || [];

            const quiz = {
                quiz_id: quizData.quiz_id,
                course_id: quizData.course_id,
                quiz_title: quizData.quiz_title,
                quiz_duration: quizData.quiz_duration,
                questions
            };

            res.setHeader("status", 200);
            res.end(JSON.stringify({
                code: 200,
                message: "Quiz fetched successfully",
                quiz
            }));
        } catch (error) {
            res.setHeader("status", 500);
            res.end(JSON.stringify({ code: 500, message: error.message })); 
        }
    },

    async updateQuiz(req, res) {
        const courseId = req.url.split("/")[4];
        let body = "";
        req.on("data", (chunk) => (body += chunk.toString()));
        req.on("end", async () => {
            try {
                const { quiz_title, quiz_duration, questions } = JSON.parse(body);

                if (!courseId) {
                    throw new Error("Course ID is required to update a quiz");
                }

                const updateFields = {};
                if (quiz_title) updateFields.quiz_title = quiz_title;
                if (quiz_duration) updateFields.quiz_duration = quiz_duration;
                
                if (Object.keys(updateFields).length === 0 && !questions) {
                    res.setHeader("status", 400);
                    return res.end(JSON.stringify({ code: 400, message: "No fields provided for update" }));
                }

                let quiz_id = null;
                if (Object.keys(updateFields).length > 0) {
                    quiz_id = await quizModelController.updatequizModel(courseId, updateFields);
                }

                if (Array.isArray(questions) && questions.length > 0) {
                    for (let question of questions) {
                        await questionModelController.upsertQuestions(quiz_id, question);
                    }
                }
                
                res.setHeader("status", 200);
                res.end(JSON.stringify({
                    code: 200,
                    message: "Quiz updated successfully"
                }));
            } catch (err) {
                res.setHeader("status", 500);
                res.end(JSON.stringify({ code: 500, message: err.message }));
            }
        });
    },

    async deleteQuiz(req, res) {
        const quizId = req.url.split("/")[4];

        if (!quizId) {
            res.setHeader("status", 400);
            return res.end(JSON.stringify({ code: 400, message: "Quiz ID is required" }));
        }

        try {
            await quizModelController.deleteQuestionsByQuizId(quizId);
            const deletedRows = await quizModelController.deleteQuiz(quizId);
            
            if (deletedRows === 0) {
                res.setHeader("status", 404);
                return res.end(JSON.stringify({ code: 404, message: "Quiz not found" }));
            }

            res.setHeader("status", 200);
            res.end(JSON.stringify({ code: 200, message: "Quiz deleted successfully" }));
        } catch (err) {
            res.setHeader("status", 500);
            res.end(JSON.stringify({ code: 500, message: err.message }));
        }
    },

    async deleteQuestion(req, res) {
        const questionId = req.url.split("/")[4];

        if (!questionId) {
            res.setHeader("status", 400);
            return res.end(JSON.stringify({ code: 400, message: "Question ID is required" }));
        }

        try {
            const deletedRows = await questionModelController.deleteQuestion(questionId);
            
            if (deletedRows === 0) {
                res.setHeader("status", 404);
                return res.end(JSON.stringify({ code: 404, message: "Question not found" }));
            }

            res.setHeader("status", 200);
            res.end(JSON.stringify({ code: 200, message: "Question deleted successfully" }));
        } catch (err) {
            res.setHeader("status", 500);
            res.end(JSON.stringify({ code: 500, message: err.message }));
        }
    },

    async getQuizDuration(req,res){
        const courseId = req.url.split("/")[4]; 
        try {
            if (!courseId) {
                res.setHeader("status", 400);
                return res.end(JSON.stringify({ code: 400, message: "Course ID is required" }));
            }

            const quizData = await quizModelController.getQuizDurationModel(courseId);

            if (!quizData) {
                res.setHeader("status", 404);
                return res.end(JSON.stringify({ code: 404, message: "No quiz found for this course" }));
            }

            const quiz = {
                quiz_id: quizData.quiz_id,
                course_id: quizData.course_id,
                quiz_title: quizData.quiz_title,
                quiz_duration: quizData.quiz_duration,
            };

            res.setHeader("status", 200);
            res.end(JSON.stringify({
                code: 200,
                message: "Quiz information fetched successfully",
                quiz
            }));
        } catch (error) {
            res.setHeader("status", 500);
            res.end(JSON.stringify({ code: 500, message: error.message })); 
        } 
    }
};

module.exports = quizController;
