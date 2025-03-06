const quizController= require("../controllers/quizController");

function quizRoutes(req,res){
    if (req.method === "POST" && req.url === "/instructor/quiz/createQuiz") {
        return quizController.createQuiz(req, res);
    }

    if (req.method === "PATCH" && req.url.startsWith("/instructor/quiz/updateQuiz")) {
        return quizController.updateQuiz(req, res);
    }

    if (req.method === "GET" && req.url.startsWith("/quiz/getQuiz")) {
        return quizController.getQuiz(req, res);
    }

    
    if (req.method === "GET" && req.url.split("?")[0].startsWith("/user/quiz/getQuizDuration")) {
        return quizController.getQuizDuration(req, res);
    }
    
    
    if (req.method === "DELETE" && req.url.startsWith("/instructor/quiz/deleteQuiz")) {
        return quizController.deleteQuiz(req, res);
    }

    if (req.method === "DELETE" && req.url.startsWith("/instructor/quiz/deleteQuestion")) {
        return quizController.deleteQuestion(req, res);
    }
    
}




module.exports=quizRoutes;