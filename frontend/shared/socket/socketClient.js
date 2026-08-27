import { io } from 'socket.io-client';

/**
 * Socket.io client singleton.
 * Maintains a single persistent connection per browser session.
 */
let socket = null;

/**
 * Connect to the Socket.io server.
 * @param {string} token   - JWT token from localStorage
 * @param {Function} onNotification - Callback for NOTIFICATION_ALERT events
 * @returns {Socket} The active socket instance
 */
export const connectSocket = (token, onNotification) => {
  // Return existing connection if already active
  if (socket?.connected) return socket;

  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_BACKEND_SOCKET_URL ||
    (typeof window !== 'undefined'
      ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? `${window.location.protocol}//${window.location.hostname}:4001`
          : window.location.origin)
      : 'http://localhost:4001');

  socket = io(socketUrl, {
    path: '/socket.io',
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 12,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
    timeout: 20000,
    // Prefer WebSocket, fall back to polling automatically
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[Socket.io] ✅ Connected to ERP real-time server (id:', socket?.id || 'unknown', ')');
  });

  socket.on('notification:new', (notification) => {
    if (typeof onNotification === 'function') {
      onNotification(notification);
    }
  });

  socket.on('disconnect', (reason) => {
    console.warn('[Socket.io] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.warn('[Socket.io] Connection error (will retry):', error.message);
  });

  socket.on('reconnect', (attempt) => {
    console.log(`[Socket.io] Reconnected after ${attempt} attempt(s)`);
  });

  return socket;
};

/**
 * Disconnect and destroy the socket instance.
 * Called on user logout or component unmount.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[Socket.io] Connection closed');
  }
};

/**
 * Returns true if there is an active socket connection.
 */
export const isSocketConnected = () => socket?.connected === true;
