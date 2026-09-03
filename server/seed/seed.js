require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Clothing = require('../models/Clothing');
const SwapRequest = require('../models/SwapRequest');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { calculateEstimatedValue } = require('../utils/valueCalculator');
const { CATEGORIES, CONDITIONS } = require('../models/Clothing');

const CITIES = [
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Patna', state: 'Bihar' },
];

const BRANDS = ["Levi's", 'Nike', 'Adidas', 'H&M', 'Zara', 'Uniqlo', 'Puma', 'Roadster', 'Allen Solly', 'Peter England'];

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Ishaan', 'Rohan', 'Kabir', 'Ananya', 'Diya', 'Priya', 'Sneha',
  'Meera', 'Kavya', 'Arjun', 'Rahul', 'Sanjay', 'Neha', 'Pooja', 'Riya', 'Karan', 'Vikram',
  'Anjali', 'Divya', 'Nikhil', 'Suresh', 'Tanvi', 'Aman', 'Simran', 'Yash', 'Isha', 'Rajat'];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Iyer', 'Nair', 'Reddy', 'Chatterjee', 'Banerjee', 'Kapoor', 'Singh',
  'Mukherjee', 'Das', 'Roy', 'Bose', 'Malhotra', 'Chopra', 'Rao', 'Pillai', 'Joshi', 'Mehta'];

const CLOTHING_TEMPLATES = [
  { title: "Levi's 511 Slim Fit Jeans", category: 'Jeans', brand: "Levi's", color: 'Indigo Blue' },
  { title: 'Nike Dri-FIT Running T-Shirt', category: 'T-Shirts', brand: 'Nike', color: 'Black' },
  { title: 'Adidas Originals Trefoil Hoodie', category: 'Hoodies', brand: 'Adidas', color: 'Grey Melange' },
  { title: 'Zara Slim Fit Formal Shirt', category: 'Formal Wear', brand: 'Zara', color: 'White' },
  { title: 'H&M Cotton Round Neck T-Shirt', category: 'T-Shirts', brand: 'H&M', color: 'Navy' },
  { title: 'Uniqlo Ultra Light Down Jacket', category: 'Jackets', brand: 'Uniqlo', color: 'Olive Green' },
  { title: 'Puma Essential Track Pants', category: 'Sportswear', brand: 'Puma', color: 'Black' },
  { title: 'Roadster Checked Casual Shirt', category: 'Shirts', brand: 'Roadster', color: 'Blue Check' },
  { title: 'Allen Solly Formal Trousers', category: 'Trousers', brand: 'Allen Solly', color: 'Charcoal' },
  { title: 'Peter England Cotton Blazer', category: 'Formal Wear', brand: 'Peter England', color: 'Navy Blue' },
  { title: "Levi's Denim Jacket", category: 'Jackets', brand: "Levi's", color: 'Light Blue' },
  { title: 'Nike Air Max Sneakers', category: 'Shoes', brand: 'Nike', color: 'White/Red' },
  { title: 'Adidas Ultraboost Running Shoes', category: 'Shoes', brand: 'Adidas', color: 'Black' },
  { title: 'Zara Floral Summer Dress', category: 'Dresses', brand: 'Zara', color: 'Floral Print' },
  { title: 'H&M Pleated Midi Skirt', category: 'Skirts', brand: 'H&M', color: 'Beige' },
  { title: 'Uniqlo Merino Wool Sweater', category: 'Sweaters', brand: 'Uniqlo', color: 'Maroon' },
  { title: 'Puma Cotton Shorts', category: 'Shorts', brand: 'Puma', color: 'Grey' },
  { title: 'Roadster Ethnic Kurta', category: 'Ethnic Wear', brand: 'Roadster', color: 'Mustard Yellow' },
  { title: 'Allen Solly Casual Chinos', category: 'Trousers', brand: 'Allen Solly', color: 'Khaki' },
  { title: 'Peter England Striped Shirt', category: 'Shirts', brand: 'Peter England', color: 'Blue Stripe' },
  { title: "Levi's Trucker Jacket", category: 'Jackets', brand: "Levi's", color: 'Denim Blue' },
  { title: 'Nike Zip-Up Hoodie', category: 'Hoodies', brand: 'Nike', color: 'Black' },
  { title: 'Adidas Track Jacket', category: 'Jackets', brand: 'Adidas', color: 'Navy/White' },
  { title: 'Zara Wool Blend Overcoat', category: 'Jackets', brand: 'Zara', color: 'Camel' },
  { title: 'H&M Denim Shirt', category: 'Shirts', brand: 'H&M', color: 'Light Denim' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'UK 7', 'UK 8', 'UK 9'];

const PLACEHOLDER_BASE = 'https://placehold.co/600x800/EDE9DE/1F3A34';
const buildPlaceholderUrl = (title) => `${PLACEHOLDER_BASE}?text=${encodeURIComponent(title)}&font=raleway`;

const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const run = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}), Clothing.deleteMany({}), SwapRequest.deleteMany({}),
    Message.deleteMany({}), Notification.deleteMany({}),
  ]);

  console.log('Creating demo accounts...');
  const demoUser = await User.create({
    name: 'Riya Sharma',
    email: process.env.SEED_USER_EMAIL || 'user@example.com',
    password: process.env.SEED_USER_PASSWORD || 'User@12345',
    location: { city: 'Kolkata', state: 'West Bengal', country: 'India' },
    bio: 'Sustainable fashion enthusiast. Love swapping instead of shopping!',
  });

  const demoAdmin = await User.create({
    name: 'Platform Admin',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
    role: 'admin',
    location: { city: 'Delhi', state: 'Delhi', country: 'India' },
  });

  console.log('Creating 30 users...');
  const users = [demoUser];
  for (let i = 0; i < 28; i++) {
    const name = `${randItem(FIRST_NAMES)} ${randItem(LAST_NAMES)}`;
    const loc = randItem(CITIES);
    const user = await User.create({
      name,
      email: `${name.toLowerCase().replace(/\s/g, '.')}${i}@example.com`,
      password: 'Password@123',
      location: { city: loc.city, state: loc.state, country: 'India' },
      bio: 'Swapping clothes, saving the planet, one exchange at a time.',
      rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      ratingCount: randInt(1, 20),
    });
    users.push(user);
  }
  users.push(demoAdmin);

  console.log('Creating 50 clothing listings...');
  const listings = [];
  const swapEligibleUsers = users.filter((u) => u.role === 'user');
  for (let i = 0; i < 50; i++) {
    const template = randItem(CLOTHING_TEMPLATES);
    const owner = randItem(swapEligibleUsers);
    const loc = randItem(CITIES);
    const condition = randItem(CONDITIONS);
    const purchaseYear = randInt(2021, 2026);

    const estimatedValue = calculateEstimatedValue({
      category: template.category, brand: template.brand, condition, purchaseYear,
    });

    const listing = await Clothing.create({
      owner: owner._id,
      title: template.title,
      description: `${template.title} in ${condition.toLowerCase()} condition. Gently used, well maintained, from a smoke-free home. Perfect for someone looking for quality ${template.category.toLowerCase()} without buying new.`,
      category: template.category,
      brand: template.brand,
      size: randItem(SIZES),
      color: template.color,
      condition,
      material: 'Cotton Blend',
      purchaseYear,
      images: [{ url: buildPlaceholderUrl(template.title), publicId: `seed-${i}`, isPrimary: true }],
      estimatedValue,
      preferredCategories: [randItem(CATEGORIES), randItem(CATEGORIES)],
      preferredSizes: [randItem(SIZES)],
      location: { city: loc.city, state: loc.state, country: 'India' },
      status: 'AVAILABLE',
    });
    listings.push(listing);
  }

  console.log('Creating 20+ swap requests...');
  const statuses = ['PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'COMPLETED'];
  for (let i = 0; i < 24; i++) {
    const requestedItem = randItem(listings);
    const requesterCandidates = swapEligibleUsers.filter((u) => String(u._id) !== String(requestedItem.owner));
    const requester = randItem(requesterCandidates);
    const requesterOwnItems = listings.filter((l) => String(l.owner) === String(requester._id));
    if (requesterOwnItems.length === 0) continue;
    const offeredItem = randItem(requesterOwnItems);
    const status = randItem(statuses);

    const swap = await SwapRequest.create({
      requester: requester._id,
      receiver: requestedItem.owner,
      requestedItem: requestedItem._id,
      offeredItem: offeredItem._id,
      message: 'Hi! Would you be interested in swapping for this item?',
      status,
      acceptedAt: ['ACCEPTED', 'COMPLETED'].includes(status) ? new Date() : null,
      completedAt: status === 'COMPLETED' ? new Date() : null,
    });

    if (status === 'COMPLETED') {
      await Clothing.findByIdAndUpdate(requestedItem._id, { status: 'SWAPPED' });
      await Clothing.findByIdAndUpdate(offeredItem._id, { status: 'SWAPPED' });
      await User.findByIdAndUpdate(requester._id, { $inc: { completedSwaps: 1 } });
      await User.findByIdAndUpdate(requestedItem.owner, { $inc: { completedSwaps: 1 } });
    } else if (status === 'ACCEPTED') {
      await Clothing.findByIdAndUpdate(requestedItem._id, { status: 'PENDING_SWAP' });
      await Clothing.findByIdAndUpdate(offeredItem._id, { status: 'PENDING_SWAP' });
    }

    if (['NEGOTIATING', 'ACCEPTED', 'COMPLETED'].includes(status)) {
      await Message.create([
        { swapRequest: swap._id, sender: requester._id, receiver: requestedItem.owner, message: 'Hey! Interested in this swap, let me know what you think.', isRead: true },
        { swapRequest: swap._id, sender: requestedItem.owner, receiver: requester._id, message: 'Sounds good, your item looks great!', isRead: true },
      ]);
    }

    await Notification.create({
      user: requestedItem.owner,
      type: 'NEW_SWAP_REQUEST',
      title: 'New swap request',
      message: `${requester.name} wants to swap for your "${requestedItem.title}".`,
      referenceId: swap._id,
      isRead: Math.random() > 0.5,
    });
  }

  console.log('Seed data created successfully.');
  //console.log(`Demo user login: ${demoUser.email} / ${process.env.SEED_USER_PASSWORD || 'User@12345'}`);
  //console.log(`Demo admin login: ${demoAdmin.email} / ${process.env.SEED_ADMIN_PASSWORD || 'Admin@12345'}`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
