require('dotenv').config();
const mongoose = require('mongoose');
const { env } = require('../config/env');
const { User } = require('../models/User');
const { Farmer } = require('../models/Farmer');
const { Category } = require('../models/Category');
const { Product } = require('../models/Product');
const { Coupon } = require('../models/Coupon');
const { Order } = require('../models/Order');
const { Content } = require('../models/Content');
const { DeliveryAssignment } = require('../models/DeliveryAssignment');

const img = {
  vegetables: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=900&q=80',
  fruits: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=80',
  leafy: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80',
  herbs: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?auto=format&fit=crop&w=900&q=80',
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=80',
  carrot: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=900&q=80',
  spinach: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80',
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80',
  apple: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=900&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80',
  cucumber: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=900&q=80',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80'
};

async function seed() {
  await mongoose.connect(env.mongodbUri);
  await Promise.all([
    User.deleteMany({}),
    Farmer.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
    Order.deleteMany({}),
    Content.deleteMany({}),
    DeliveryAssignment.deleteMany({})
  ]);

  const [owner, admin, customer, delivery, farmerUser1, farmerUser2] = await User.create([
    { name: 'VEGI14 Owner', phone: '+919999999999', email: 'owner@vegi14.test', role: 'owner', referralCode: 'OWNER14' },
    { name: 'Admin Lead', phone: '+919888888888', email: 'admin@vegi14.test', role: 'admin', referralCode: 'ADMIN14' },
    { name: 'Priya Sharma', phone: '+919777777777', email: 'priya@example.com', role: 'customer', referralCode: 'PRIYA14', loyaltyPoints: 240, addresses: [{ label: 'Home', line1: '14 Green Avenue', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', isDefault: true, location: { lat: 12.9716, lng: 77.5946 } }] },
    { name: 'Amit Delivery', phone: '+919666666666', role: 'delivery', referralCode: 'DEL14' },
    { name: 'Anita Farmer', phone: '+919555555555', email: 'anita@farm.test', role: 'farmer', referralCode: 'FARM14' },
    { name: 'Ramesh Organics', phone: '+919444444444', email: 'ramesh@farm.test', role: 'farmer', referralCode: 'FARM15' }
  ]);

  const [anita, ramesh] = await Farmer.create([
    {
      user: farmerUser1._id,
      farmName: 'Anita Sunrise Farms',
      story: 'A family-run farm growing pesticide-conscious vegetables with drip irrigation.',
      kycStatus: 'verified',
      certifications: ['Organic Transition', 'Soil Tested'],
      farmImages: [img.vegetables],
      location: { address: 'Hoskote belt', village: 'Nandagudi', district: 'Bengaluru Rural', state: 'Karnataka', lat: 13.07, lng: 77.8 },
      payout: { bankName: 'Demo Bank', accountMasked: 'XXXX1431', upiId: 'anita@upi' },
      harvestPlan: [{ crop: 'Tomato', expectedHarvestDate: new Date(Date.now() + 86400000 * 5), expectedQuantityKg: 420 }]
    },
    {
      user: farmerUser2._id,
      farmName: 'Ramesh Organic Collective',
      story: 'A collective supplying leafy greens, herbs, fruits, and seasonal produce.',
      kycStatus: 'verified',
      certifications: ['Organic Certified', 'Rainwater Harvesting'],
      farmImages: [img.leafy],
      location: { address: 'Kanakapura Road', village: 'Harohalli', district: 'Ramanagara', state: 'Karnataka', lat: 12.68, lng: 77.47 },
      payout: { bankName: 'Demo Bank', accountMasked: 'XXXX8832', upiId: 'ramesh@upi' },
      harvestPlan: [{ crop: 'Spinach', expectedHarvestDate: new Date(Date.now() + 86400000 * 2), expectedQuantityKg: 180 }]
    }
  ]);

  const categories = await Category.create([
    { name: 'Vegetables', slug: 'vegetables', description: 'Daily staples harvested fresh.', imageUrl: img.vegetables, icon: 'carrot', sortOrder: 1 },
    { name: 'Fruits', slug: 'fruits', description: 'Seasonal fruits from trusted farms.', imageUrl: img.fruits, icon: 'apple', sortOrder: 2 },
    { name: 'Leafy Greens', slug: 'leafy-greens', description: 'Spinach, methi, coriander, and more.', imageUrl: img.leafy, icon: 'leaf', sortOrder: 3 },
    { name: 'Herbs', slug: 'herbs', description: 'Aromatic herbs for better cooking.', imageUrl: img.herbs, icon: 'herb', sortOrder: 4 }
  ]);
  const bySlug = Object.fromEntries(categories.map((category) => [category.slug, category]));

  const products = await Product.create([
    product('Organic Tomatoes', 'tomatoes harvested at sunrise with natural ripening and deep flavor.', bySlug.vegetables, anita, img.tomato, true, true, true, false, [['500g', 500, 42, 36, 120], ['1kg', 1000, 78, 69, 80]], ['Vitamin C', 'Lycopene']),
    product('Baby Carrots', 'crisp carrots perfect for salads, snacks, and lunch boxes.', bySlug.vegetables, anita, img.carrot, false, true, false, true, [['500g', 500, 58, 49, 90], ['1kg', 1000, 110, 96, 60]], ['Beta carotene', 'Fiber']),
    product('Hydro Fresh Spinach', 'tender leafy spinach cleaned, bunched, and delivered quickly.', bySlug['leafy-greens'], ramesh, img.spinach, true, false, true, true, [['250g', 250, 32, 25, 75], ['500g', 500, 60, 52, 40]], ['Iron', 'Vitamin K']),
    product('Alphonso Mangoes', 'premium seasonal mangoes selected for fragrance, sweetness, and ripeness.', bySlug.fruits, ramesh, img.mango, false, true, true, true, [['3 pcs', 750, 299, 249, 35], ['6 pcs', 1500, 579, 499, 22]], ['Vitamin A', 'Vitamin C']),
    product('Himachal Apples', 'crunchy apples for snacking, juices, and breakfast bowls.', bySlug.fruits, ramesh, img.apple, false, false, true, false, [['500g', 500, 145, 129, 55], ['1kg', 1000, 280, 249, 38]], ['Fiber', 'Antioxidants']),
    product('New Potatoes', 'fresh potatoes with thin skin and smooth texture.', bySlug.vegetables, anita, img.potato, false, true, false, false, [['1kg', 1000, 46, 39, 160], ['2kg', 2000, 90, 76, 90]], ['Potassium', 'Carbs']),
    product('English Cucumbers', 'cool, crunchy cucumbers grown for salads and juices.', bySlug.vegetables, anita, img.cucumber, true, false, false, true, [['500g', 500, 52, 44, 70], ['1kg', 1000, 100, 86, 42]], ['Hydration', 'Vitamin K']),
    product('Robusta Bananas', 'naturally sweet bananas from nearby fruit growers.', bySlug.fruits, ramesh, img.banana, false, true, false, false, [['6 pcs', 700, 64, 55, 110], ['12 pcs', 1400, 125, 108, 70]], ['Potassium', 'Vitamin B6'])
  ]);

  await Coupon.create([
    { code: 'FRESH14', title: 'Launch offer', type: 'percent', value: 14, minOrderValue: 299, maxDiscount: 120, isActive: true },
    { code: 'ORGANIC50', title: 'Organic basket discount', type: 'flat', value: 50, minOrderValue: 499, isActive: true }
  ]);

  await Content.create([
    { type: 'blog', title: 'Why farmer-direct groceries stay fresher', slug: 'farmer-direct-freshness', excerpt: 'Shorter supply chains protect flavor and farmer income.', body: 'VEGI14 reduces handling time and gives customers harvest transparency.', imageUrl: img.vegetables, tags: ['freshness'] },
    { type: 'recipe', title: 'Tomato spinach breakfast skillet', slug: 'tomato-spinach-skillet', excerpt: 'A quick recipe using fresh tomatoes and spinach.', body: 'Saute tomatoes, add spinach, finish with eggs or paneer.', imageUrl: img.spinach, tags: ['breakfast'] },
    { type: 'faq', title: 'How does delivery OTP work?', slug: 'delivery-otp', excerpt: 'Delivery is completed only after OTP verification.', body: 'The customer receives an OTP and shares it with the delivery partner at the doorstep.', imageUrl: img.herbs }
  ]);

  const order = await Order.create({
    customer: customer._id,
    items: products.slice(0, 3).map((item) => ({
      product: item._id,
      name: item.name,
      image: item.images[0],
      farmer: item.farmer,
      weightLabel: item.weightOptions[0].label,
      price: item.weightOptions[0].discountPrice || item.weightOptions[0].price,
      quantity: 1,
      total: item.weightOptions[0].discountPrice || item.weightOptions[0].price
    })),
    address: customer.addresses[0],
    deliverySlot: { date: new Date().toISOString().slice(0, 10), window: '7 AM - 10 AM' },
    payment: { method: 'upi', status: 'paid', transactionId: 'PAY-DEMO-14' },
    pricing: { subtotal: 110, discount: 10, tax: 6, deliveryCharge: 29, total: 135 },
    status: 'out_for_delivery',
    deliveryOtp: '1414',
    eta: '24 minutes',
    trackingEvents: [
      { status: 'pending', note: 'Order placed' },
      { status: 'confirmed', note: 'Farmer harvest confirmed' },
      { status: 'packed', note: 'Packed at VEGI14 freshness hub' },
      { status: 'out_for_delivery', note: 'Partner is on the way' }
    ]
  });

  await DeliveryAssignment.create({ order: order._id, partner: delivery._id, status: 'assigned', routeUrl: 'https://maps.google.com', earnings: 45 });

  console.log('VEGI14 seed complete');
  console.log('Demo phones: customer +919777777777, admin +919888888888, owner +919999999999, farmer +919555555555, delivery +919666666666');
  console.log('Development OTP: 141414, delivery OTP for seeded order: 1414');
  await mongoose.disconnect();
}

function product(name, description, category, farmer, image, organic, best, trending, seasonal, options, vitamins) {
  return {
    name,
    category: category._id,
    farmer: farmer._id,
    images: [image, img.vegetables, img.leafy],
    description: `Fresh ${description}`,
    nutrition: { calories: 'Low', fiber: 'High', vitamins, minerals: ['Potassium', 'Magnesium'] },
    farmLocation: `${farmer.location.village}, ${farmer.location.state}`,
    harvestDate: new Date(Date.now() - 86400000),
    deliveryEstimate: '35-55 minutes',
    organic,
    badges: organic ? ['Organic Certified', 'No Middlemen'] : ['Farm Fresh', 'Fair Price'],
    tags: [category.slug, organic ? 'organic' : 'fresh'],
    weightOptions: options.map(([label, grams, price, discountPrice, stock], index) => ({ label, grams, price, discountPrice, stock, sku: `V14-${name.slice(0, 3).toUpperCase()}-${index + 1}` })),
    rating: 4.6 + Math.random() * 0.3,
    reviewCount: Math.floor(80 + Math.random() * 400),
    salesCount: Math.floor(120 + Math.random() * 900),
    isAvailable: true,
    isTrending: trending,
    isBestSeller: best,
    isSeasonal: seasonal,
    priceHistory: [{ price: options[0][2], discountPrice: options[0][3], reason: 'Seed launch price' }]
  };
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
