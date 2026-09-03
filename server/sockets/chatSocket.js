const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const SwapRequest = require('../models/SwapRequest');
const { setIo, registerSocket, unregisterSocket } = require('./socketRegistry');

function initChatSocket(io) {
  setIo(io);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || user.isSuspended) return next(new Error('Not authorized'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = String(socket.user._id);
    registerSocket(userId, socket.id);
    socket.join(`user:${userId}`);

    socket.on('join_swap', async (swapId) => {
      const swap = await SwapRequest.findById(swapId);
      if (!swap) return;
      const participantIds = [String(swap.requester), String(swap.receiver)];
      if (!participantIds.includes(userId)) return; // enforce access control
      socket.join(`swap:${swapId}`);
    });

    socket.on('send_message', async ({ swapId, message }) => {
      try {
        const swap = await SwapRequest.findById(swapId);
        if (!swap) return;
        const participantIds = [String(swap.requester), String(swap.receiver)];
        if (!participantIds.includes(userId)) return;

        const receiver = participantIds.find((id) => id !== userId);

        const doc = await Message.create({
          swapRequest: swapId,
          sender: userId,
          receiver,
          message,
        });

        const populated = await doc.populate('sender', 'name profileImage');
        io.to(`swap:${swapId}`).emit('new_message', populated);
        io.to(`user:${receiver}`).emit('notification', {
          type: 'NEW_MESSAGE',
          title: 'New message',
          message: `${socket.user.name} sent you a message.`,
          referenceId: swapId,
        });
      } catch (err) {
        socket.emit('error_message', 'Could not send message.');
      }
    });

    socket.on('typing', ({ swapId }) => {
      socket.to(`swap:${swapId}`).emit('user_typing', { userId });
    });

    socket.on('disconnect', () => {
      unregisterSocket(userId, socket.id);
    });
  });
}

module.exports = initChatSocket;
