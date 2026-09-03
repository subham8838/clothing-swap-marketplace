const mongoose = require('mongoose');
const SwapRequest = require('../models/SwapRequest');
const Proposal = require('../models/Proposal');
const Clothing = require('../models/Clothing');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { calculateFairness } = require('../utils/valueCalculator');
const { emitToUser } = require('../sockets/socketRegistry');

const createNotification = async ({ userId, type, title, message, referenceId }) => {
  const notif = await Notification.create({ user: userId, type, title, message, referenceId });
  emitToUser(String(userId), 'notification', notif);
  return notif;
};

// @route POST /api/swaps
const createSwapRequest = asyncHandler(async (req, res) => {
  const { requestedItem, offeredItem, message } = req.body;

  const [reqItem, offItem] = await Promise.all([
    Clothing.findById(requestedItem),
    Clothing.findById(offeredItem),
  ]);

  if (!reqItem || reqItem.status !== 'AVAILABLE') throw new ApiError(400, 'This clothing item is no longer available.');
  if (!offItem || offItem.status !== 'AVAILABLE') throw new ApiError(400, 'Your offered item is not available.');

  if (String(reqItem.owner) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot request your own listing.');
  }
  if (String(offItem.owner) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only offer clothing that you own.');
  }

  const duplicate = await SwapRequest.findOne({
    requester: req.user._id,
    requestedItem,
    offeredItem,
    status: { $in: ['PENDING', 'NEGOTIATING', 'ACCEPTED'] },
  });
  if (duplicate) throw new ApiError(409, 'You already have an active swap request for this item pair.');

  const swap = await SwapRequest.create({
    requester: req.user._id,
    receiver: reqItem.owner,
    requestedItem,
    offeredItem,
    message: message || '',
    status: 'PENDING',
  });

  await createNotification({
    userId: reqItem.owner,
    type: 'NEW_SWAP_REQUEST',
    title: 'New swap request',
    message: `${req.user.name} wants to swap for your "${reqItem.title}".`,
    referenceId: swap._id,
  });

  const populated = await swap.populate([
    { path: 'requestedItem offeredItem', select: 'title images estimatedValue' },
    { path: 'requester receiver', select: 'name profileImage' },
  ]);

  success(res, 201, { swap: populated }, 'Swap request sent successfully.');
});

// @route GET /api/swaps
const getMySwaps = asyncHandler(async (req, res) => {
  const { status, role } = req.query;
  const filter = {};

  if (role === 'sent') filter.requester = req.user._id;
  else if (role === 'received') filter.receiver = req.user._id;
  else filter.$or = [{ requester: req.user._id }, { receiver: req.user._id }];

  if (status) filter.status = status.toUpperCase();

  const swaps = await SwapRequest.find(filter)
    .populate('requestedItem offeredItem', 'title images estimatedValue status')
    .populate('requester receiver', 'name profileImage')
    .sort('-updatedAt');

  success(res, 200, { swaps });
});

const getSwapOrThrow = async (id, userId) => {
  const swap = await SwapRequest.findById(id)
    .populate('requestedItem offeredItem')
    .populate('requester receiver', 'name profileImage')
    .populate({ path: 'proposals', populate: ['offeredItems', 'requestedItems', 'proposedBy'] });

  if (!swap) throw new ApiError(404, 'Swap request not found.');

  const participantIds = [String(swap.requester._id), String(swap.receiver._id)];
  if (!participantIds.includes(String(userId))) {
    throw new ApiError(403, 'You do not have access to this swap request.');
  }
  return swap;
};

// @route GET /api/swaps/:id
const getSwapById = asyncHandler(async (req, res) => {
  const swap = await getSwapOrThrow(req.params.id, req.user._id);
  success(res, 200, { swap });
});

// @route PUT /api/swaps/:id/accept
const acceptSwap = asyncHandler(async (req, res) => {
  const swap = await SwapRequest.findById(req.params.id).populate('requestedItem offeredItem');
  if (!swap) throw new ApiError(404, 'Swap request not found.');

  if (String(swap.receiver) !== String(req.user._id)) {
    throw new ApiError(403, 'Only the receiver can accept this swap request.');
  }
  if (String(swap.requester) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot accept your own request.');
  }
  if (!SwapRequest.canTransition(swap.status, 'ACCEPTED')) {
    throw new ApiError(400, `A swap in status ${swap.status} cannot be accepted.`);
  }
  if (swap.requestedItem.status !== 'AVAILABLE' || swap.offeredItem.status !== 'AVAILABLE') {
    throw new ApiError(400, 'One of the items is no longer available for swap.');
  }

  swap.status = 'ACCEPTED';
  swap.acceptedAt = new Date();
  await swap.save();

  swap.requestedItem.status = 'PENDING_SWAP';
  swap.offeredItem.status = 'PENDING_SWAP';
  await Promise.all([swap.requestedItem.save(), swap.offeredItem.save()]);

  await createNotification({
    userId: swap.requester,
    type: 'SWAP_ACCEPTED',
    title: 'Swap accepted!',
    message: `Your swap request for "${swap.requestedItem.title}" was accepted.`,
    referenceId: swap._id,
  });

  success(res, 200, { swap }, 'Swap request accepted.');
});

// @route PUT /api/swaps/:id/reject
const rejectSwap = asyncHandler(async (req, res) => {
  const swap = await SwapRequest.findById(req.params.id).populate('requestedItem');
  if (!swap) throw new ApiError(404, 'Swap request not found.');

  if (String(swap.receiver) !== String(req.user._id)) {
    throw new ApiError(403, 'Only the receiver can reject this swap request.');
  }
  if (!SwapRequest.canTransition(swap.status, 'REJECTED')) {
    throw new ApiError(400, `A swap in status ${swap.status} cannot be rejected.`);
  }

  swap.status = 'REJECTED';
  await swap.save();

  await createNotification({
    userId: swap.requester,
    type: 'SWAP_REJECTED',
    title: 'Swap request rejected',
    message: `Your swap request for "${swap.requestedItem.title}" was rejected.`,
    referenceId: swap._id,
  });

  success(res, 200, { swap }, 'Swap request rejected.');
});

// @route PUT /api/swaps/:id/cancel
const cancelSwap = asyncHandler(async (req, res) => {
  const swap = await SwapRequest.findById(req.params.id).populate('requestedItem offeredItem');
  if (!swap) throw new ApiError(404, 'Swap request not found.');

  const participantIds = [String(swap.requester), String(swap.receiver)];
  if (!participantIds.includes(String(req.user._id))) {
    throw new ApiError(403, 'You do not have access to this swap request.');
  }
  if (!SwapRequest.canTransition(swap.status, 'CANCELLED')) {
    throw new ApiError(400, `A swap in status ${swap.status} cannot be cancelled.`);
  }

  swap.status = 'CANCELLED';
  await swap.save();

  // release items if they were held for this swap
  if (swap.requestedItem.status === 'PENDING_SWAP') {
    swap.requestedItem.status = 'AVAILABLE';
    await swap.requestedItem.save();
  }
  if (swap.offeredItem.status === 'PENDING_SWAP') {
    swap.offeredItem.status = 'AVAILABLE';
    await swap.offeredItem.save();
  }

  success(res, 200, { swap }, 'Swap request cancelled.');
});

// @route PUT /api/swaps/:id/complete
const completeSwap = asyncHandler(async (req, res) => {
  const swap = await SwapRequest.findById(req.params.id).populate('requestedItem offeredItem');
  if (!swap) throw new ApiError(404, 'Swap request not found.');

  const participantIds = [String(swap.requester), String(swap.receiver)];
  if (!participantIds.includes(String(req.user._id))) {
    throw new ApiError(403, 'You do not have access to this swap request.');
  }
  if (!SwapRequest.canTransition(swap.status, 'COMPLETED')) {
    throw new ApiError(400, `A swap in status ${swap.status} cannot be completed. It must be accepted first.`);
  }

  swap.status = 'COMPLETED';
  swap.completedAt = new Date();
  await swap.save();

  swap.requestedItem.status = 'SWAPPED';
  swap.offeredItem.status = 'SWAPPED';
  await Promise.all([swap.requestedItem.save(), swap.offeredItem.save()]);

  await Promise.all([
    User.findByIdAndUpdate(swap.requester, { $inc: { completedSwaps: 1 } }),
    User.findByIdAndUpdate(swap.receiver, { $inc: { completedSwaps: 1 } }),
  ]);

  await Promise.all(
    participantIds.map((uid) =>
      createNotification({
        userId: uid,
        type: 'SWAP_COMPLETED',
        title: 'Swap completed',
        message: `Your swap for "${swap.requestedItem.title}" has been marked completed. Both users can now leave a review.`,
        referenceId: swap._id,
      })
    )
  );

  success(res, 200, { swap }, 'Swap marked as completed.');
});

// @route POST /api/swaps/:id/proposals — revised swap proposal (negotiation)
const createProposal = asyncHandler(async (req, res) => {
  const { offeredItems, requestedItems, message } = req.body;
  const swap = await SwapRequest.findById(req.params.id);
  if (!swap) throw new ApiError(404, 'Swap request not found.');

  const participantIds = [String(swap.requester), String(swap.receiver)];
  if (!participantIds.includes(String(req.user._id))) {
    throw new ApiError(403, 'You do not have access to this swap request.');
  }
  if (!['PENDING', 'NEGOTIATING'].includes(swap.status)) {
    throw new ApiError(400, `Cannot propose changes while swap is ${swap.status}.`);
  }

  const [offeredDocs, requestedDocs] = await Promise.all([
    Clothing.find({ _id: { $in: offeredItems } }),
    Clothing.find({ _id: { $in: requestedItems } }),
  ]);

  if (offeredDocs.some((d) => d.status !== 'AVAILABLE') || requestedDocs.some((d) => d.status !== 'AVAILABLE')) {
    throw new ApiError(400, 'One of the proposed items is no longer available.');
  }

  const offeredValue = offeredDocs.reduce((sum, d) => sum + d.estimatedValue, 0);
  const requestedValue = requestedDocs.reduce((sum, d) => sum + d.estimatedValue, 0);
  const { difference, fairness } = calculateFairness(offeredValue, requestedValue);

  // Mark previous pending proposals as superseded
  await Proposal.updateMany({ _id: { $in: swap.proposals }, status: 'PENDING' }, { status: 'SUPERSEDED' });

  const proposal = await Proposal.create({
    offeredItems,
    requestedItems,
    message: message || '',
    proposedBy: req.user._id,
    estimatedValue: { offered: offeredValue, requested: requestedValue, difference, fairness },
    status: 'PENDING',
  });

  swap.proposals.push(proposal._id);
  swap.status = 'NEGOTIATING';
  await swap.save();

  const otherParty = String(swap.requester) === String(req.user._id) ? swap.receiver : swap.requester;
  await createNotification({
    userId: otherParty,
    type: 'NEW_PROPOSAL',
    title: 'New swap proposal',
    message: `${req.user.name} sent a revised swap proposal.`,
    referenceId: swap._id,
  });

  success(res, 201, { proposal, swap }, 'Proposal sent.');
});

module.exports = {
  createSwapRequest, getMySwaps, getSwapById, acceptSwap, rejectSwap,
  cancelSwap, completeSwap, createProposal,
};
