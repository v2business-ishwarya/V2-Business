
-- Seed sample data for testing (removable later)
-- Create two demo vendor auth users + one demo customer
DO $$
DECLARE
  v1 uuid := '11111111-1111-1111-1111-111111111111';
  v2 uuid := '22222222-2222-2222-2222-222222222222';
  c1 uuid := '33333333-3333-3333-3333-333333333333';
  pwd text := crypt('Password123!', gen_salt('bf'));
BEGIN
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    (v1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vendor1@demo.test', pwd, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aria Studio Owner"}', now(), now(), '', '', '', ''),
    (v2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vendor2@demo.test', pwd, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nomad Goods Owner"}', now(), now(), '', '', '', ''),
    (c1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'customer@demo.test', pwd, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Customer"}', now(), now(), '', '', '', '')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), v1, v1::text, jsonb_build_object('sub', v1::text, 'email', 'vendor1@demo.test'), 'email', now(), now(), now()),
    (gen_random_uuid(), v2, v2::text, jsonb_build_object('sub', v2::text, 'email', 'vendor2@demo.test'), 'email', now(), now(), now()),
    (gen_random_uuid(), c1, c1::text, jsonb_build_object('sub', c1::text, 'email', 'customer@demo.test'), 'email', now(), now(), now())
  ON CONFLICT DO NOTHING;
END $$;

-- Categories
INSERT INTO public.categories (id, slug, name, description, is_featured, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'fashion', 'Fashion', 'Apparel and accessories', true, 1),
  ('a1000000-0000-0000-0000-000000000002', 'home-living', 'Home & Living', 'Everything for your home', true, 2),
  ('a1000000-0000-0000-0000-000000000003', 'electronics', 'Electronics', 'Gadgets and devices', true, 3),
  ('a1000000-0000-0000-0000-000000000004', 'beauty', 'Beauty', 'Skincare and cosmetics', true, 4),
  ('a1000000-0000-0000-0000-000000000005', 'outdoors', 'Outdoors', 'Gear for adventures', true, 5)
ON CONFLICT (id) DO NOTHING;

-- Vendors (approved + featured)
INSERT INTO public.vendors (id, user_id, slug, name, tagline, description, logo_url, banner_url, email, status, is_featured) VALUES
  ('b1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aria-studio', 'Aria Studio', 'Minimal apparel, thoughtfully made', 'A small independent studio crafting timeless pieces.', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200', 'vendor1@demo.test', 'approved', true),
  ('b1000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'nomad-goods', 'Nomad Goods', 'Gear for everyday adventures', 'Durable travel essentials designed to last.', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200', 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=1200', 'vendor2@demo.test', 'approved', true)
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO public.products (vendor_id, category_id, name, slug, description, brand, price, discount_price, stock, featured_image, status, tags) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Linen Overshirt', 'linen-overshirt', 'Breathable linen overshirt in warm sand.', 'Aria', 89.00, 69.00, 24, 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800', 'active', ARRAY['linen','shirt']),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Wool Knit Sweater', 'wool-knit-sweater', 'Cozy merino wool knit.', 'Aria', 129.00, NULL, 15, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800', 'active', ARRAY['wool','sweater']),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'Ceramic Perfume Bottle', 'ceramic-perfume-bottle', 'Refillable ceramic perfume vessel.', 'Aria', 45.00, NULL, 40, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800', 'active', ARRAY['beauty']),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 'Weatherproof Backpack 25L', 'weatherproof-backpack-25l', 'Rugged 25L pack for daily commutes and weekend trips.', 'Nomad', 149.00, 119.00, 30, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', 'active', ARRAY['bag','travel']),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 'Insulated Water Bottle', 'insulated-water-bottle', '24hr cold, 12hr hot. 750ml.', 'Nomad', 34.00, NULL, 120, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800', 'active', ARRAY['bottle']),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'Travel Charger 65W', 'travel-charger-65w', 'Compact GaN charger with international plugs.', 'Nomad', 59.00, 49.00, 60, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800', 'active', ARRAY['electronics'])
ON CONFLICT (slug) DO NOTHING;

-- Banners
INSERT INTO public.banners (title, subtitle, image_url, link_url, is_active, sort_order) VALUES
  ('New Season Arrivals', 'Fresh pieces from independent studios', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200', '/search', true, 1),
  ('Adventure Ready', 'Gear for the weekend', 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=1200', '/store/nomad-goods', true, 2),
  ('Featured Vendors', 'Meet our makers', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200', '/vendors', true, 3)
ON CONFLICT DO NOTHING;
