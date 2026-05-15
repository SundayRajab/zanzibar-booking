-- Existing tables updates...
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists id_document_url text;
alter table public.profiles add column if not exists notification_preferences jsonb default '{"email": true, "sms": false, "push": true}'::jsonb;
alter table public.profiles add column if not exists referral_code text unique default substr(md5(random()::text), 0, 8);
alter table public.profiles add column if not exists referred_by uuid references auth.users;

-- Create favorites table
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  listing_id uuid references public.listings not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, listing_id)
);
alter table public.favorites enable row level security;
drop policy if exists "Users can manage their own favorites" on public.favorites;
create policy "Users can manage their own favorites" on public.favorites for all using ( auth.uid() = user_id );

-- Create notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  message text not null,
  type text default 'info',
  read boolean default false,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.notifications enable row level security;
drop policy if exists "Users can see their own notifications" on public.notifications;
create policy "Users can see their own notifications" on public.notifications for select using ( auth.uid() = user_id );
drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications" on public.notifications for update using ( auth.uid() = user_id );

-- Create support_messages table (Real Chat)
create table if not exists public.support_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  admin_id uuid references auth.users,
  listing_id uuid references public.listings, -- Optional: link to a specific listing
  subject text,
  message text not null,
  status text default 'open',
  is_from_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.support_messages enable row level security;
drop policy if exists "Users can see their own messages" on public.support_messages;
create policy "Users can see their own messages" on public.support_messages for select using ( auth.uid() = user_id or auth.uid() = admin_id );
drop policy if exists "Users can send messages" on public.support_messages;
create policy "Users can send messages" on public.support_messages for insert with check ( auth.uid() = user_id );

-- Create booking_tracking table
create table if not exists public.booking_tracking (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings not null,
  stage text not null, -- 'confirmed', 'payment_verified', 'host_approved', 'ready', 'completed'
  status text default 'pending', -- 'pending', 'current', 'completed'
  completed_at timestamp with time zone,
  estimated_at timestamp with time zone,
  notes text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.booking_tracking enable row level security;
drop policy if exists "Users can view tracking for their bookings" on public.booking_tracking;
create policy "Users can view tracking for their bookings" on public.booking_tracking for select using (
  exists (
    select 1 from public.bookings
    where bookings.id = booking_tracking.booking_id
      and (bookings.user_id = auth.uid() or exists (
        select 1 from public.listings
        where listings.id = bookings.listing_id
          and listings.provider_id = auth.uid()
      ))
  )
);

-- Create payment_transactions table
create table if not exists public.payment_transactions (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings not null,
  user_id uuid references auth.users not null,
  amount numeric not null,
  currency text default 'USD',
  provider text not null, -- 'flutterwave', 'selcom', 'dpo'
  provider_reference text,
  status text default 'pending', -- 'pending', 'success', 'failed', 'refunded'
  raw_response jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.payment_transactions enable row level security;
drop policy if exists "Users can view their own payments" on public.payment_transactions;
create policy "Users can view their own payments" on public.payment_transactions for select using ( auth.uid() = user_id );

-- Create refunds table
create table if not exists public.refunds (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings not null,
  user_id uuid references auth.users not null,
  amount numeric not null,
  reason text,
  status text default 'pending', -- 'pending', 'processed', 'rejected'
  processed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.refunds enable row level security;
drop policy if exists "Users can manage their own refunds" on public.refunds;
create policy "Users can manage their own refunds" on public.refunds for all using ( auth.uid() = user_id );

-- Update bookings table with more statuses if needed
-- (Assuming 'pending', 'confirmed', 'rejected', 'completed', 'cancelled' already exist)
-- We can add 'pending_payment' and 'refunded' to the check constraint if we have one, 
-- but Supabase usually doesn't enforce text constraints unless specified.
