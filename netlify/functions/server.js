const express = require('express');
const serverless = require('serverless-http');
const { Server } = require('socket.io');

const app = express();
const server = express.Router();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Store active users and rooms
const users = new Map();
const rooms = new Map();

// Socket.IO setup
const io = new Server({
  cors: {
    origin: [
      "https://linklingo.netlify.app",
      "https://linklingo-b9661.netlify.app",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user join
  socket.on('join', () => {
    users.set(socket.id, {
      id: socket.id,
      room: null
    });
    socket.emit('joined');
    broadcastOnlineUsers();
  });

  // Handle find chat partner
  socket.on('findPartner', () => {
    const user = users.get(socket.id);
    if (!user) return;

    // Find available partner
    const availablePartner = Array.from(users.values()).find(u => 
      u.id !== socket.id && !u.room
    );

    if (availablePartner) {
      // Create new room
      const roomId = Math.random().toString(36).substring(2);
      const room = {
        id: roomId,
        users: [user.id, availablePartner.id],
        messages: []
      };
      rooms.set(roomId, room);

      // Update users' room status
      users.get(socket.id).room = roomId;
      users.get(availablePartner.id).room = roomId;

      // Join both users to room
      socket.join(roomId);
      io.sockets.sockets.get(availablePartner.id).join(roomId);

      // Notify both users
      io.to(roomId).emit('chatStarted', {
        roomId,
        users: [user.id, availablePartner.id]
      });
    } else {
      socket.emit('waiting');
    }
  });

  // Handle messages
  socket.on('message', ({ text }) => {
    const user = users.get(socket.id);
    if (user && user.room) {
      const room = rooms.get(user.room);
      if (room) {
        const message = {
          id: Date.now(),
          userId: socket.id,
          text,
          timestamp: new Date()
        };
        
        room.messages.push(message);
        io.to(room.id).emit('message', message);
      }
    }
  });

  // Handle skip
  socket.on('skip', () => {
    const user = users.get(socket.id);
    if (user && user.room) {
      const room = rooms.get(user.room);
      if (room) {
        // Notify other user
        room.users.forEach(userId => {
          if (userId !== socket.id) {
            io.to(userId).emit('partnerLeft', { message: 'Your partner has left the chat' });
          }
        });

        // Clean up room
        room.users.forEach(userId => {
          const u = users.get(userId);
          if (u) u.room = null;
          io.sockets.sockets.get(userId)?.leave(room.id);
        });

        rooms.delete(room.id);
      }
    }
    socket.emit('skipConfirmed');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user && user.room) {
      const room = rooms.get(user.room);
      if (room) {
        // Notify other user
        room.users.forEach(userId => {
          if (userId !== socket.id) {
            io.to(userId).emit('partnerLeft');
          }
        });
        rooms.delete(room.id);
      }
    }
    users.delete(socket.id);
    broadcastOnlineUsers();
  });

  function broadcastOnlineUsers() {
    io.emit('onlineUsers', users.size);
  }
});

// Add static file serving
app.use(express.static('public'));

// Test route
server.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use('/.netlify/functions/server', server);

// Export the serverless function
exports.handler = serverless(app);

// Export io for WebSocket support
module.exports.io = io; 