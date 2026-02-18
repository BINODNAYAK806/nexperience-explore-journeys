
-- Add new fields to itinerary_templates
ALTER TABLE public.itinerary_templates
  ADD COLUMN IF NOT EXISTS default_terms_conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS default_important_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS default_hotel_details jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS default_brief_itinerary jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cities_covered text[] NOT NULL DEFAULT '{}';

-- Add new fields to quotations
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS important_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hotel_details jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS brief_itinerary jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cities_covered text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bank_details text;
