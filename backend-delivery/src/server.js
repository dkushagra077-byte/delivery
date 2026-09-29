const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./config/env');
const { initializeSocket } = require('./sockets/socketHandler');

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      config.clientUrl,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

initializeSocket(io);

const PORT = config.port;

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 Delivery Tracking Backend API running on port ${PORT}`);
  console.log(`🌐 Environment: ${config.nodeEnv}`);
  console.log(`📡 WebSocket & Realtime ready at ws://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log('====================================================');
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = server;
