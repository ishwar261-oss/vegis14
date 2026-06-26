# Live Deployment for VEGI14

VEGI14 should be deployed as a full Node.js app, not as GitHub Pages. The Express server serves both:

- Frontend from `public/`
- Backend APIs from `/api`

## Recommended Simple Path: Render

1. Push this project to GitHub.
2. Create a MongoDB Atlas database and copy its connection string.
3. In Render, create a new Web Service from the GitHub repository.
4. Use:

```text
Build Command: npm install
Start Command: npm start
Health Check Path: /health
```

5. Add environment variables:

```text
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
APP_BASE_URL=https://your-live-domain
OWNER_PHONES=+91xxxxxxxxxx
OWNER_EMAILS=owner@example.com
```

6. Deploy.

Your live website will be available at the Render service URL, and APIs will work on the same domain.

## Optional Seed Data

Run the seed script once from the service shell or locally against the production database:

```bash
npm run seed
```

## Other Hosts

The app can also be deployed on Railway, Fly.io, VPS, DigitalOcean, AWS, Azure, or any Node.js host. Use the same commands:

```bash
npm install
npm start
```

## Important

GitHub Pages is static-only and cannot run this backend. Use GitHub only for source code, then connect the repository to a Node.js hosting provider.
