import { demoCategories, demoProducts } from './demoData.js';

const state = {
  token: localStorage.getItem('vegi14_token'),
  user: JSON.parse(localStorage.getItem('vegi14_user') || 'null'),
  products: [],
  categories: [],
  cart: null,
  pricing: null,
  selectedProductOption: null
};

const API_BASE = window.VEGI14_API_BASE || localStorage.getItem('vegi14_api_base') || '';

const $ = (selector) => document.querySelector(selector);
const app = $('#app');

const fallbackImages = [
  'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=900&q=80'
];

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const csrfToken = localStorage.getItem('vegi14_csrf');
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
  try {
    const response = await fetch(`${API_BASE}/api${path}`, { ...options, headers });
    const nextCsrf = response.headers.get('X-CSRF-Token');
    if (nextCsrf) localStorage.setItem('vegi14_csrf', nextCsrf);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  } catch (error) {
    if (!API_BASE) return demoResponse(path, options);
    throw error;
  }
}

function demoResponse(path, options = {}) {
  if (path.startsWith('/products/categories')) return { success: true, categories: demoCategories };
  if (path.startsWith('/products?')) return { success: true, data: demoProducts, meta: { page: 1, limit: demoProducts.length, total: demoProducts.length, pages: 1 } };
  if (path.startsWith('/products/')) {
    const slug = path.split('/products/')[1];
    return { success: true, product: demoProducts.find((item) => item.slug === slug) || demoProducts[0] };
  }
  if (path === '/auth/request-otp') return { success: true, message: 'OTP sent', developmentOtp: '141414' };
  if (path === '/auth/verify-otp') {
    const body = JSON.parse(options.body || '{}');
    return {
      success: true,
      token: 'github-pages-demo-token',
      user: {
        name: body.name || 'VEGI14 Customer',
        phone: body.phone || '+910000000000',
        role: body.role || 'customer',
        walletBalance: 0,
        loyaltyPoints: 140,
        referralCode: 'PAGES14',
        addresses: []
      }
    };
  }
  if (path.startsWith('/orders/track/')) {
    return {
      success: true,
      order: {
        orderNumber: path.split('/').pop(),
        status: 'out_for_delivery',
        eta: '24 minutes',
        trackingEvents: [
          { note: 'Order placed' },
          { note: 'Packed at VEGI14 freshness hub' },
          { note: 'Partner is on the way' }
        ]
      }
    };
  }
  if (path === '/orders') return { success: true, orders: [] };
  if (path === '/cart/items') return demoResponse('/cart');
  if (path === '/cart') return { success: true, cart: { items: [] }, pricing: { subtotal: 0, tax: 0, deliveryCharge: 0, discount: 0, total: 0 } };
  if (path.startsWith('/dashboards/admin')) return { success: true, analytics: { revenue: 128000, profit: 23040, orders: 320, customers: 14000, topProducts: demoProducts, lowStock: [] } };
  if (path.startsWith('/dashboards/farmer')) return { success: true, farmer: { farmName: 'GitHub Pages Demo Farm', kycStatus: 'verified' }, products: demoProducts, orders: [] };
  if (path.startsWith('/dashboards/delivery')) return { success: true, assignments: [], earnings: 0 };
  return { success: false };
}

function toast(message) {
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

function currency(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}

function priceOf(product) {
  const option = product.weightOptions?.[0] || {};
  return option.discountPrice || option.price || 0;
}

function imageOf(product, index = 0) {
  return product.images?.[index] || fallbackImages[index % fallbackImages.length];
}

async function loadBaseData() {
  try {
    const [products, categories] = await Promise.all([
      api('/products?limit=40'),
      api('/products/categories')
    ]);
    state.products = products.data || [];
    state.categories = categories.categories || [];
  } catch (error) {
    console.warn(error);
    state.products = demoProducts;
    state.categories = demoCategories;
  }
  if (state.token) await refreshCart();
}

function productCard(product) {
  const option = product.weightOptions?.[0] || {};
  return `
    <article class="product-card">
      <a href="#/product/${product.slug}"><img loading="lazy" src="${imageOf(product)}" alt="${product.name}"></a>
      <div class="product-body">
        <div class="meta-line"><span>${product.category?.name || 'Fresh Produce'}</span><span>Rating ${product.rating || 4.8}</span></div>
        <h3><a href="#/product/${product.slug}">${product.name}</a></h3>
        <p>${product.description || 'Freshly harvested and quality checked.'}</p>
        <div class="meta-line"><span class="price">${currency(option.discountPrice || option.price)}</span><span>${option.label || '500g'}</span></div>
        <div class="button-row" style="margin-top:14px">
          ${product.organic ? '<span class="badge">Organic</span>' : '<span class="badge orange">Farm fresh</span>'}
          <button class="primary small" data-add="${product._id}" data-option="${option._id || ''}">Add</button>
        </div>
      </div>
    </article>`;
}

function pageHeader(title, copy) {
  return `<section class="section tight"><span class="eyebrow">VEGI14</span><h1>${title}</h1><p>${copy}</p></section>`;
}

function renderHome() {
  const best = state.products.filter((p) => p.isBestSeller).slice(0, 4);
  const trending = state.products.filter((p) => p.isTrending).slice(0, 4);
  const seasonal = state.products.filter((p) => p.isSeasonal).slice(0, 4);
  app.innerHTML = `
    <section class="hero">
      <div>
        <span class="eyebrow">Fresh From Farmers. Direct To Your Home.</span>
        <h1>Premium farm harvest delivered with trust, speed, and fair prices.</h1>
        <p>VEGI14 connects local farmers directly with families, restaurants, and conscious shoppers who want fresh, organic, high-quality vegetables without middlemen.</p>
        <form class="search-bar" id="heroSearch">
          <input name="q" placeholder="Search tomatoes, spinach, mangoes, organic boxes">
          <button class="primary" type="submit">Shop Now</button>
        </form>
        <div class="hero-actions">
          <a class="primary" href="#/shop">Shop Now</a>
          <a class="secondary" href="#/farmer-program">Become Farmer</a>
        </div>
        <div class="trust-strip">
          <div><strong>14k+</strong><span>happy families</span></div>
          <div><strong>320+</strong><span>verified farmers</span></div>
          <div><strong>45 min</strong><span>urban delivery</span></div>
          <div><strong>4.8/5</strong><span>customer rating</span></div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="section-head"><div><span class="eyebrow">Categories</span><h2>Shop by harvest</h2></div><a href="#/categories">View all</a></div>
      <div class="grid four">${state.categories.slice(0, 4).map(categoryCard).join('')}</div>
    </section>
    ${productSection('Best Sellers', best)}
    ${productSection('Trending Products', trending)}
    ${productSection('Seasonal Products', seasonal)}
    <section class="section stats">
      <div class="grid four">
        ${['No middlemen', 'Dynamic fair pricing', 'Organic certification badges', 'Location-based availability'].map((text) => `<div><h3>${text}</h3><p>Built for transparent grocery commerce at startup scale.</p></div>`).join('')}
      </div>
    </section>
    <section class="section">
      <div class="section-head"><div><span class="eyebrow">Why Choose VEGI14</span><h2>Designed for freshness and trust</h2></div></div>
      <div class="grid three">
        ${featureCard('Farmer-first pricing', 'Farmers update inventory and receive fair payouts with revenue analytics.')}
        ${featureCard('Harvest transparency', 'Every product shows farmer, farm location, harvest date, stock, and delivery estimate.')}
        ${featureCard('Fast local delivery', 'Delivery partners complete orders only after customer OTP verification.')}
      </div>
    </section>
    <section class="section">
      <div class="grid two">
        <div><span class="eyebrow">How It Works</span><h2>From soil to doorstep in four steps</h2><div class="timeline">${['Farmers list today\\'s harvest', 'Admin controls live price and stock', 'Customers order or subscribe', 'Partner verifies delivery OTP'].map((x) => `<div class="timeline-item"><span></span><p>${x}</p></div>`).join('')}</div></div>
        <img class="media-img" src="https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&w=1000&q=80" alt="Farmer harvest" style="border-radius:8px;max-height:520px">
      </div>
    </section>
    <section class="section">
      <div class="section-head"><div><span class="eyebrow">Stories</span><h2>Farmers and customers love the loop</h2></div></div>
      <div class="grid three">
        ${storyCard('Anita Farms', 'Direct sales helped us plan harvests better and earn predictable revenue.')}
        ${storyCard('Ramesh Organics', 'The platform makes certification, stock, and orders simple from mobile.')}
        ${storyCard('Priya S.', 'The spinach arrives crisp, the mangoes smell real, and delivery is trackable.')}
      </div>
    </section>
    ${plansBlock()}
    ${newsletterFooter()}
  `;
}

function productSection(title, products) {
  return `<section class="section"><div class="section-head"><div><span class="eyebrow">Marketplace</span><h2>${title}</h2></div><a href="#/shop">Shop all</a></div><div class="grid four">${(products.length ? products : state.products.slice(0, 4)).map(productCard).join('')}</div></section>`;
}

function categoryCard(category) {
  return `<a class="category-card card" href="#/shop?category=${category._id}"><img src="${category.imageUrl || fallbackImages[0]}" alt="${category.name}"><div class="card"><h3>${category.name}</h3><p>${category.description || 'Fresh picks from verified farms.'}</p></div></a>`;
}

function featureCard(title, copy) {
  return `<article class="card"><span class="badge">VEGI14</span><h3>${title}</h3><p>${copy}</p></article>`;
}

function storyCard(title, copy) {
  return `<article class="card story-card"><img src="https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=900&q=80" alt="${title}" style="height:170px;border-radius:8px"><h3>${title}</h3><p>${copy}</p></article>`;
}

function plansBlock() {
  return `<section class="section" id="plans"><div class="section-head"><div><span class="eyebrow">Subscription Plans</span><h2>Vegetable boxes for every kitchen</h2></div></div><div class="grid three">${[
    ['Weekly Fresh Box', 699, '18-22 seasonal staples, free delivery, pause anytime'],
    ['Organic Essentials', 899, 'Certified picks, nutrition variety, priority harvest slots'],
    ['Monthly Family Harvest', 2799, 'Four curated boxes, recipe cards, loyalty boost']
  ].map(([name, price, copy]) => `<article class="card"><h3>${name}</h3><p>${copy}</p><p class="price">${currency(price)}</p><button class="primary">Subscribe</button></article>`).join('')}</div></section>`;
}

function newsletterFooter() {
  return `<section class="section"><div class="card grid two"><div><span class="eyebrow">Newsletter</span><h2>Fresh alerts, recipes, and farm stories.</h2><p>Get seasonal offers and weekly harvest plans.</p></div><form class="search-bar"><input placeholder="Email address"><button class="primary">Join</button></form></div></section><footer class="footer"><div class="grid four"><div><h3>VEGI14</h3><p>Fresh From Farmers. Direct To Your Home.</p></div><a href="#/privacy">Privacy Policy</a><a href="#/refund">Refund Policy</a><a href="#/terms">Terms & Conditions</a></div></footer>`;
}

async function renderShop() {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  app.innerHTML = `<div class="filters"><form id="filters" class="filter-row"><input name="search" placeholder="Search produce" value="${params.get('search') || ''}"><select name="category"><option value="">All categories</option>${state.categories.map((c) => `<option value="${c._id}" ${params.get('category') === c._id ? 'selected' : ''}>${c.name}</option>`).join('')}</select><select name="sort"><option value="popular">Popular</option><option value="price_low">Price low</option><option value="price_high">Price high</option><option value="rating">Rating</option><option value="newest">Newest</option></select><button class="primary">Apply</button></form></div><section class="section tight"><div class="shop-layout"><aside class="side-panel"><h3>Filters</h3><label><input type="checkbox" id="organicFilter"> Organic only</label><label><input type="checkbox" id="availableFilter" checked> Available now</label><p>Infinite scroll and pagination are API-ready through page and limit parameters.</p></aside><div><div class="section-head"><div><span class="eyebrow">Shop</span><h2>Fresh marketplace</h2></div></div><div id="productGrid" class="grid three"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div></div></div></section>`;
  await loadProductsFromFilters();
}

async function loadProductsFromFilters() {
  const form = $('#filters');
  const organic = $('#organicFilter')?.checked;
  const available = $('#availableFilter')?.checked;
  const params = new URLSearchParams(new FormData(form));
  if (organic) params.set('organic', 'true');
  if (available) params.set('available', 'true');
  params.set('limit', '24');
  const result = await api(`/products?${params.toString()}`);
  state.products = result.data;
  $('#productGrid').innerHTML = result.data.map(productCard).join('') || '<p>No products found.</p>';
}

function renderProduct(slug) {
  app.innerHTML = `<section class="section"><div class="skeleton"></div></section>`;
  api(`/products/${slug}`).then(({ product }) => {
    state.selectedProductOption = product.weightOptions?.[0]?._id;
    app.innerHTML = `<section class="section"><div class="details-layout"><div class="gallery"><div class="gallery-main"><img id="mainImage" src="${imageOf(product)}" alt="${product.name}"></div><div class="thumbs">${(product.images?.length ? product.images : fallbackImages).slice(0, 4).map((img, i) => `<img class="${i === 0 ? 'active' : ''}" data-img="${img}" src="${img}" alt="${product.name} thumbnail">`).join('')}</div></div><div><span class="eyebrow">${product.category?.name || 'Farm produce'}</span><h1>${product.name}</h1><p>${product.description}</p><div class="button-row"><span class="badge">${product.organic ? 'Organic Certified' : 'Farm Fresh'}</span><span class="badge orange">Harvest ${new Date(product.harvestDate || Date.now()).toLocaleDateString()}</span><span class="badge">Rating ${product.rating} (${product.reviewCount})</span></div><div class="weight-options">${product.weightOptions.map((option, i) => `<button class="chip ${i === 0 ? 'active' : ''}" data-weight="${option._id}">${option.label} - ${currency(option.discountPrice || option.price)}</button>`).join('')}</div><h3>Farmer Information</h3><p>${product.farmer?.farmName || 'Verified VEGI14 farmer'} - ${product.farmLocation || 'Local farm'} - Delivery ${product.deliveryEstimate}</p><h3>Nutritional Information</h3><p>${product.nutrition?.vitamins?.join(', ') || 'Rich in vitamins, minerals, and fiber.'}</p><div class="button-row"><button class="primary" data-add="${product._id}" data-option="${state.selectedProductOption}">Add To Cart</button><button class="secondary" data-buy="${product._id}" data-option="${state.selectedProductOption}">Buy Now</button></div></div></div></section>${productSection('Recommended Products', state.products.filter((p) => p.slug !== slug).slice(0, 4))}`;
  });
}

function renderStatic(type) {
  const content = {
    categories: ['Categories', 'Explore vegetables, fruits, leafy greens, herbs, organic essentials, and subscription boxes.'],
    offers: ['Offers', 'Flash sales, seasonal offers, coupons, referral rewards, loyalty points, and gift cards are managed from admin.'],
    plans: ['Subscription Plans', 'Weekly and monthly vegetable boxes curated around freshness, nutrition, and family size.'],
    about: ['About Us', 'VEGI14 removes middlemen so farmers earn fairly and customers receive fresher food.'],
    'farmer-program': ['Farmer Program', 'Register your farm, complete KYC, upload harvests, manage inventory, and withdraw revenue.'],
    'delivery-partner': ['Become Delivery Partner', 'Go online, receive assigned orders, navigate routes, verify customer OTP, and track earnings.'],
    recipes: ['Recipes', 'AI-assisted recipes suggest meals based on your cart and seasonal vegetables.'],
    blog: ['Blog', 'Read farm stories, organic guides, nutrition notes, and sustainable agriculture insights.'],
    contact: ['Contact', 'Reach VEGI14 support for orders, refunds, farm onboarding, and delivery assistance.'],
    faq: ['FAQ', 'Common questions about freshness, payments, delivery slots, subscriptions, refunds, and farmer verification.'],
    privacy: ['Privacy Policy', 'VEGI14 protects customer, farmer, and delivery partner data with role-based access and secure APIs.'],
    refund: ['Refund Policy', 'Refunds are reviewed for quality issues, cancellations, failed payments, and delivery exceptions.'],
    terms: ['Terms & Conditions', 'Use of VEGI14 requires lawful ordering, accurate addresses, OTP verification, and marketplace compliance.']
  }[type] || ['VEGI14', 'Fresh From Farmers. Direct To Your Home.'];
  app.innerHTML = `${pageHeader(content[0], content[1])}<section class="section tight"><div class="grid three">${state.products.slice(0, 6).map(productCard).join('')}</div></section>${type === 'plans' ? plansBlock() : newsletterFooter()}`;
}

function renderTracking() {
  app.innerHTML = `${pageHeader('Order Tracking', 'Track live ETA, order state, and delivery events.') }<section class="section tight"><form id="trackForm" class="search-bar"><input name="orderNumber" placeholder="Enter order number V14-..."><button class="primary">Track</button></form><div id="trackResult"></div></section>`;
}

function renderCheckout() {
  if (!state.token) return openAuth();
  app.innerHTML = `${pageHeader('Checkout', 'Select address, delivery slot, coupon, payment method, and place your order.') }<section class="section tight"><div class="grid two"><form id="checkoutForm" class="card stack-form"><input name="line1" placeholder="Address line" required><input name="city" placeholder="City" required><input name="pincode" placeholder="Pincode" required><textarea name="deliveryInstructions" placeholder="Delivery instructions"></textarea><select name="paymentMethod"><option value="upi">UPI</option><option value="card">Cards</option><option value="netbanking">Net Banking</option><option value="cod">Cash On Delivery</option></select><select name="window"><option>7 AM - 10 AM</option><option>12 PM - 3 PM</option><option>6 PM - 9 PM</option></select><button class="primary">Place Order</button></form><div class="card" id="checkoutSummary"></div></div></section>`;
  $('#checkoutSummary').innerHTML = cartSummaryHtml();
}

async function renderAccount() {
  if (!state.token) return openAuth();
  const orders = await api('/orders');
  app.innerHTML = `${pageHeader('Customer Account', 'Manage profile, addresses, cart, wishlist, wallet, loyalty, coupons, notifications, language, and order history.') }<section class="section tight"><div class="grid three"><article class="card"><h3>${state.user?.name || 'VEGI14 Customer'}</h3><p>${state.user?.phone || ''}</p><p>Wallet: ${currency(state.user?.walletBalance || 0)}</p><p>Loyalty points: ${state.user?.loyaltyPoints || 0}</p></article><article class="card"><h3>Address Book</h3><p>${state.user?.addresses?.[0]?.line1 || 'Add addresses during checkout.'}</p><button class="secondary">Manage Addresses</button></article><article class="card"><h3>Rewards</h3><p>Referral code: ${state.user?.referralCode || 'Generated after login'}</p><p>Coupons, gift cards, and saved payments are API-ready.</p></article></div><div class="grid three" style="margin-top:18px">${['Wishlist', 'Invoices', 'Saved Payments', 'Notifications', 'Dark Mode', 'Language Selection'].map((item) => `<article class="card"><h3>${item}</h3><p>Managed through the customer profile and commerce APIs.</p></article>`).join('')}</div><div class="table-wrap" style="margin-top:18px"><table><thead><tr><th>Order</th><th>Status</th><th>Total</th><th>Invoice</th></tr></thead><tbody>${orders.orders.map((order) => `<tr><td>${order.orderNumber}</td><td>${order.status}</td><td>${currency(order.pricing?.total)}</td><td>${order.invoiceNumber || 'Ready'}</td></tr>`).join('')}</tbody></table></div></section>`;
}

async function renderDashboard(kind) {
  if (!state.token) return openAuth();
  const route = kind === 'admin' ? '/dashboards/admin' : kind === 'farmer' ? '/dashboards/farmer' : '/dashboards/delivery';
  app.innerHTML = `${pageHeader(`${kind[0].toUpperCase() + kind.slice(1)} Dashboard`, 'Operational control center for VEGI14.') }<section class="section tight"><div id="dashboardBody" class="dashboard-grid"><div class="skeleton"></div><div class="skeleton"></div></div></section>`;
  const data = await api(route);
  if (kind === 'admin') renderAdminDashboard(data.analytics);
  if (kind === 'farmer') renderFarmerDashboard(data);
  if (kind === 'delivery') renderDeliveryDashboard(data);
}

function renderAdminDashboard(analytics) {
  $('#dashboardBody').innerHTML = `<nav class="dashboard-nav">${['Revenue Analytics', 'Order Management', 'Product Management', 'Bulk Price Update', 'Customers', 'Farmers', 'Delivery Partners', 'Coupons', 'Refunds', 'Complaints', 'Review Moderation', 'CMS', 'Roles', 'Audit Logs', 'Backups'].map((x) => `<a class="card" href="#">${x}</a>`).join('')}</nav><div><div class="grid four">${[['Revenue', analytics.revenue], ['Profit', analytics.profit], ['Orders', analytics.orders], ['Customers', analytics.customers]].map(([k,v]) => `<div class="card"><p>${k}</p><h2>${typeof v === 'number' ? currency(v) : v}</h2></div>`).join('')}</div><div class="table-wrap" style="margin-top:18px"><table><thead><tr><th>Top Product</th><th>Sales</th><th>Rating</th><th>Stock Control</th></tr></thead><tbody>${analytics.topProducts.map((p) => `<tr><td>${p.name}</td><td>${p.salesCount}</td><td>${p.rating}</td><td>Dynamic DB pricing</td></tr>`).join('')}</tbody></table></div></div>`;
}

function renderFarmerDashboard(data) {
  $('#dashboardBody').innerHTML = `<nav class="dashboard-nav">${['KYC Verification', 'Farm Details', 'Product Upload', 'Inventory', 'Orders', 'Revenue', 'Analytics', 'Withdrawals', 'Harvest Planning', 'Seasonal Reports'].map((x) => `<a class="card">${x}</a>`).join('')}</nav><div><div class="card"><h2>${data.farmer?.farmName || 'Farmer Onboarding'}</h2><p>KYC: ${data.farmer?.kycStatus || 'pending'}</p></div><div class="grid three" style="margin-top:18px">${data.products.map(productCard).join('') || '<p>No products yet.</p>'}</div></div>`;
}

function renderDeliveryDashboard(data) {
  $('#dashboardBody').innerHTML = `<nav class="dashboard-nav">${['Assigned Orders', 'Route Navigation', 'Customer Call', 'OTP Verification', 'Earnings', 'History', 'Online Status', 'Support'].map((x) => `<a class="card">${x}</a>`).join('')}</nav><div><div class="card"><h2>${currency(data.earnings)}</h2><p>Total completed delivery earnings</p></div><div class="table-wrap" style="margin-top:18px"><table><thead><tr><th>Order</th><th>Status</th><th>ETA</th><th>OTP Required</th></tr></thead><tbody>${data.assignments.map((a) => `<tr><td>${a.order?.orderNumber}</td><td>${a.status}</td><td>${a.order?.eta || '-'}</td><td>Yes</td></tr>`).join('')}</tbody></table></div></div>`;
}

async function refreshCart() {
  if (!state.token) return;
  try {
    const data = await api('/cart');
    state.cart = data.cart;
    state.pricing = data.pricing;
    $('#cartCount').textContent = data.cart.items.reduce((sum, item) => sum + item.quantity, 0);
    renderCartPanel();
  } catch (error) {
    console.warn(error);
  }
}

function cartSummaryHtml() {
  const pricing = state.pricing || {};
  return `<h3>Order Summary</h3><p>Subtotal: ${currency(pricing.subtotal)}</p><p>Tax: ${currency(pricing.tax)}</p><p>Delivery: ${currency(pricing.deliveryCharge)}</p><p>Discount: ${currency(pricing.discount)}</p><h2>${currency(pricing.total)}</h2>`;
}

function renderCartPanel() {
  const panel = $('#cartPanel');
  if (!panel) return;
  if (!state.cart?.items?.length) {
    panel.innerHTML = '<p>Your cart is waiting for something crisp.</p><a class="primary" href="#/shop">Shop now</a>';
    return;
  }
  panel.innerHTML = `${state.cart.items.map((item) => `<div class="cart-line"><img src="${imageOf(item.product)}" alt="${item.product.name}"><div><strong>${item.product.name}</strong><p>${item.quantity} x ${item.product.weightOptions?.find((o) => o._id === item.weightOptionId)?.label || ''}</p></div><button class="icon-btn" data-remove="${item._id}">x</button></div>`).join('')}<div class="card" style="margin-top:16px">${cartSummaryHtml()}<a class="primary" href="#/checkout">Checkout</a></div>`;
}

function openAuth() {
  $('#authModal').classList.add('open');
}

async function handleAdd(productId, optionId, buyNow = false) {
  if (!state.token) return openAuth();
  await api('/cart/items', { method: 'POST', body: JSON.stringify({ productId, weightOptionId: optionId, quantity: 1 }) });
  await refreshCart();
  toast('Added to cart');
  if (buyNow) location.hash = '#/checkout';
}

async function route() {
  $('#loader').classList.remove('hide');
  const [path] = location.hash.replace(/^#\/?/, '').split('?');
  try {
    if (!path) renderHome();
    else if (path === 'shop') await renderShop();
    else if (path.startsWith('product/')) renderProduct(path.split('/')[1]);
    else if (path === 'track') renderTracking();
    else if (path === 'checkout') renderCheckout();
    else if (path === 'account') await renderAccount();
    else if (['admin', 'farmer', 'delivery'].includes(path)) await renderDashboard(path);
    else renderStatic(path);
  } catch (error) {
    app.innerHTML = pageHeader('Something needs attention', error.message);
  } finally {
    setTimeout(() => $('#loader').classList.add('hide'), 250);
  }
}

document.addEventListener('click', async (event) => {
  const add = event.target.closest('[data-add]');
  const buy = event.target.closest('[data-buy]');
  const remove = event.target.closest('[data-remove]');
  const weight = event.target.closest('[data-weight]');
  const thumb = event.target.closest('[data-img]');
  if (add) await handleAdd(add.dataset.add, add.dataset.option || state.selectedProductOption);
  if (buy) await handleAdd(buy.dataset.buy, buy.dataset.option || state.selectedProductOption, true);
  if (remove) {
    await api(`/cart/items/${remove.dataset.remove}`, { method: 'DELETE' });
    await refreshCart();
  }
  if (weight) {
    state.selectedProductOption = weight.dataset.weight;
    document.querySelectorAll('[data-weight]').forEach((node) => node.classList.remove('active'));
    weight.classList.add('active');
    document.querySelectorAll('[data-add],[data-buy]').forEach((node) => { node.dataset.option = state.selectedProductOption; });
  }
  if (thumb) {
    $('#mainImage').src = thumb.dataset.img;
    document.querySelectorAll('[data-img]').forEach((node) => node.classList.remove('active'));
    thumb.classList.add('active');
  }
});

document.addEventListener('submit', async (event) => {
  if (event.target.id === 'heroSearch') {
    event.preventDefault();
    location.hash = `#/shop?search=${encodeURIComponent(new FormData(event.target).get('q'))}`;
  }
  if (event.target.id === 'filters') {
    event.preventDefault();
    await loadProductsFromFilters();
  }
  if (event.target.id === 'otpForm') {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    if (!form.otp) {
      const data = await api('/auth/request-otp', { method: 'POST', body: JSON.stringify({ phone: form.phone, role: form.role }) });
      toast(`OTP sent${data.developmentOtp ? `: ${data.developmentOtp}` : ''}`);
      return;
    }
    const data = await api('/auth/verify-otp', { method: 'POST', body: JSON.stringify(form) });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('vegi14_token', data.token);
    localStorage.setItem('vegi14_user', JSON.stringify(data.user));
    $('#authModal').classList.remove('open');
    $('#loginButton').textContent = data.user.name?.split(' ')[0] || 'Account';
    await refreshCart();
    toast('Welcome to VEGI14');
  }
  if (event.target.id === 'trackForm') {
    event.preventDefault();
    const orderNumber = new FormData(event.target).get('orderNumber');
    const data = await api(`/orders/track/${orderNumber}`);
    $('#trackResult').innerHTML = `<div class="card"><h2>${data.order.orderNumber}</h2><p>Status: ${data.order.status}</p><p>ETA: ${data.order.eta}</p><div class="timeline">${data.order.trackingEvents.map((item) => `<div class="timeline-item"><span></span><p>${item.note}</p></div>`).join('')}</div></div>`;
  }
  if (event.target.id === 'checkoutForm') {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    const data = await api('/orders', { method: 'POST', body: JSON.stringify({ address: form, deliveryInstructions: form.deliveryInstructions, paymentMethod: form.paymentMethod, deliverySlot: { date: new Date().toISOString().slice(0, 10), window: form.window } }) });
    toast(`Order placed: ${data.order.orderNumber}`);
    await refreshCart();
    location.hash = `#/track`;
  }
});

$('#themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('vegi14_dark', document.body.classList.contains('dark') ? '1' : '0');
});
$('#cartButton').addEventListener('click', () => $('#cartDrawer').classList.add('open'));
$('#closeCart').addEventListener('click', () => $('#cartDrawer').classList.remove('open'));
$('#loginButton').addEventListener('click', openAuth);
$('#closeAuth').addEventListener('click', () => $('#authModal').classList.remove('open'));
$('#menuToggle').addEventListener('click', () => $('#mainNav').classList.toggle('open'));
window.addEventListener('hashchange', route);

if (localStorage.getItem('vegi14_dark') === '1') document.body.classList.add('dark');
if (state.user) $('#loginButton').textContent = state.user.name?.split(' ')[0] || 'Account';
await loadBaseData();
await route();
