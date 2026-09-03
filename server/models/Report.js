const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Clothing', default: null },
    reason: {
      type: String,
      enum: ['Inappropriate clothing', 'Fake information', 'Spam', 'Harassment', 'Suspicious user', 'Fraudulent swap behavior'],
      required: true,
    },
    description: { type: String, maxlength: 1000, default: '' },
    status: { type: String, enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'], default: 'OPEN' },
    adminResponse: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
