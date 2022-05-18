let chatRepository=require("./chatRepository");



exports.storeChatHistory=async(history)=>{
    console.log("controller");
    try{
        let result=await chatRepository.storeChatHistory(history);
        if(result.acknowledged){
          let id=result.insertedId;
          return id;
            
        }
       
    }
       catch(EX){
           console.log(EX);
       } 
    }