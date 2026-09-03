const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendAuthResponse = (res, statusCode, user, message) => {
  const token = signToken(user._id);
  return success(res, statusCode, { user: user.toSafeObject(), token }, message);
};

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, location } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists.');

  const user = await User.create({
    name,
    email,
    password,
    location: location || {},
  });

  sendAuthResponse(res, 201, user, 'Account created successfully.');
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }
  if (user.isSuspended) {
    throw new ApiError(403, 'Your account has been suspended. Contact support.');
  }

  sendAuthResponse(res, 200, user, 'Logged in successfully.');
});

// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  // Stateless JWT: logout is handled client-side by discarding the token.
  success(res, 200, null, 'Logged out successfully.');
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  success(res, 200, { user: req.user.toSafeObject() });
});

module.exports = { register, login, logout, getMe };
