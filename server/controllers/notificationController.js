const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

// @route GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  success(res, 200, { notifications, unreadCount });
});

// @route PUT /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findById(req.params.id);
  if (!notif) throw new ApiError(404, 'Notification not found.');
  if (String(notif.user) !== String(req.user._id)) throw new ApiError(403, 'Not your notification.');
  notif.isRead = true;
  await notif.save();
  success(res, 200, { notification: notif });
});

// @route PUT /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  success(res, 200, null, 'All notifications marked as read.');
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
