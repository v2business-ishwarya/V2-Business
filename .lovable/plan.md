# Multi-Vendor Marketplace — Build Plan

Given the size of the spec, I'll ship a solid **foundational MVP** first (all three roles working end-to-end, empty database, no fake data), then extend with the polish features (scheduled discounts, coupons, banners, analytics charts, reviews) in follow-up turns.

## v1 scope (this build)

**Auth & roles**

- Lovable Cloud (Supabase) with email/password + Google sign-in
- `profiles` table (name, avatar), separate `user_roles` table with enum `customer | vendor | admin` and `has_role()` security-definer function
- Signup flow lets users register as Customer or Vendor; Admin is granted by SQL/manual (documented)

**Customer**

- Home: search bar, categories, featured vendors, latest products, top discounts
- Global search across products / descriptions / vendors / categories with filters (price, category, vendor, rating, availability, discount)
- Product detail page, wishlist, cart, checkout (creates order, no real payment), order history, profile & addresses
- Storefront route `/store/$slug` with banner, logo, about, product grid

**Vendor**

- Vendor dashboard: sales, revenue, orders, product count, low-stock alerts, recent orders
- Products CRUD with multiple image upload (Supabase Storage), categories, price/discount, stock, SKU, tags, variants (simple), status
- Orders list + status updates
- Store settings (logo, banner, description, address, hours, social links)

**Admin**

- Approve/suspend vendors
- Manage categories, products, customers, orders
- Feature vendors/categories, homepage banners
- Platform-wide revenue/orders overview

**Design**

- Clean minimal SaaS look, white surfaces, soft shadows, rounded corners, one refined accent color
- Tailwind v4 design tokens in `src/styles.css`, shadcn components, Framer Motion for tasteful transitions, Lucide icons
- Proper empty states everywhere ("No products yet", "Start by adding your first product")
- Loading skeletons, toasts, confirmation dialogs

## Deferred to follow-ups

- Scheduled discounts, advanced variants matrix, coupons engine, reviews & ratings write flow (schema included, UI later), rich analytics charts, email verification templates, real Stripe/Stripe Connect payments, product import/export.

## Technical outline

- TanStack Start + Cloud/Supabase per project conventions
- Tables: `profiles`, `user_roles`, `vendors`, `categories`, `products`, `product_images`, `product_variants`, `carts`, `cart_items`, `wishlist`, `orders`, `order_items`, `addresses`, `reviews`, `banners`, `coupons`, `vendor_features`
- RLS on every table (owner-scoped writes; public reads only for approved vendors/active products/categories/banners)
- Storage buckets: `product-images` (public), `store-assets` (public)
- Server functions for admin/vendor writes via `requireSupabaseAuth`; public reads via server publishable client
- Routes: `/`, `/search`, `/product/$slug`, `/store/$slug`, `/category/$slug`, `/cart`, `/checkout`, `/auth`, and `_authenticated/` subtree for `/account/*`, `/vendor/*`, `/admin/*`

I'll enable Lovable Cloud first, then build in this order: schema → auth → design system → customer surfaces → vendor dashboard → admin panel. Follow-up turns will layer on coupons, reviews UI, analytics charts, and scheduled discounts.
