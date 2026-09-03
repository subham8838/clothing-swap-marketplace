const ApiError = require('../utils/ApiError');

// Generic Joi validation middleware factory
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => d.message);
    throw new ApiError(400, 'Validation failed.', details);
  }
  req.body = value;
  next();
};

module.exports = validate;
