var express = require('express'),
http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var clients = 0;

server.listen(process.env.PORT || 3000);

//setInterval(() => io.emit('time', new Date().toTimeString()), 5000);
app.use("/", express.static(__dirname + '/'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection',function(socket){

  //clients++;
  //socket.emit('players-online',clients);
  

  //socket.on('disconnect',function(socket){
    //clients--;
  //});

    
  socket.on('replay',function(data){
    socket.to(data).emit('replay',null);
  });

  socket.on('leave',function(data){
    socket.to(data).emit('leave',null);
  });


  socket.on('new-game',function(data){
    
    socket.to(data[0]).emit('new-game',data);
  });

  socket.on('get-id',function(data){
    socket.emit('get-id',socket.id);
  });


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
