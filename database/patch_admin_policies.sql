/*
  Patch to extend RLS policies allowing admin role to access all records.
  This file should be executed in Supabase SQL editor after existing schema.
*/

-- 1. Admin can view all profiles
CREATE OR REPLACE POLICY "Admin can view all profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 2. Admin can update any profile (including role changes)
CREATE OR REPLACE POLICY "Admin can modify all profiles"
ON public.profiles FOR ALL
USING (
  auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
) WITH CHECK (
  auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. Admin can manage all listings (create, update, delete)
CREATE OR REPLACE POLICY "Admin can manage all listings"
ON public.listings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. Admin can view all bookings
CREATE OR REPLACE POLICY "Admin can view all bookings"
ON public.bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Admin can manage all bookings (update status, etc.)
CREATE OR REPLACE POLICY "Admin can manage all bookings"
ON public.bookings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. Admin can read/update system settings
CREATE OR REPLACE POLICY "Admin can manage system settings"
ON public.system_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
);
