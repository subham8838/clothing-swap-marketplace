const express = require('express');
const {
  getClothingList, getClothingById, createClothing, updateClothing, deleteClothing,
} = require('../controllers/clothingController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { createClothingSchema, updateClothingSchema } = require('../validators/clothingValidator');

const router = express.Router();

router.get('/', optionalAuth, getClothingList);
router.get('/:id', optionalAuth, getClothingById);
router.post('/', protect, upload.array('images', 6), validate(createClothingSchema), createClothing);
router.put('/:id', protect, upload.array('images', 6), validate(updateClothingSchema), updateClothing);
router.delete('/:id', protect, deleteClothing);

module.exports = router;
