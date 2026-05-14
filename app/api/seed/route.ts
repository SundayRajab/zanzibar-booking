import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Service Role Key to completely bypass RLS policies for seeding
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET() {
  try {
    // Delete existing records
    const { error: deleteError } = await supabaseAdmin
      .from('listings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes everything

    if (deleteError) {
      console.log('Could not clear table (might be RLS restricted):', deleteError.message);
    }

    // Insert new sample data
    const sampleData = [
      {
        title: "Luxury Beachfront Resort",
        category: "hotels",
        location: "Nungwi Beach",
        price: 250,
        description: "Experience the ultimate getaway at our premium luxury resort located right on the pristine white sands of Nungwi Beach. Enjoy breathtaking ocean views, a world-class spa, and infinity pools.",
        images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"],
        details: { room_types: "Standard, Deluxe, Suite", max_guests: "4" }
      },
      {
        title: "Cozy Stone Town Apartment",
        category: "apartments",
        location: "Stone Town",
        price: 85,
        description: "Stay in the heart of historic Stone Town in this beautifully restored, air-conditioned apartment. Walking distance to the night market, museums, and local cafes.",
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
        details: { room_types: "1 Bedroom, 2 Bedroom", max_guests: "3" }
      },
      {
        title: "Toyota Land Cruiser Prado",
        category: "cars",
        location: "Zanzibar Airport",
        price: 60,
        description: "Explore the island at your own pace with a reliable 4x4. Perfect for navigating both the smooth highways and the sandy coastal roads of Zanzibar.",
        images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"],
        details: { transmission: "Automatic", seats: "5" }
      },
      {
        title: "Safari Blue Full Day Tour",
        category: "tours",
        location: "Fumba Village",
        price: 45,
        description: "Join us for an unforgettable full-day boat tour. Snorkel in crystal clear waters, visit the famous sandbank, and enjoy a massive seafood barbecue lunch.",
        images: ["https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&w=800&q=80"],
        details: { duration: "Full Day", pickup: "Yes" }
      }
    ];

    const { data, error } = await supabaseAdmin.from('listings').insert(sampleData).select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, message: 'Sample data successfully inserted!', insertedCount: data?.length, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
