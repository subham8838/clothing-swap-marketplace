const { body } = require('express-validator');

exports.createSwapValidator = [
  body('requestedItem').isMongoId().withMessage('A valid requested item is required.'),
  body('offeredItem').isMongoId().withMessage('A valid offered item is required.'),
  body('message').optional().isLength({ max: 1000 }),
];

exports.proposalValidator = [
  body('offeredItems').isArray({ min: 1 }).withMessage('At least one offered item is required.'),
  body('requestedItems').isArray({ min: 1 }).withMessage('At least one requested item is required.'),
  body('message').optional().isLength({ max: 1000 }),
];
