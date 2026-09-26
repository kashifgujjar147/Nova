# NovaCart — Full-stack E-commerce + Affiliate Platform

NovaCart is an existing React/Vite + TypeScript storefront with an Express/TypeScript + MongoDB backend. The implementation uses server-authoritative pricing, inventory, checkout, payment review, affiliate attribution and commission state.

## Run

1. `npm install`
2. Copy `server/.env.example` to `server/.env` and configure MongoDB plus strong secrets.
3. `npm run seed`
4. `npm run dev`
5. `npm run build`
6. `npm test`

Seed credentials are for local development only:
- Admin: `admin@novacart.local` / `Admin123!ChangeMe`
- Customer: `customer@novacart.local` / `Customer123!ChangeMe`

Change or remove these credentials before any real deployment.

## Security model

- Registration creates a unique server-side Affiliate record and code.
- Referral visits are validated by the server and stored in an HttpOnly attribution cookie containing a signed attribution ID.
- Checkout ignores client-supplied cart items, prices, commission values and affiliate codes. It loads the persistent cart and recalculates everything on the server.
- Stock decrements use conditional MongoDB updates inside transactions and create inventory transactions.
- Payment, order and commission state transitions are explicit.
- Coupon usage is checked and incremented transactionally with per-user usage records.
- Admin APIs enforce RBAC on the backend.
- Production CORS uses an explicit allow-list.
- Sensitive authentication fields are excluded from normal user responses.

## External configuration

The repository intentionally does not claim a real payment gateway, email provider, object-storage provider, WhatsApp/SMS provider or push-notification provider without credentials and an actual adapter. Manual payment methods require the administrator to configure account instructions and review submissions. For production, use HTTPS and configure `ALLOWED_ORIGINS` to the exact storefront origins.

## Architecture

```text
client/
server/
shared/
```

Backend request flow:

```text
Route → Middleware → Controller → Service → Model
```

## Production hardening pass

This pass adds/strengthens:
- variant-level SKU/price/stock/attribute/commission snapshots and atomic stock operations;
- order and payment idempotency keys;
- centralized inventory adjustment/reversal audit records;
- explicit COD collection after delivery before commission eligibility;
- affiliate product-slug attribution resolution and commission item snapshots;
- restricted coupon discounts against eligible product/category subtotal;
- delivery return guard requiring refund of a delivered order first;
- secure upload extension/signature handling and delivery proof metadata;
- real email-provider adapter configuration for verification/password reset;
- verification/reset frontend routes;
- stock availability helper for variant products;
- additional business invariant tests and request validation.

## Verification note

The source tree was syntax-parsed successfully for all 140 TypeScript/TSX source files in the available environment. Full `npm install` could not complete because the package installation timed out, so dependency-backed typecheck, Vitest, Vite build, MongoDB transaction/concurrency tests, and browser E2E tests could not be truthfully marked as passed. Install dependencies in a network-enabled environment and run `npm run typecheck`, `npm test`, and `npm run build` before production release.


## Catalog / storefront completion pass

The existing architecture was preserved. This pass adds:
- database-backed homepage promotional cards with admin CRUD and media upload support;
- richer banner/video administration and seeded demo content;
- product discount modes, limited-time offers, offer windows, video thumbnails, gender/weight metadata;
- server-side effective pricing used by catalog and checkout;
- backend search filters for gender, brand, availability and min/max price;
- admin social/contact configuration;
- low/out-of-stock admin notifications;
- delivery recipient confirmation with optional customer signature;
- delivery proof/signature administration;
- additional dashboard order/payment/delivery counters;
- demo catalog, banners, promotions, video and reviews.

New migration: `npm run migrate:catalog -w server`.

Media uploaded through the new admin media flow is stored using the existing Upload model and served through the API. Replace seeded demo media with production media before launch.

## Verification

The source tree was type-parsed with the globally available TypeScript compiler. The remaining compiler errors in this environment are dependency-resolution errors because `npm install` could not complete within the available network/time window; therefore dependency-backed typecheck, tests and Vite build were not claimed as passed. After installing dependencies in a network-enabled environment, run:

```bash
npm install
npm run typecheck
npm test
npm run build
npm run migrate:catalog -w server
npm run seed
```
