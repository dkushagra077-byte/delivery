const AuthService = require('../services/authService');
const TrackingService = require('../services/trackingService');
const DeliveryService = require('../services/deliveryService');
const NotificationService = require('../services/notificationService');

const initializeSocket = (io) => {
  // Pass io instance to services that emit events
  NotificationService.setSocketIo(io);
  DeliveryService.setSocketIo(io);
  TrackingService.setSocketIo(io);

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      // Allow unauthenticated connection for public guest tracking if needed, or attach guest
      socket.user = null;
      return next();
    }

    const decoded = AuthService.verifyToken(token);
    if (decoded) {
      socket.user = decoded;
    }
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.id;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Client joins specific delivery room to receive live tracking and status
    socket.on('join:delivery', (deliveryId) => {
      if (deliveryId) {
        socket.join(`delivery:${deliveryId}`);
      }
    });

    socket.on('leave:delivery', (deliveryId) => {
      if (deliveryId) {
        socket.leave(`delivery:${deliveryId}`);
      }
    });

    // Driver streams location via socket directly as well
    socket.on('driver:location', async (data) => {
      try {
        if (!socket.user || (socket.user.role !== 'DRIVER' && socket.user.role !== 'ADMIN')) {
          return socket.emit('error', { message: 'Unauthorized driver location event' });
        }

        const { deliveryId, latitude, longitude, speed, heading, accuracy } = data;
        if (!deliveryId || latitude === undefined || longitude === undefined) {
          return socket.emit('error', { message: 'Invalid location parameters' });
        }

        const result = await TrackingService.recordDriverLocation({
          user: socket.user,
          deliveryId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          speed: speed ? parseFloat(speed) : 0,
          heading: heading ? parseFloat(heading) : 0,
          accuracy: accuracy ? parseFloat(accuracy) : 5.0
        });

        socket.emit('driver:location_ack', { success: true, recordedAt: new Date().toISOString() });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

module.exports = {
  initializeSocket
};
