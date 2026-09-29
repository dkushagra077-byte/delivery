import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const toast = useToast();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle real-time push notifications
    socket.on('notification', (notification) => {
      if (notification?.title) {
        toast.info(`🔔 ${notification.title}: ${notification.message}`);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const joinDelivery = (deliveryId) => {
    if (socketRef.current && deliveryId) {
      socketRef.current.emit('join:delivery', deliveryId);
    }
  };

  const leaveDelivery = (deliveryId) => {
    if (socketRef.current && deliveryId) {
      socketRef.current.emit('leave:delivery', deliveryId);
    }
  };

  const emitDriverLocation = (locationData) => {
    if (socketRef.current) {
      socketRef.current.emit('driver:location', locationData);
    }
  };

  const subscribeToEvent = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        joinDelivery,
        leaveDelivery,
        emitDriverLocation,
        subscribeToEvent
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
