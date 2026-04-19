-- 🏝️ Oceanora Luxury Seed Data
-- Run this in your Supabase SQL Editor after running schema.sql

-- Insert Sample Listings
INSERT INTO public.listings (title, description, category, price, location, images, details)
VALUES 
(
  'Zanzibar Beachfront Villa', 
  'Experience ultimate luxury in this 5-bedroom villa with a private infinity pool and direct beach access.', 
  'apartment', 
  450.00, 
  'Nungwi, Zanzibar', 
  ARRAY['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=2000'],
  '{"wifi": true, "pool": true, "beachfront": true, "bedrooms": 5, "bathrooms": 4}'
),
(
  'The Rock Palace Hotel', 
  'A boutique hotel perched on a coral outcrop, offering 360-degree views of the Indian Ocean.', 
  'hotel', 
  299.00, 
  'Michamvi, Zanzibar', 
  ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2000'],
  '{"spa": true, "restaurant": true, "ac": true, "stars": 5}'
),
(
  'Blue Safari Adventure', 
  'A full-day guided boat tour including snorkeling, dolphin watching, and a seafood feast on a sandbank.', 
  'tour', 
  120.00, 
  'Fumba, Zanzibar', 
  ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=2000'],
  '{"duration": "8 hours", "includes_lunch": true, "equipment": true}'
),
(
  'Luxury Land Rover Defender', 
  'Explore the island in style with our premium 4x4 rental. Perfect for rough terrain and beach drives.', 
  'car', 
  85.00, 
  'Stone Town, Zanzibar', 
  ARRAY['https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&q=80&w=2000'],
  '{"transmission": "automatic", "seats": 5, "fuel": "diesel", "4x4": true}'
),
(
  'Stone Town Heritage Loft', 
  'A beautifully restored 18th-century loft in the heart of historical Stone Town.', 
  'apartment', 
  150.00, 
  'Stone Town, Zanzibar', 
  ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000'],
  '{"wifi": true, "balcony": true, "city_view": true, "bedrooms": 2}'
);

-- Note: We don't insert bookings or reviews yet to keep the state clean.
