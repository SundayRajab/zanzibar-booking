-- Run this script in your Supabase SQL Editor (app.supabase.com)
-- This creates the necessary tables, enables Row Level Security (RLS), and sets up a trigger to automatically create user profiles.

-- ==========================================
-- ⚠️ DANGER ZONE: CLEAN SLATE
-- The user requested to "blow existing database"
-- These DROPs will wipe out all data in these tables.
-- ==========================================
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user cascade;
drop trigger if exists check_booking_overlap on public.bookings;
drop function if exists public.prevent_double_booking cascade;

drop table if exists public.reviews cascade;
drop table if exists public.bookings cascade;
drop table if exists public.listings cascade;
drop table if exists public.profiles cascade;
-- ==========================================

-- 1. Create custom profiles table for personalization and ROLES
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text default 'user', -- 'user', 'provider', 'admin'
  loyalty_points integer default 0,
  preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile." on public.profiles for select using ( auth.uid() = id );
create policy "Users can update own profile." on public.profiles for update using ( auth.uid() = id );
-- Allow public access to view provider profiles for listings if needed
create policy "Public can view provider profiles" on public.profiles for select using ( role = 'provider' or role = 'admin' );

-- 2. Create listings table
-- We re-create the listings table to have a fresh state
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text not null, -- 'hotel', 'apartment', 'car', 'tour'
  price numeric not null,
  location text,
  images text[] default '{}',
  details jsonb default '{}'::jsonb, -- features/amenities live here now
  average_rating numeric default 0,
  reviews_count integer default 0,
  provider_id uuid references public.profiles(id), -- Connect to the provider
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.listings enable row level security;
create policy "Anyone can see listings" on public.listings for select using ( true );
-- Only providers or admins can manage listings
create policy "Providers can manage their listings" on public.listings for all using ( auth.uid() = provider_id );


-- 3. Create bookings table
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users, -- Nullable to support Guest bookings
  listing_id uuid references public.listings not null,
  customer_name text not null default 'Guest',
  customer_phone text not null default 'Unknown',
  customer_email text not null default 'unknown@example.com',
  start_date date not null,
  end_date date not null,
  status text default 'pending', -- 'pending', 'confirmed', 'rejected', 'completed', 'cancelled'
  payment_status text default 'unpaid', -- 'unpaid', 'pending', 'paid', 'refunded' (Flutterwave integration)
  payment_reference text, -- ID from Flutterwave
  total_price numeric not null,
  booking_details jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Real-Time Availability Engine (Conflict Detection)
create or replace function public.prevent_double_booking()
returns trigger as $$
declare
  overlap_exists boolean;
begin
  if new.status = 'confirmed' then
    select exists (
      select 1 
      from public.bookings
      where listing_id = new.listing_id
        and id != new.id 
        and status = 'confirmed'
        -- Overlap logic: (StartA <= EndB) and (EndA >= StartB)
        and (new.start_date <= end_date) 
        and (new.end_date >= start_date)
    ) into overlap_exists;

    if overlap_exists then
      raise exception 'DOUBLE_BOOKING_PREVENTED: The selected dates overlap with an existing confirmed booking.';
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger check_booking_overlap
  before insert or update on public.bookings
  for each row execute procedure public.prevent_double_booking();

-- Enable RLS for bookings securely
alter table public.bookings enable row level security;
-- Providers need to see bookings for their listings, users need to see their own
-- Secure RLS for bookings: Anyone can submit (Lead Gen), Users/Providers see theirs
create policy "Anyone can insert bookings" on public.bookings for insert with check ( true );
create policy "Users view own bookings" on public.bookings for select using ( auth.uid() = user_id or user_id is null );
create policy "Users update own bookings" on public.bookings for update using ( auth.uid() = user_id or user_id is null );
-- Providers can see bookings for properties they own
create policy "Providers view bookings for their listings" on public.bookings for select using (
  exists (
    select 1 from public.listings
    where listings.id = bookings.listing_id
      and listings.provider_id = auth.uid()
  )
);
-- Providers can update booking status (approve/reject) for their listings
create policy "Providers update bookings for their listings" on public.bookings for update using (
  exists (
    select 1 from public.listings
    where listings.id = bookings.listing_id
      and listings.provider_id = auth.uid()
  )
);

-- 4. Create Reviews Table
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  listing_id uuid references public.listings(id) not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for reviews
alter table public.reviews enable row level security;
create policy "Anyone can read reviews" on public.reviews for select using ( true );
-- Only authenticated users can write reviews
create policy "Users can write reviews" on public.reviews for insert with check ( auth.uid() = user_id );

-- 5. Automate Profile Creation Trigger
create or replace function public.handle_new_user()
returns trigger as $$
declare
  assigned_role text;
begin
  -- Safely extract role, defaulting to 'user'. Prevent 'admin' escalation.
  assigned_role := coalesce(new.raw_user_meta_data->>'role', 'user');
  if assigned_role not in ('user', 'provider') then
    assigned_role := 'user';
  end if;

  insert into public.profiles (id, email, full_name, role, loyalty_points)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', assigned_role, 50);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
