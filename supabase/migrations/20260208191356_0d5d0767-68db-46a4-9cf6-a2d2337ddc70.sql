-- Step 1: Create the app_role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Step 2: Create user_roles table for RBAC
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Step 3: Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policy for users to view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Step 5: Create SECURITY DEFINER function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 6: Fix journey_requests policies - drop overly permissive ones
DROP POLICY IF EXISTS "update" ON journey_requests;
DROP POLICY IF EXISTS "DELET" ON journey_requests;
DROP POLICY IF EXISTS "Enable read acess for authenticated users" ON journey_requests;
DROP POLICY IF EXISTS "Allow anonymous reads" ON journey_requests;

-- Create proper admin-only policies for journey_requests
CREATE POLICY "Only admins can view journey requests"
  ON journey_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update journey requests"
  ON journey_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete journey requests"
  ON journey_requests FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Keep public insert for form submissions
-- (Already exists: "Allow any user to insert journey requests")

-- Step 7: Fix contact_messages policies
DROP POLICY IF EXISTS "Anyone can view contact messages" ON contact_messages;

CREATE POLICY "Only admins can view contact messages"
  ON contact_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Keep public insert for form submissions
-- (Already exists: "Anyone can submit contact messages")

-- Step 8: Fix destinations policies
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON destinations;
DROP POLICY IF EXISTS "Allow public access to destinations" ON destinations;

-- Public can READ destinations (required for the site to work)
CREATE POLICY "Public can view destinations"
  ON destinations FOR SELECT
  USING (true);

-- Only admins can modify destinations
CREATE POLICY "Only admins can insert destinations"
  ON destinations FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update destinations"
  ON destinations FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete destinations"
  ON destinations FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Step 9: Fix reviews policies
DROP POLICY IF EXISTS "Admin can delete reviews" ON reviews;
DROP POLICY IF EXISTS "Admin can update reviews" ON reviews;
DROP POLICY IF EXISTS "Admin can view all reviews" ON reviews;

-- Only admins can manage reviews
CREATE POLICY "Only admins can view all reviews"
  ON reviews FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR approved = true);

CREATE POLICY "Only admins can update reviews"
  ON reviews FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete reviews"
  ON reviews FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Keep public insert and public read for approved reviews
-- (Already exists: "Anyone can submit reviews" and "Public can view approved reviews")