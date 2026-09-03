const cloudinary = require('../config/cloudinary');

// Uploads a buffer (from multer memoryStorage) to Cloudinary via upload_stream
exports.uploadBuffer = (buffer, folder = 'clothing-swap') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ width: 1200, crop: 'limit' }] },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

exports.uploadMultiple = async (files, folder = 'clothing-swap') => {
  return Promise.all(files.map((file) => exports.uploadBuffer(file.buffer, folder)));
};

exports.deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete failed:', err.message);
  }
};
