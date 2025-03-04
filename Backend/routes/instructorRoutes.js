
const categoryRoutes = require("./categoryRoutes");
const courseRoutes=require("./courseRoutes");
const quizRoutes = require("./quizRoutes");

function instructorRoutes(req,res){
      if(req.url.startsWith("/instructor/course")){
        return courseRoutes(req,res);
      }

      if(req.url.startsWith("/instructor/category")){
        return categoryRoutes(req,res);
      }

      if(req.url.startsWith("/instructor/quiz")){
        return quizRoutes(req,res);
      }
      
}


module.exports=instructorRoutes;

