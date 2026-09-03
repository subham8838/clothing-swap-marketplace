const Clothing = require('../models/Clothing');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { calculateEstimatedValue } = require('../utils/valueCalculator');

// @route GET /api/clothing
const getClothingList = asyncHandler(async (req, res) => {
  const {
    search, category, size, condition, location, brand, owner,
    minValue, maxValue, page = 1, limit = 12, sort = 'newest',
  } = req.query;

  // Owners can look up their own items regardless of status (e.g. to pick one to offer in a swap);
  // otherwise the public marketplace only shows AVAILABLE items.
  const filter = {};
  if (owner && req.user && String(owner) === String(req.user._id)) {
    filter.owner = owner;
    filter.status = 'AVAILABLE';
  } else {
    filter.status = 'AVAILABLE';
    if (owner) filter.owner = owner;
  }
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (size) filter.size = size;
  if (condition) filter.condition = condition;
  if (brand) filter.brand = new RegExp(brand, 'i');
  if (location) filter['location.city'] = new RegExp(location, 'i');
  if (minValue || maxValue) {
    filter.estimatedValue = {};
    if (minValue) filter.estimatedValue.$gte = Number(minValue);
    if (maxValue) filter.estimatedValue.$lte = Number(maxValue);
  }

  const sortMap = {
    newest: '-createdAt',
    oldest: 'createdAt',
    highest_value: '-estimatedValue',
    lowest_value: 'estimatedValue',
  };
  const sortBy = sortMap[sort] || '-createdAt';

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

  const [items, total] = await Promise.all([
    Clothing.find(filter)
      .populate('owner', 'name profileImage rating location')
      .sort(sortBy)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Clothing.countDocuments(filter),
  ]);

  success(res, 200, { items }, 'Listings fetched.', {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
  });
});

// @route GET /api/clothing/:id
const getClothingById = asyncHandler(async (req, res) => {
  const item = await Clothing.findById(req.params.id).populate('owner', 'name profileImage rating location completedSwaps');
  if (!item || item.status === 'REMOVED') throw new ApiError(404, 'This clothing item is no longer available.');

  item.views += 1;
  await item.save();

  const related = await Clothing.find({
    _id: { $ne: item._id },
    category: item.category,
    status: 'AVAILABLE',
  }).limit(4).populate('owner', 'name profileImage');

  success(res, 200, { item, related });
});

// @route POST /api/clothing
const createClothing = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'At least one image is required.');
  }

  const images = req.files.map((file, idx) => ({
    url: file.path,
    publicId: file.filename,
    isPrimary: idx === 0,
  }));

  const estimatedValue = req.body.estimatedValue
    ? Number(req.body.estimatedValue)
    : calculateEstimatedValue(req.body);

  const item = await Clothing.create({
    ...req.body,
    owner: req.user._id,
    images,
    estimatedValue,
  });

  success(res, 201, { item }, 'Listing created successfully.');
});

// @route PUT /api/clothing/:id
const updateClothing = asyncHandler(async (req, res) => {
  const item = await Clothing.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Listing not found.');
  if (String(item.owner) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only edit your own listings.');
  }
  if (item.status === 'SWAPPED') {
    throw new ApiError(400, 'A completed swap item cannot be edited.');
  }

  Object.assign(item, req.body);

  if (req.files && req.files.length > 0) {
    // remove old images from cloudinary
    await Promise.all(item.images.map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => {})));
    item.images = req.files.map((file, idx) => ({ url: file.path, publicId: file.filename, isPrimary: idx === 0 }));
  }

  await item.save();
  success(res, 200, { item }, 'Listing updated successfully.');
});

// @route DELETE /api/clothing/:id
const deleteClothing = asyncHandler(async (req, res) => {
  const item = await Clothing.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Listing not found.');
  if (String(item.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own listings.');
  }

  item.status = 'REMOVED'; // soft delete
  await item.save();
  success(res, 200, null, 'Listing removed successfully.');
});

module.exports = { getClothingList, getClothingById, createClothing, updateClothing, deleteClothing };
