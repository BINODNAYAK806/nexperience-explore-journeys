
-- Fix the security definer view warning by setting security_invoker
ALTER VIEW public.reviews_public SET (security_invoker = on);
