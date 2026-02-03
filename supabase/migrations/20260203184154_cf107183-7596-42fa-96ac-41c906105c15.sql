-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  destination TEXT NOT NULL,
  review_text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  featured BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a review
CREATE POLICY "Anyone can submit reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (true);

-- Public can only see approved reviews
CREATE POLICY "Public can view approved reviews" 
ON public.reviews 
FOR SELECT 
USING (approved = true);

-- Authenticated users (admin) can view all reviews
CREATE POLICY "Admin can view all reviews" 
ON public.reviews 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Authenticated users can update reviews (for feature/approve toggle)
CREATE POLICY "Admin can update reviews" 
ON public.reviews 
FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete reviews
CREATE POLICY "Admin can delete reviews" 
ON public.reviews 
FOR DELETE 
USING (auth.role() = 'authenticated');