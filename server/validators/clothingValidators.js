const { body } = require('express-validator');
const Clothing = require('../models/Clothing');

exports.createClothingValidator = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 120 }),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  body('category').isIn(Clothing.CATEGORIES).withMessage('A valid category is required.'),
  body('brand').trim().notEmpty().withMessage('Brand is required.'),
  body('size').trim().notEmpty().withMessage('Size is required.'),
  body('condition').isIn(Clothing.CONDITIONS).withMessage('A valid condition is required.'),
  body('estimatedValue').optional().isFloat({ gt: 0 }).withMessage('Estimated value must be positive.'),
  body('location.city').trim().notEmpty().withMessage('City is required.'),
];
