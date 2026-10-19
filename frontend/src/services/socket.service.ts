import { io, Socket } from 'socket.io-client';
import { getStoredToken } from '../utils/localStorage';

let commentsSocket: Socket | null = null;

export const getSocketBaseUrl = (): string => {
  const apiUrl =
    (typeof process !== 'undefined' &&
      process.env &&
      process.env.REACT_APP_API_URL) ||
    'http://localhost:3000';
  return apiUrl;
};

export const getCommentsSocket = (): Socket => {
  const token = getStoredToken();
  const baseUrl = getSocketBaseUrl();

  if (commentsSocket && commentsSocket.connected) {
    return commentsSocket;
  }

  if (commentsSocket) {
    commentsSocket.auth = { token };
    commentsSocket.connect();
    return commentsSocket;
  }

  commentsSocket = io(`${baseUrl}/comments`, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  return commentsSocket;
};

export const disconnectCommentsSocket = (): void => {
  if (commentsSocket) {
    commentsSocket.disconnect();
    commentsSocket = null;
  }
};
