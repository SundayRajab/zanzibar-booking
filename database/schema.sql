-- Run this script in your Supabase SQL Editor (app.supabase.com)
-- This creates the necessary tables (if they don't exist), enables Row Level Security (RLS), and sets up a trigger to automatically create user profiles upon Firebase signup.

-- 1. Create custom profiles table for personalization (links securely to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  loyalty_points integer default 0,
  preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;
drop policy if exists "Users can view own profile." on public.profiles;
create policy "Users can view own profile." on public.profiles for select using ( auth.uid() = id );
drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles for update using ( auth.uid() = id );

-- 2. Create bookings table (if it doesn't already exist)
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  listing_id uuid references public.listings not null,
  booking_date date not null,
  status text default 'pending',
  total_price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for bookings securely
alter table public.bookings enable row level security;
drop policy if exists "Users can view own bookings." on public.bookings;
-- For prototype Admin purposes, we allow all authenticated users to view & update bookings.
-- In production, this should check for an is_admin flag in the profiles table.
create policy "Enable all to view" on public.bookings for select using ( true );
drop policy if exists "Users can insert own bookings." on public.bookings;
create policy "Users can insert own bookings." on public.bookings for insert with check ( auth.uid() = user_id );
drop policy if exists "Enable all to update" on public.bookings;
create policy "Enable all to update" on public.bookings for update using ( true );

-- 3. Automate Profile Creation Trigger
-- Automatically populates the public.profiles table every time someone registers, pre-loading 50 loyalty points.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, loyalty_points)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 50);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
