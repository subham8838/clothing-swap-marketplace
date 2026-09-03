// Tracks connected users so REST controllers can push real-time events
// without importing the io instance directly (avoids circular deps).
let ioInstance = null;
const userSockets = new Map(); // userId -> Set of socket ids

const setIo = (io) => { ioInstance = io; };

const registerSocket = (userId, socketId) => {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(socketId);
};

const unregisterSocket = (userId, socketId) => {
  if (userSockets.has(userId)) {
    userSockets.get(userId).delete(socketId);
    if (userSockets.get(userId).size === 0) userSockets.delete(userId);
  }
};

const emitToUser = (userId, event, payload) => {
  if (!ioInstance) return;
  const sockets = userSockets.get(userId);
  if (!sockets) return;
  sockets.forEach((socketId) => ioInstance.to(socketId).emit(event, payload));
};

module.exports = { setIo, registerSocket, unregisterSocket, emitToUser };
