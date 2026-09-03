const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    offeredItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clothing' }],
    requestedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clothing' }],
    message: { type: String, maxlength: 1000, default: '' },
    proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    estimatedValue: {
      offered: { type: Number, default: 0 },
      requested: { type: Number, default: 0 },
      difference: { type: Number, default: 0 },
      fairness: {
        type: String,
        enum: ['Excellent Match', 'Good Match', 'Moderate Match', 'Large Value Difference'],
        default: 'Good Match',
      },
    },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'SUPERSEDED'], default: 'PENDING' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Proposal', proposalSchema);
