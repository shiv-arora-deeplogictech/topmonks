const courseRoutes=require("./courseRoutes");
const quizRoutes = require("./quizRoutes");

function userRoutes(req,res){
      if(req.url.startsWith("/user/course")){
        return courseRoutes(req,res);
}    
      if(req.url.startsWith("/user/quiz")){
        return quizRoutes(req,res);
      }
}


module.exports=userRoutes;

