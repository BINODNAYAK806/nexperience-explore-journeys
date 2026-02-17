
-- Create a public view excluding email for approved reviews
CREATE VIEW public.reviews_public AS
SELECT id, name, destination, review_text, rating, featured, created_at
FROM public.reviews
WHERE approved = true;

-- Grant access to the view
GRANT SELECT ON public.reviews_public TO anon, authenticated;
