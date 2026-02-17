
-- Create itinerary_templates table
CREATE TABLE public.itinerary_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_name text NOT NULL,
  title text NOT NULL,
  description text,
  days jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_inclusions jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_exclusions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.itinerary_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view templates" ON public.itinerary_templates FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can insert templates" ON public.itinerary_templates FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update templates" ON public.itinerary_templates FOR UPDATE USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete templates" ON public.itinerary_templates FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create quotations table
CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.itinerary_templates(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_contact text,
  destination_name text NOT NULL,
  total_price numeric NOT NULL DEFAULT 0,
  travel_start_date date NOT NULL,
  travel_end_date date,
  description text,
  days jsonb NOT NULL DEFAULT '[]'::jsonb,
  inclusions jsonb NOT NULL DEFAULT '[]'::jsonb,
  exclusions jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view quotations" ON public.quotations FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can insert quotations" ON public.quotations FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update quotations" ON public.quotations FOR UPDATE USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete quotations" ON public.quotations FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on itinerary_templates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_itinerary_templates_updated_at
  BEFORE UPDATE ON public.itinerary_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
