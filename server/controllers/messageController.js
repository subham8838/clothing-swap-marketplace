const Message = require('../models/Message');
const SwapRequest = require('../models/SwapRequest');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const assertParticipant = (swap, userId) => {
  const ids = [String(swap.requester), String(swap.receiver)];
  if (!ids.includes(String(userId))) {
    throw new ApiError(403, 'You do not have access to this conversation.');
  }
};

// @route GET /api/swaps/:id/messages
const getMessages = asyncHandler(async (req, res) => {
  const swap = await SwapRequest.findById(req.params.id);
  if (!swap) throw new ApiError(404, 'Swap request not found.');
  assertParticipant(swap, req.user._id);

  const messages = await Message.find({ swapRequest: req.params.id })
    .populate('sender', 'name profileImage')
    .sort('createdAt');

  await Message.updateMany(
    { swapRequest: req.params.id, receiver: req.user._id, isRead: false },
    { isRead: true }
  );

  success(res, 200, { messages });
});

// @route POST /api/swaps/:id/messages (REST fallback; primary path is Socket.IO)
const sendMessage = asyncHandler(async (req, res) => {
  const swap = await SwapRequest.findById(req.params.id);
  if (!swap) throw new ApiError(404, 'Swap request not found.');
  assertParticipant(swap, req.user._id);

  const ids = [String(swap.requester), String(swap.receiver)];
  const receiver = ids.find((id) => id !== String(req.user._id));

  const doc = await Message.create({
    swapRequest: req.params.id,
    sender: req.user._id,
    receiver,
    message: req.body.message,
  });

  const populated = await doc.populate('sender', 'name profileImage');
  success(res, 201, { message: populated }, 'Message sent.');
});

module.exports = { getMessages, sendMessage };
