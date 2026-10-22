# Notun Bazar — Neon PostgreSQL

## Features
- Customer: no account/login; browse, search, cart and checkout.
- Admin-only login; add/remove products, upload image, edit price/stock.
- Orders stored in Neon with order history and status.
- Visit/page analytics and product views; popular products sorted by views.
- Product images uploaded into PostgreSQL as base64 data URLs (2 MB max each).
- Product categories: ইলেকট্রনিক, মোবাইল আইটেম, উপহার সামগ্রী, পোশাক.

## Setup
1. Create a Neon PostgreSQL project and copy the pooled connection string.
2. Copy `.env.example` to `.env`, then set `DATABASE_URL`, `ADMIN_USER`, and a strong `ADMIN_PASSWORD`.
3. In PowerShell:
   ```powershell
   npm install
   $env:DATABASE_URL="YOUR_NEON_CONNECTION_STRING"
   $env:ADMIN_USER="admin"
   $env:ADMIN_PASSWORD="YOUR_STRONG_PASSWORD"
   npm start
   ```
4. Shop: http://localhost:3000 ; Admin login: storefront header-এর “অ্যাডমিন” বাটন; direct panel: http://localhost:3000/admin-panel
5. For Render or another host, set the same environment variables in its dashboard. Never expose DATABASE_URL to browser code.

Tables are created automatically at startup. Seed products are added only if products table is empty.

## Analytics notes
- Page visits are counted with a random browser ID stored in localStorage; product views are recorded when customer clicks “কার্টে যোগ করুন”.
- Popular products sort by counted product views. This is a lightweight analytics implementation, not guaranteed to identify a person and not an invasive identity tracker.
- `visits` stores page paths and random visitor IDs; do not collect sensitive information there.

## Production caveats
This is an MVP. Admin sessions use stateless HMAC-signed tokens with a 12-hour expiry so they work across Vercel serverless instances; changing `ADMIN_PASSWORD` invalidates existing tokens. Before taking real orders, add rate limiting, CSRF/security headers, stronger server-side validation, and database backups. Uploaded product images are stored in PostgreSQL, so they persist across deployments but can increase database storage. Payment gateway (bKash/Nagad/SSLCommerz) and courier integrations are not included.


## Customer shopping flow
- Product cards open `/product/:id` for product photos/details and quantity selection.
- Add to cart persists in browser localStorage. `/checkout` is a separate COD checkout page with customer name, phone and address.
- Orders are saved to Neon via `/api/orders`; admin can review them in the admin panel.

## Storefront UI refresh
- Updated the home page to a reference-inspired Notun Bazar layout with four colorful image-led categories, category counts, category filter chips, responsive product cards, promotional strip, service highlights, and a persistent cart/checkout bar.
- Added local category image assets under `public/images/` so category imagery does not depend on remote image hosts.
- Category cards use existing product images when available; otherwise they use local category artwork. Selecting a category filters the product grid to that category, and an empty category shows a clear empty-state message.
- Existing Neon/PostgreSQL, admin login, multi-image product upload, product detail, cart, COD checkout, and order APIs are retained.


## Facebook product sharing and sales tracking
- Set `PUBLIC_BASE_URL=https://your-real-domain.example` in the deployment environment after deploying the site with HTTPS. Do not use localhost for Facebook sharing.
- In Admin, use **Facebook-এ শেয়ার** or **লিংক কপি** next to a product.
- Product links use `utm_source=facebook`, `utm_medium=social`, and a product campaign code. When a buyer completes checkout within 30 days after arriving from that link, the order is tagged as Facebook-attributed.
- Admin > Facebook Marketing shows Facebook-attributed orders and delivered sales. Delivered sales count only orders whose status is `ডেলিভারি সম্পন্ন`; pending and cancelled orders are shown separately.
- Facebook link previews use Open Graph tags and a public image endpoint. The site must be publicly reachable over HTTPS for Facebook to fetch previews. Localhost previews will not work.
- Attribution is browser-based and may not connect orders if a buyer changes device/browser or clears browser storage. No Meta Pixel is required for this basic share-and-sales workflow.


## Vercel deployment (important)
- This project includes `api/index.js` and `vercel.json` so Express routes run as a Vercel Serverless Function.
- In Vercel Project Settings -> Environment Variables, set `DATABASE_URL`, `ADMIN_USER`, `ADMIN_PASSWORD`, and `PUBLIC_BASE_URL` to the real production HTTPS URL.
- Redeploy after saving variables. `DATABASE_URL` must be the Neon pooled connection string.
- Check `https://YOUR_DOMAIN/api/products` directly. It should return JSON. If it returns a Vercel deployment error, inspect Vercel Runtime Logs.
- Do not commit `.env` or expose database credentials.
