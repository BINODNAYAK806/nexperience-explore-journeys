ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS price_per_person numeric DEFAULT 0;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS num_persons integer DEFAULT 2;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS person_label text DEFAULT 'Adult';