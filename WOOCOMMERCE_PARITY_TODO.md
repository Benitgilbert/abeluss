# WooCommerce Parity Roadmap (Requirements + TODOs)

This document lists the features and implementation tasks to make Impressa operate like a modern WooCommerce store, including admin, catalog, checkout, payments, shipping, taxes, coupons, reporting, and integrations. Use it as a master checklist. Items reference current code where useful and note missing gaps.

Legend
- [ ] Not started
- [~] In progress/partial
- [x] Done

## 0) Foundations
- [~] Monorepo structure documented (README.md) – refine with env examples and scripts
- [ ] Environment config for FE/BE via .env and .env.example, validate with envalid/zod
- [ ] ESLint + Prettier across FE/BE; Husky pre-commit hooks; consistent import/order rules
- [ ] Standard error handler middleware with consistent JSON shape
- [ ] Helmet + strict CORS policies
- [ ] Pino/winston logging + request logging (pino-http)
- [ ] Health/readiness endpoints
- [ ] Dockerfiles + docker-compose for local prod parity

## 1) Catalog (Products, Categories, Attributes, Variations)
- [~] Products basic model/controllers (impressa-backend/models/Product.js)
- [ ] Product categories (tree), assign products to categories
- [ ] Product attributes (e.g., size, color) and global attributes
- [ ] Product variations (matrix of attributes -> SKU/price/stock)
- [ ] SKU and barcode fields, searchable
- [ ] Product visibility (public, hidden), featured flags
- [ ] Product images gallery (multiple), primary image
- [ ] Bulk editor (admin) and CSV import/export
- [ ] Reviews/ratings with moderation, spam protection (reCAPTCHA)

## 2) Pricing, Taxes, Currency
- [x] Client currency rendering changed to Rwf (formatRwf)
- [ ] Currency and locale config (server -> FE), server-side money formatting utility
- [ ] Taxes: tax classes, rates, inclusion/exclusion in price (per-country/region)
- [ ] Tax calculation: integrate static tables or TaxJar/Avalara adapter (configurable)
- [ ] Rounding rules, price display on catalog/cart/checkout/invoices

## 3) Inventory and Stock
- [ ] Stock management: stock qty, backorders allow/deny, low-stock threshold
- [ ] Deduct stock on checkout, restore on cancellation/failed payment
- [ ] Low-stock email alerts to admin
- [ ] Simple reservations during checkout (optional)

## 4) Cart and Checkout
- [x] Cart (localStorage) with customizations and file uploads
- [x] Guest checkout and customer checkout
- [x] Partial cart clearing after successful checkout
- [ ] Server-side carts (optional) with session tokens (to preserve carts across devices)
- [ ] Shipping address, billing address forms; validation per country
- [ ] Coupons (fixed, percent, free shipping) with rules (min spend, usage limit)
- [ ] Fees (e.g., handling) and discounts line items
- [ ] Shipping calculation (zones, methods) – see Section 5
- [ ] Taxes calculation on cart and checkout – see Section 2

## 5) Shipping
- [ ] Shipping zones and methods (flat rate, free shipping, local pickup)
- [ ] Carrier integrations (UPS/DHL/Local): estimate rates via API (configurable)
- [ ] Packing logic (dimensions/weight) for rate quotes (optional)
- [ ] Address validation (optional)

## 6) Payments
- [ ] Stripe (cards, Apple/Google Pay) integration
- [ ] PayPal integration
- [ ] Mobile money options for Rwanda (MTN/Airtel) – gateway integration
- [ ] Payment intents/webhooks: update order status on success/failure/refund
- [ ] Saved payment methods (for registered users)

## 7) Orders and Lifecycle
- [x] Orders model + statuses [pending, approved, in-production, ready, delivered, cancelled]
- [x] Public tracking by tracking ID (publicId)
- [ ] Order notes (internal and customer-visible), timeline history
- [ ] Refunds/returns workflow; RMA numbers
- [ ] Invoices and packing slips PDF (email + print), barcodes/QRs
- [ ] Email notifications templates (order confirmation, shipped, delivered)
- [ ] Admin order search by email, phone, publicId, product SKU
- [ ] Bulk status updates, export CSV/PDF invoices

## 8) Customers and Accounts
- [ ] Public registration and login screens (customer role) – FE
- [ ] My Account area: orders history, re-order, addresses, profile
- [ ] Password resets and email verification
- [ ] GDPR download/delete requests (optional)
- [ ] Roles and capabilities (admin, staff, customer) hardening

## 9) Promotions and Marketing
- [ ] Coupons/vouchers system (API + admin UI)
- [ ] Email newsletter signup (Mailchimp/SendGrid Contacts)
- [ ] Abandoned cart emails (server-side carts required)
- [ ] Product recommendations (top sellers, related, recently viewed)
- [ ] SEO: metadata, structured data (JSON-LD), sitemap

## 10) Reporting and Analytics
- [~] Monthly report PDF with charts (QuickChart) and metrics
- [ ] Sales reports by day/week/month, by product/category, taxes, shipping, coupons
- [ ] Dashboard widgets (conversion rate, AOV, top referrers – if tracked)
- [ ] GA4 + Meta Pixel events (view_item, add_to_cart, begin_checkout, purchase)

## 11) Files and Media
- [~] Product images served from /uploads
- [ ] Media library API and image optimization (sharp), thumbnails, WebP
- [ ] CDN support (Cloudflare/Akamai) configurable origin

## 12) Email and Notifications
- [~] Nodemailer configured (Gmail) – switch to SMTP provider (SendGrid/Mailgun)
- [ ] Transactional email templates with branding (MJML/Handlebars)
- [ ] Email deliverability: SPF/DKIM/DMARC guide in README

## 13) API and Integrations
- [ ] REST API docs (OpenAPI/Swagger) for products, orders, customers, coupons, shipping, etc.
- [ ] Webhooks for order.created/updated/refunded, product.updated
- [ ] Admin token scopes/keys for external integrations
- [ ] Import/export endpoints (CSV/JSON)

## 14) Security and Compliance
- [ ] Rate limiting on public endpoints (orders/public, track)
- [ ] reCAPTCHA for forms (register, login, reviews, guest checkout)
- [ ] Input validation (zod/express-validator) everywhere
- [ ] Secrets management and production configs guide
- [ ] Privacy policy and terms (docs)

## 15) Performance
- [ ] Query indexes (orders by createdAt, publicId unique; products by name/SKU)
- [ ] Compression (gzip/br) and caching headers
- [ ] React code-splitting for large pages
- [ ] Image optimization, lazy loading

## 16) DevOps and Testing
- [ ] CI (GitHub Actions): lint, test, build
- [ ] Unit tests (services) and route tests (Supertest)
- [ ] FE tests (RTL) for cart/checkout/tracking; E2E (Playwright/Cypress)
- [ ] Staging environment; seed scripts; migrations strategy
- [ ] Cron jobs: distribute lock or single worker instance

---

## Implementation Notes (Mapping to Current Code)
- FE routes: Shop (/shop), Product (/product/:id), Cart (/cart), Checkout (/checkout), Track (/track), Admin pages under /admin
- BE key files:
  - server.js – ensure single mount per router; add helmet, CORS, error handler
  - routes/orderRoutes.js – now supports guest orders and uploads; add validation + rate limits
  - models/Product.js – extend with categories, attributes, SKU, variations
  - models/Order.js – has publicId; add notes, address fields, totals (subtotal, tax, shipping, discount, grand total)
  - utils/pdfLayout.js – unify invoice/packing slip template
  - utils/chartImages.js – add timeout/caching

## Data Model Extensions (draft)
- Product
  - sku: String (unique)
  - categories: [ObjectId Category]
  - attributes: [{ name, values: [String] }]
  - variations: [{ sku, attributes: { size, color }, price, stock }]
  - images: [String]
- Order
  - billingAddress, shippingAddress
  - totals: { items, shipping, tax, discount, grand }
  - payment: { method, status, transactionId }
  - shipping: { method, cost, trackingNumber, carrier }
  - notes: [{ text, author, at }]

## Milestones
- M1: Security/validation, server.js cleanup, REST docs, email templates
- M2: Payments (Stripe/PayPal), shipping zones, taxes, coupons
- M3: Catalog extensions (categories/variations), My Account
- M4: Reporting suite, performance hardening, CI/CD

