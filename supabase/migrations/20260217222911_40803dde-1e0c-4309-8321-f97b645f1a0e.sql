
ALTER TABLE public.quotations
  ADD COLUMN price_per_child numeric DEFAULT 0,
  ADD COLUMN num_children integer DEFAULT 0,
  ADD COLUMN child_label text DEFAULT 'Child',
  ADD COLUMN terms_conditions jsonb DEFAULT '[]'::jsonb;
