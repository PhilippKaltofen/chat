/* var app = require('express')(); */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var usersActive = 0;
var roomName = "IMD";
var userIdCount = 1;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');

  app.use(express.static(__dirname + '/public'));

  if(req.url.indexOf('.css') != -1){ //req.url has the pathname, check if it conatins '.css'
    fs.readFile(__dirname + '/public/style.css', function (err, data) {
      if (err) console.log(err);
      res.writeHead(200, {'Content-Type': 'text/css'});
      res.write(data);
      res.end();
    });
  }
});

io.on('connection', function(socket){
	// User connects
	console.log('a user connected');
	usersActive++;
	console.log(usersActive);
  io.emit('server message', "Someone joined the room!", usersActive, roomName);

	// User emits message
  socket.on('chat message', function(msg, userId){
    // check user id
    var newUserId = userId;
    if(userId == 0){
      // give unique id
      newUserId = userIdCount;
      userIdCount++;
    }
    // If message starts with "rn:" change room name
    if(msg[0] == 'r' && msg[1] == 'n' && msg[2] == ':'){ 
      // Remove rn:  
      msg = msg.split(":").pop();   
      roomName = msg;
      io.emit('server message', "Room Name changed to: " + msg, usersActive, roomName);
    } else if(msg[0] == '>'){
      io.emit('>', msg, usersActive, roomName, newUserId);
    } else {
      // Broadcast message
      io.emit('chat message', msg, usersActive, roomName, newUserId);
    }
  });

  // User disconnects
  socket.on('disconnect', function(){
  	console.log('a user disconnected');
  	usersActive--;    
    io.emit('server message', "Someone left the room!", usersActive, roomName);
  });
});

http.listen(process.env.PORT || 3000, function(){
	console.log('listening on *:3000');
});