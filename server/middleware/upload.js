const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'clothing-swap-marketplace',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new ApiError(400, 'Only JPG, PNG, and WEBP images are allowed.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 }, // 5MB per file, up to 6 images
});

module.exports = upload;
