const Notification = require('../models/Notification');

let ioInstance = null;
exports.setIO = (io) => { ioInstance = io; };

/**
 * Creates a notification record and pushes it in real time to the user's
 * personal Socket.IO room (room name = user id) if they are connected.
 */
exports.notify = async ({ user, type, title, message, referenceId, referenceType }) => {
  const notification = await Notification.create({
    user, type, title, message, referenceId, referenceType,
  });

  if (ioInstance) {
    ioInstance.to(String(user)).emit('notification:new', notification);
  }
  return notification;
};
