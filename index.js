var express = require('express'),
http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(process.env.PORT || 3000);


//setInterval(() => io.emit('time', new Date().toTimeString()), 5000);
app.use("/", express.static(__dirname + '/'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection',function(socket){
    console.log("new connection");

    //give ids to new users
    socket.emit("get-id",socket.id);



    socket.on('request',function(data){

      //Data = host id
      //Sends id of guest to host
      socket.to(data).emit("request",socket.id);

      //From host to guest with game setup
      if(Array.isArray(data)){
        socket.to(data[1]).emit('request',data);
      }
    });


    //Relay that the turn is over
    socket.on('turn-over',function(data){
      socket.to(data[2]).emit('turn-over',[data[0],data[1]]);
    });

    socket.on('win',function(data){
      socket.to(data[2]).emit('win',data);
    });

    
});
