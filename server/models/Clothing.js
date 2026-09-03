const mongoose = require('mongoose');

const CATEGORIES = [
  'T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Hoodies', 'Sweaters',
  'Dresses', 'Skirts', 'Shorts', 'Ethnic Wear', 'Sportswear', 'Formal Wear',
  'Shoes', 'Accessories',
];

const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Fair'];

const clothingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    description: { type: String, required: [true, 'Description is required'], maxlength: 2000 },
    category: { type: String, required: true, enum: CATEGORIES, index: true },
    subcategory: { type: String, default: '' },
    brand: { type: String, required: true, trim: true, index: true },
    size: { type: String, required: true, index: true },
    color: { type: String, default: '' },
    condition: { type: String, required: true, enum: CONDITIONS, index: true },
    material: { type: String, default: '' },
    purchaseYear: { type: Number },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    estimatedValue: { type: Number, required: true, min: 0 },
    preferredCategories: [{ type: String }],
    preferredSizes: [{ type: String }],
    location: {
      city: { type: String, required: true, index: true },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      coordinates: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'PENDING_SWAP', 'SWAPPED', 'REMOVED'],
      default: 'AVAILABLE',
      index: true,
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

clothingSchema.index({ title: 'text', brand: 'text', description: 'text' });
clothingSchema.index({ createdAt: -1 });

clothingSchema.virtual('primaryImage').get(function () {
  const primary = this.images.find((img) => img.isPrimary);
  return primary ? primary.url : this.images[0]?.url || '';
});

clothingSchema.set('toJSON', { virtuals: true });
clothingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Clothing', clothingSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.CONDITIONS = CONDITIONS;
