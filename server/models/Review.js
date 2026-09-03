const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    swap: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 1000, default: '' },
  },
  { timestamps: true }
);

reviewSchema.index({ swap: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
