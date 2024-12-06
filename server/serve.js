const { log } = require('console');
const http = require('http');
const socketio = require('socket.io');

// create a server
const httpServer = http.createServer();

// pass server and upgrade to websocket connection
const io = new socketio.Server(httpServer, {
  cors: {
    origin: "http://127.0.0.1:5500"
  }
});

// const clients = new Map();
// on new client connection
io.on('connection', socket => {
  console.log('Client connected with Id: ', socket.id);
  
  // clients.set(socket.id, socket);
  io.emit('new-client', socket.id);
  
  const clients = [];
  io.sockets.sockets.forEach(socket => {
    console.log(socket.id);
    clients.push(socket.id);
  })
  
  socket.emit('get-all-clients', clients);
    
  // receive message from client
  socket.on('send-message', (message, receiver, sender, messageDelivered) => {

    if(receiver === '') {
      // broadcast message to client in server
      socket.broadcast.emit('receive-message', message, receiver);
    } else {
      // broadcast message to client in same room
      socket.to(receiver).emit('receive-message', message, receiver, sender);
    }
    console.log(message);
    console.log(receiver);
    // callback function from client
    messageDelivered(message, receiver, sender)
    
  })

  // receive join req to client
  socket.on('join-room', (id, cb) => {
    socket.join(id);
    cb(id);
    console.log(id);
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  })
})


httpServer.listen(8080, () => {
  console.log("listening to port: 8080");
  
})