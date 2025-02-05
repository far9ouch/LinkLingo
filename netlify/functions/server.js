const express = require('express');
const serverless = require('serverless-http');
const { Server } = require('socket.io');

const app = express();
const server = express.Router();

// Global variables to track users and rooms
let onlineUsers = 0;
const users = new Map();
const rooms = new Map();

// Socket.IO setup with custom adapter
const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  adapter: {
    rooms: new Map(),
    sids: new Map(),
    broadcast() {
      // Custom broadcast implementation
    }
  }
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  onlineUsers++;
  io.emit('onlineUsers', onlineUsers);

  socket.on('join', () => {
    users.set(socket.id, {
      id: socket.id,
      room: null
    });
    socket.emit('joined');
    io.emit('onlineUsers', onlineUsers);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    onlineUsers = Math.max(0, onlineUsers - 1);
    const user = users.get(socket.id);
    if (user && user.room) {
      const room = rooms.get(user.room);
      if (room) {
        room.users.forEach(userId => {
          if (userId !== socket.id) {
            io.to(userId).emit('partnerLeft');
          }
        });
        rooms.delete(room.id);
      }
    }
    users.delete(socket.id);
    io.emit('onlineUsers', onlineUsers);
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
});

// Test route that also returns online users
server.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is running',
    onlineUsers: onlineUsers
  });
});

app.use('/.netlify/functions/server', server);

// Export the serverless function
const handler = serverless(app);
exports.handler = async (event, context) => {
  // Handle WebSocket connections
  if (event.requestContext && event.requestContext.eventType === 'CONNECT') {
    return { statusCode: 200, body: 'Connected.' };
  }
  
  if (event.requestContext && event.requestContext.eventType === 'DISCONNECT') {
    return { statusCode: 200, body: 'Disconnected.' };
  }

  // Handle HTTP requests
  return handler(event, context);
};

// Export io for WebSocket support
module.exports.io = io; 