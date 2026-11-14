# Notes Store – Digital Notes Marketplace

React (JavaScript, Vite) + Express + MongoDB (Mongoose) + Razorpay.

## Setup
1. Install MongoDB locally (or use Atlas) and copy `.env.example` to `.env` in the project root.
2. `npm run install:all`
3. `npm run dev`  → client http://localhost:5173, API http://localhost:5000/api/health

## Structure
- `client/` React app (pages, components, services, styles). Vite proxies `/api` to the server.
- `server/` Express API (config, models, controllers, routes, middleware, services, uploads).
- `server/uploads/` private PDF storage. Never served statically.

## Security rules baked into the architecture
- Razorpay secret and webhook secret live only in server env vars.
- Orders become PAID only after server-side signature verification or a verified webhook.
- Webhook route is mounted before `express.json()` using the raw body.
- Auth via httpOnly cookie JWT; passwords hashed with bcrypt.

## Build phases
1-2 architecture and scaffold (done) · 3 home · 4 details+checkout · 5 backend+DB · 6 Razorpay test mode ·
7 verification+webhooks · 8 secure PDFs+accounts · 9 admin · 10 settlements/refunds/revenue · 11 E2E tests · 12 deploy.

## Seeding sample products
`npm run seed` inserts the sample catalogue (`npm run seed -- --reset` replaces it).
Seller profile is set via env vars (SELLER_NAME, SELLER_HEADLINE, SELLER_AVATAR, SELLER_INSTAGRAM, SELLER_YOUTUBE, SELLER_ABOUT).
Product thumbnails are uploaded in the Admin Dashboard (Phase 9).
