import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://192.168.1.100:3001';

let socket = null;

export const initSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('Conectado ao servidor');
  });

  socket.on('disconnect', () => {
    console.log('Desconectado do servidor');
  });

  return socket;
};

export const getSocket = () => socket;

export const subscribeToAccessUpdates = (callback) => {
  if (socket) {
    socket.on('access:new', callback);
  }
};

export const unsubscribeFromAccessUpdates = () => {
  if (socket) {
    socket.off('access:new');
  }
};

export const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
