const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'NEW_SWAP_REQUEST', 'SWAP_ACCEPTED', 'SWAP_REJECTED', 'NEW_MESSAGE',
        'NEW_PROPOSAL', 'PROPOSAL_ACCEPTED', 'SWAP_COMPLETED',
        'LISTING_REMOVED', 'REPORT_UPDATE',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
