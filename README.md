# VEGI14

VEGI14 is a production-oriented farmer-to-customer marketplace for fresh vegetables and fruits. It includes a public storefront, customer account flows, checkout, order tracking, farmer dashboard, delivery dashboard, and admin control center.

## Stack

- Frontend: HTML5, CSS3, vanilla JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Auth: mobile OTP login plus JWT
- Integrations: provider-ready adapters for SMS, email, push, Cloudinary, Google Maps, and payments

## Quick Start

```bash
npm install
copy .env.example .env
npm run seed
npm run dev
```

Open `http://localhost:4014`.

If MongoDB is not running, the app still serves the frontend, but API data will require `MONGODB_URI`.

## Live Deployment

Deploy VEGI14 as a full Node.js app, not GitHub Pages. The Express server serves both the frontend and `/api`.

See `DEPLOYMENT.md` for Render, Railway, VPS, and production setup notes.

## Demo OTP

In development, OTP codes are logged to the console and also returned by `/api/auth/request-otp` for faster testing.

## Main Areas

- Public site: home, shop, categories, offers, plans, blog, recipes, farmer program, delivery partner, policies, FAQ, order tracking
- Customer: OTP login, profile, addresses, wishlist, cart, orders, wallet, coupons, loyalty
- Checkout: address, slot, payment, coupon, invoice-ready order summary
- Admin: revenue analytics, orders, products, pricing, users, roles, coupons, complaints, CMS, reports, audit logs
- Farmer: KYC, farm details, products, inventory, orders, revenue, harvest planning
- Delivery: assigned orders, route links, OTP delivery verification, earnings, history

## Architecture

The backend is split by concern:

- `src/models`: database schemas
- `src/controllers`: request handlers
- `src/routes`: route registration
- `src/middleware`: auth, validation, security, errors
- `src/services`: notifications, payments, storage, maps, recommendations, invoices
- `src/seed`: realistic startup demo data
- `public`: vanilla frontend application

## Production Notes

- Replace development OTP behavior with a real SMS provider.
- Set a strong `JWT_SECRET`.
- Configure `CORS_ORIGIN` to the production domain.
- Use managed MongoDB, CDN-backed image storage, HTTPS, and a process manager.
- Configure Google Maps, payment gateway webhooks, Cloudinary, email, SMS, and push providers.
- Schedule automated backups and run audit-log export jobs.
