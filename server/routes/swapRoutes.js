const express = require('express');
const {
  createSwapRequest, getMySwaps, getSwapById, acceptSwap, rejectSwap,
  cancelSwap, completeSwap, createProposal,
} = require('../controllers/swapController');
const { getMessages, sendMessage } = require('../controllers/messageController');
const { createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createSwapSchema, proposalSchema } = require('../validators/swapValidator');
const { sendMessageSchema } = require('../validators/messageValidator');

const router = express.Router();

router.use(protect);

router.post('/', validate(createSwapSchema), createSwapRequest);
router.get('/', getMySwaps);
router.get('/:id', getSwapById);
router.put('/:id/accept', acceptSwap);
router.put('/:id/reject', rejectSwap);
router.put('/:id/cancel', cancelSwap);
router.put('/:id/complete', completeSwap);
router.post('/:id/proposals', validate(proposalSchema), createProposal);

router.get('/:id/messages', getMessages);
router.post('/:id/messages', validate(sendMessageSchema), sendMessage);

router.post('/:id/reviews', createReview);

module.exports = router;
