const Joi = require('joi');
const { CATEGORIES, CONDITIONS } = require('../models/Clothing');

const createClothingSchema = Joi.object({
  title: Joi.string().trim().min(3).max(120).required(),
  description: Joi.string().min(10).max(2000).required(),
  category: Joi.string().valid(...CATEGORIES).required(),
  subcategory: Joi.string().allow('').optional(),
  brand: Joi.string().trim().required(),
  size: Joi.string().trim().required(),
  color: Joi.string().allow('').optional(),
  condition: Joi.string().valid(...CONDITIONS).required(),
  material: Joi.string().allow('').optional(),
  purchaseYear: Joi.number().integer().min(1990).max(new Date().getFullYear()).optional(),
  estimatedValue: Joi.number().min(0).optional(), // auto-calculated if omitted
  preferredCategories: Joi.array().items(Joi.string()).optional(),
  preferredSizes: Joi.array().items(Joi.string()).optional(),
  location: Joi.object({
    city: Joi.string().required(),
    state: Joi.string().allow(''),
    country: Joi.string().allow(''),
    coordinates: Joi.object({ lat: Joi.number(), lng: Joi.number() }).optional(),
  }).required(),
});

const updateClothingSchema = createClothingSchema.fork(
  ['title', 'description', 'category', 'brand', 'size', 'condition', 'location'],
  (schema) => schema.optional()
);

module.exports = { createClothingSchema, updateClothingSchema };
