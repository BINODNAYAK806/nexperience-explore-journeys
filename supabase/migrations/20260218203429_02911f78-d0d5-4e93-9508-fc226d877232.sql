
-- Create SEO settings table for managing meta data per page
CREATE TABLE public.seo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL UNIQUE,
  page_name TEXT NOT NULL,
  page_type TEXT NOT NULL DEFAULT 'page',
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  og_image TEXT,
  canonical_url TEXT,
  robots_directive TEXT DEFAULT 'index, follow',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage SEO settings
CREATE POLICY "Only admins can view seo_settings"
  ON public.seo_settings FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert seo_settings"
  ON public.seo_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update seo_settings"
  ON public.seo_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete seo_settings"
  ON public.seo_settings FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update timestamp trigger
CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON public.seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create sitemap/robots config table
CREATE TABLE public.seo_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view seo_config"
  ON public.seo_config FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert seo_config"
  ON public.seo_config FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update seo_config"
  ON public.seo_config FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete seo_config"
  ON public.seo_config FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_seo_config_updated_at
  BEFORE UPDATE ON public.seo_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default SEO entries for all pages
INSERT INTO public.seo_settings (page_path, page_name, page_type, meta_title, meta_description, meta_keywords) VALUES
  ('/', 'Homepage', 'page', 'NexYatra - Affordable Travel Packages from Surat | Dubai, Bali, Kerala Tours 2026', 'Book affordable travel packages to Dubai, Bali, Kerala, Manali & more starting ₹8,999. NexYatra - Surat''s trusted travel agency.', 'travel packages from Surat, affordable tours 2026, Dubai tour packages'),
  ('/destinations', 'All Destinations', 'category', 'Travel Destinations 2026 | Affordable Tour Packages | NexYatra', 'Explore affordable travel packages to popular destinations worldwide. Book customized tours with NexYatra.', 'travel destinations, tour packages, affordable travel'),
  ('/about', 'About Us', 'page', 'About NexYatra - Trusted Travel Agency in Surat', 'Learn about NexYatra, Surat''s trusted travel agency offering affordable tour packages worldwide.', 'about NexYatra, travel agency Surat'),
  ('/contact', 'Contact Us', 'page', 'Contact NexYatra - Get in Touch for Travel Packages', 'Contact NexYatra for customized travel packages. Call, email, or visit our Surat office.', 'contact NexYatra, travel agency contact'),
  ('/terms', 'Terms & Conditions', 'page', 'Terms & Conditions | NexYatra Travel Agency', 'Read the terms and conditions for booking travel packages with NexYatra.', 'terms conditions, travel booking terms'),
  ('/privacy', 'Privacy Policy', 'page', 'Privacy Policy | NexYatra Travel Agency', 'NexYatra''s privacy policy explaining how we collect and use your data.', 'privacy policy, data protection'),
  ('/refund', 'Refund Policy', 'page', 'Refund & Cancellation Policy | NexYatra Travel Agency', 'Understand NexYatra''s refund and cancellation policies for travel bookings.', 'refund policy, cancellation policy');

-- Seed default robots.txt and sitemap config
INSERT INTO public.seo_config (config_key, config_value) VALUES
  ('robots_txt', '# NexYatra Travel Agency - robots.txt
# https://www.nexyatra.in

User-agent: *
Allow: /

# Sitemap location
Sitemap: https://www.nexyatra.in/sitemap.xml

# Crawl-delay for all bots
Crawl-delay: 1

# Disallow admin and internal routes
Disallow: /admin
Disallow: /dashboard
Disallow: /payment-callback
Disallow: /checkout/

# Allow all search engine bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /'),
  ('sitemap_extra_urls', '');
