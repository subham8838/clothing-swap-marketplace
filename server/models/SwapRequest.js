const mongoose = require('mongoose');

const STATUSES = ['PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'EXPIRED'];

// Valid forward transitions for the swap request state machine
const VALID_TRANSITIONS = {
  PENDING: ['NEGOTIATING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED'],
  NEGOTIATING: ['ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED'],
  ACCEPTED: ['COMPLETED', 'CANCELLED'],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
  EXPIRED: [],
};

const swapRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    requestedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Clothing', required: true },
    offeredItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Clothing', required: true },
    message: { type: String, maxlength: 1000, default: '' },
    status: { type: String, enum: STATUSES, default: 'PENDING', index: true },
    proposals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' }],
    acceptedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

swapRequestSchema.statics.canTransition = function (from, to) {
  return (VALID_TRANSITIONS[from] || []).includes(to);
};

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
module.exports.STATUSES = STATUSES;
module.exports.VALID_TRANSITIONS = VALID_TRANSITIONS;
