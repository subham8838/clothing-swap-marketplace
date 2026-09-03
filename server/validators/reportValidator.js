const Joi = require('joi');

const createReportSchema = Joi.object({
  reportedUser: Joi.string().hex().length(24).optional(),
  listing: Joi.string().hex().length(24).optional(),
  reason: Joi.string().valid(
    'Inappropriate clothing', 'Fake information', 'Spam', 'Harassment', 'Suspicious user', 'Fraudulent swap behavior'
  ).required(),
  description: Joi.string().max(1000).allow('').optional(),
}).or('reportedUser', 'listing');

module.exports = { createReportSchema };
