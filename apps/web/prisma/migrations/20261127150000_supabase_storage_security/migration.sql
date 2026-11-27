-- Supabase Data API hardening: application tables are server-only.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PointLedger" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeliveryJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeliveryLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebsiteSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Announcement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentMethodSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

DO $grants$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
    EXECUTE 'REVOKE ALL ON TABLE "User","Session","ProductCategory","Product","Order","OrderItem","PaymentTransaction","PointLedger","DeliveryJob","DeliveryLog","WebsiteSetting","Announcement","PaymentMethodSetting","AuditLog" FROM anon, authenticated';
  END IF;
END
$grants$;

-- Storage is provided by Supabase. Skip this block on the plain PostgreSQL service used by CI.
DO $storage$
BEGIN
  IF to_regclass('storage.buckets') IS NOT NULL THEN
    EXECUTE $bucket$
      INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
      VALUES
       ('product-images','product-images',true,5242880,ARRAY['image/jpeg','image/png','image/webp']),
       ('site-assets','site-assets',true,5242880,ARRAY['image/jpeg','image/png','image/webp','image/svg+xml']),
       ('payment-proofs','payment-proofs',false,5242880,ARRAY['image/jpeg','image/png','image/webp'])
      ON CONFLICT (id) DO UPDATE SET
       public=EXCLUDED.public,
       file_size_limit=EXCLUDED.file_size_limit,
       allowed_mime_types=EXCLUDED.allowed_mime_types
    $bucket$;
  END IF;

  IF to_regclass('storage.objects') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public can read product images') THEN
      EXECUTE 'CREATE POLICY "Public can read product images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = ''product-images'')';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public can read site assets') THEN
      EXECUTE 'CREATE POLICY "Public can read site assets" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = ''site-assets'')';
    END IF;
  END IF;
END
$storage$;
