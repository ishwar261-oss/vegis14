export const demoCategories = [
  {
    _id: 'cat-vegetables',
    name: 'Vegetables',
    slug: 'vegetables',
    description: 'Daily staples harvested fresh.',
    imageUrl: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=900&q=80'
  },
  {
    _id: 'cat-fruits',
    name: 'Fruits',
    slug: 'fruits',
    description: 'Seasonal fruits from trusted farms.',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=80'
  },
  {
    _id: 'cat-leafy',
    name: 'Leafy Greens',
    slug: 'leafy-greens',
    description: 'Spinach, methi, coriander, and more.',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80'
  },
  {
    _id: 'cat-herbs',
    name: 'Herbs',
    slug: 'herbs',
    description: 'Aromatic herbs for better cooking.',
    imageUrl: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?auto=format&fit=crop&w=900&q=80'
  }
];

export const demoProducts = [
  {
    _id: 'prod-tomato',
    name: 'Organic Tomatoes',
    slug: 'organic-tomatoes',
    category: demoCategories[0],
    farmer: { farmName: 'Anita Sunrise Farms' },
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=80'],
    description: 'Fresh tomatoes harvested at sunrise with natural ripening and deep flavor.',
    nutrition: { vitamins: ['Vitamin C', 'Lycopene'] },
    farmLocation: 'Nandagudi, Karnataka',
    harvestDate: new Date().toISOString(),
    deliveryEstimate: '35-55 minutes',
    organic: true,
    weightOptions: [{ _id: 'tomato-500', label: '500g', price: 42, discountPrice: 36, stock: 120 }],
    rating: 4.8,
    reviewCount: 286,
    salesCount: 820,
    isBestSeller: true,
    isTrending: true,
    isSeasonal: false
  },
  {
    _id: 'prod-spinach',
    name: 'Hydro Fresh Spinach',
    slug: 'hydro-fresh-spinach',
    category: demoCategories[2],
    farmer: { farmName: 'Ramesh Organic Collective' },
    images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80'],
    description: 'Tender leafy spinach cleaned, bunched, and delivered quickly.',
    nutrition: { vitamins: ['Iron', 'Vitamin K'] },
    farmLocation: 'Harohalli, Karnataka',
    harvestDate: new Date().toISOString(),
    deliveryEstimate: '35-55 minutes',
    organic: true,
    weightOptions: [{ _id: 'spinach-250', label: '250g', price: 32, discountPrice: 25, stock: 75 }],
    rating: 4.7,
    reviewCount: 198,
    salesCount: 610,
    isBestSeller: false,
    isTrending: true,
    isSeasonal: true
  },
  {
    _id: 'prod-mango',
    name: 'Alphonso Mangoes',
    slug: 'alphonso-mangoes',
    category: demoCategories[1],
    farmer: { farmName: 'Ramesh Organic Collective' },
    images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80'],
    description: 'Premium seasonal mangoes selected for fragrance, sweetness, and ripeness.',
    nutrition: { vitamins: ['Vitamin A', 'Vitamin C'] },
    farmLocation: 'Ramanagara, Karnataka',
    harvestDate: new Date().toISOString(),
    deliveryEstimate: 'Tomorrow morning',
    organic: false,
    weightOptions: [{ _id: 'mango-3', label: '3 pcs', price: 299, discountPrice: 249, stock: 35 }],
    rating: 4.9,
    reviewCount: 452,
    salesCount: 920,
    isBestSeller: true,
    isTrending: true,
    isSeasonal: true
  },
  {
    _id: 'prod-potato',
    name: 'New Potatoes',
    slug: 'new-potatoes',
    category: demoCategories[0],
    farmer: { farmName: 'Anita Sunrise Farms' },
    images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80'],
    description: 'Fresh potatoes with thin skin and smooth texture.',
    nutrition: { vitamins: ['Potassium', 'Fiber'] },
    farmLocation: 'Hoskote, Karnataka',
    harvestDate: new Date().toISOString(),
    deliveryEstimate: '35-55 minutes',
    organic: false,
    weightOptions: [{ _id: 'potato-1kg', label: '1kg', price: 46, discountPrice: 39, stock: 160 }],
    rating: 4.6,
    reviewCount: 166,
    salesCount: 540,
    isBestSeller: true,
    isTrending: false,
    isSeasonal: false
  }
];
