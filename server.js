let express = require("express");
let fs=require("fs");
let Controller=require("./chatController");
let app = express();
let http = require("http").createServer(app);
let io = require("socket.io")(http);
let dbConnection=require("./dbconfig/config");
dbConnection.connect();
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get('/chathistory', function(req, res){
  res.download('chatlog.txt');
});
let count = 0;
let service;
let name;
let day;
let ChatId;
io.on("connection", (socket) => {

  console.log("client is connected");
  count=0;
  welcomemsg="Hello Beautiful!!Welcome to GreatClips stylist booking ChatBot,Plese Mention your name..."
  socket.emit(
    "obj0",
    welcomemsg
  );
  fs.writeFileSync("chatlog.txt","Bot : "+welcomemsg+"\n");
  socket.on("obj", (msg) => {
    count++;
    console.log("Web Server: " + msg);
    if (count == 1){
      name=msg;
        socket.emit(
            "obj1",
            "Bot: Hi " + msg + " Are you intrested in booking an appoinment?"
          );
          //chatlog
          fs.appendFileSync("chatlog.txt","Client : "+name+"\n");
          fs.appendFileSync("chatlog.txt","Bot: Hi " + msg + " Are you intrested in booking an appoinment?"+"\n");
    }
     
      if(count==2){
        day=msg;
        socket.emit(
            "time",
            "Bot: Please choose the time.."
          );
          fs.appendFileSync("chatlog.txt","Client : "+day+"\n");
    fs.appendFileSync("chatlog.txt","Bot: Please choose the time.."+"\n");
      }
  });
  //Appoinment
  socket.on("appointment", (msg) => {
    if (msg == "no") {
      socket.emit(
        "appNo",
        "Bot : Thanks for reaching out as..For other services plese call to our help line 747 587 7821"
      );
      fs.appendFileSync("chatlog.txt","Client : No"+"\n");
      fs.appendFileSync("chatlog.txt","Bot : Thanks for reaching out as..For other services plese call to our help line 747 587 7821"+"\n");
      //Save chathistory to db
      fs.readFile("chatlog.txt",(err,data)=>{
     
        if(!err){
  
          chat={client:name,chat:data.toString()};
          chatString=JSON.stringify(chat);
          chatJson=JSON.parse(chatString);
          //console.log(chatJson);
        Controller.storeChatHistory(chatJson).then(data=>{
          ChatId=data;
        });
         
  
        }
      })
    }
    if (msg == "yes") {
      socket.emit(
        "appYes",
        "Bot : Great,let's get you an appointment.Please choose the service..."
      );
      fs.appendFileSync("chatlog.txt","Client : Yes"+"\n");
      fs.appendFileSync("chatlog.txt","Bot : Great,let's get you an appointment.Please choose the service..."+"\n");
    }
  });
  //services
  socket.on("service", (msg) => {
      service=msg;
    socket.emit(
      "day",
      "Bot : which day (ex: 1st June or 06-01-2022) "
    );
    fs.appendFileSync("chatlog.txt","Client : "+service+"\n");
    fs.appendFileSync("chatlog.txt","Bot : which day (ex: 1st June or 06-01-2022) "+"\n");
  });

  //Time selection & End message
  socket.on("timeselected", (msg) => {
    socket.emit(
      "obj0",
      "Thanks "+name+"!!! You are booked for a "+service+" at"+msg+" on"+day+".I will send you a reminder here the day before :).Please download the Chat history."
    );
    fs.appendFileSync("chatlog.txt","Client : "+msg+"\n");
    fs.appendFileSync("chatlog.txt","Thanks "+name+"!!! You are booked for a "+service+" at"+msg+" on"+day+".I will send you a reminder here the day before :).Please download the Chat history.");
    //save chathistory to DB
    fs.readFile("chatlog.txt",(err,data)=>{
     
      if(!err){

        chat={client:name,chat:data.toString()};
        chatString=JSON.stringify(chat);
        chatJson=JSON.parse(chatString);
        //console.log(chatJson);
      Controller.storeChatHistory(chatJson).then(data=>{
        ChatId=data;
      });
       

      }
    })
  });

});

http.listen(3000, () => {
  console.log("server is up");
});
