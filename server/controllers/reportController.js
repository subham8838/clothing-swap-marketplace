const Report = require('../models/Report');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

// @route POST /api/reports
const createReport = asyncHandler(async (req, res) => {
  const report = await Report.create({ ...req.body, reportedBy: req.user._id });
  success(res, 201, { report }, 'Report submitted. Our team will review it shortly.');
});

module.exports = { createReport };
