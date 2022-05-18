let dbConnection=require("./dbconfig/config");


exports.storeChatHistory=(history)=>{
   // console.log(history);
   return dbConnection.getCollection("ChatHistory").insertOne(history)
    
}