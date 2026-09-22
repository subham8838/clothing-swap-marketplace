const cloudinary = require('../config/cloudinary');

// Uploads a single in-memory file buffer (from multer.memoryStorage()) to Cloudinary
// via a stream, wrapped in a Promise for use with async/await in controllers.
const uploadBufferToCloudinary = (buffer, folder = 'clothing-swap-marketplace') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });

module.exports = { uploadBufferToCloudinary };