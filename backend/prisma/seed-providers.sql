-- Seed default payment providers
INSERT INTO "PaymentProviderSettings" (id, name, "displayName", "isEnabled", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'razorpay', 'Razorpay', false, now(), now()),
  (gen_random_uuid(), 'cashfree', 'Cashfree', false, now(), now()),
  (gen_random_uuid(), 'mock', 'Mock (Testing)', true, now(), now())
ON CONFLICT (name) DO NOTHING;

-- Seed default delivery providers
INSERT INTO "DeliveryProviderSettings" (id, name, "displayName", "isEnabled", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'delhivery', 'Delhivery', false, now(), now()),
  (gen_random_uuid(), 'shiprocket', 'Shiprocket', false, now(), now()),
  (gen_random_uuid(), 'own', 'Vendor Self-Delivery', true, now(), now()),
  (gen_random_uuid(), 'platform', 'Platform Managed', false, now(), now())
ON CONFLICT (name) DO NOTHING;

-- Seed default marketplace settings
INSERT INTO "MarketplaceSettings" (id, key, value, description, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'PLATFORM_COMMISSION_RATE', '{"rate": 0.10}'::jsonb, 'Platform commission rate (10%)', now(), now()),
  (gen_random_uuid(), 'MAINTENANCE_MODE', '{"enabled": false}'::jsonb, 'Toggle website maintenance mode', now(), now()),
  (gen_random_uuid(), 'PLATFORM_NAME', '{"name": "Marketplace Hub"}'::jsonb, 'Platform display name', now(), now()),
  (gen_random_uuid(), 'PLATFORM_CURRENCY', '{"value": "INR"}'::jsonb, 'Default platform currency', now(), now()),
  (gen_random_uuid(), 'INVOICE_PREFIX', '{"value": "INV"}'::jsonb, 'Prefix for auto-generated invoice numbers', now(), now())
ON CONFLICT (key) DO NOTHING;
