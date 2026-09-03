const Joi = require('joi');

const createSwapSchema = Joi.object({
  requestedItem: Joi.string().hex().length(24).required(),
  offeredItem: Joi.string().hex().length(24).required(),
  message: Joi.string().max(1000).allow('').optional(),
});

const proposalSchema = Joi.object({
  offeredItems: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  requestedItems: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  message: Joi.string().max(1000).allow('').optional(),
});

module.exports = { createSwapSchema, proposalSchema };
