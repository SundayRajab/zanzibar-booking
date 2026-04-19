import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create a server-side Supabase client
// Falls back to anon key if service role isn't configured
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// GET: Fetch reviews for a listing
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listing_id");

  if (!listingId) {
    return NextResponse.json({ error: "listing_id is required" }, { status: 400 });
  }

  // First try the join, fall back to reviews-only if profiles table isn't accessible
  let { data, error } = await supabaseServer
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });

  // If the join fails (e.g. RLS on profiles), fetch reviews without profiles
  if (error) {
    const fallback = await supabaseServer
      .from("reviews")
      .select("*")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false });

    if (fallback.error) {
      return NextResponse.json({ error: fallback.error.message }, { status: 500 });
    }
    data = fallback.data;
  }

  return NextResponse.json(data || []);
}

// POST: Submit a review (requires a completed booking)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, listing_id, rating, comment } = body;

    if (!user_id || !listing_id || !rating) {
      return NextResponse.json({ error: "user_id, listing_id, and rating are required" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Check if user has a completed/confirmed booking for this listing
    const { data: eligibleBooking } = await supabaseServer
      .from("bookings")
      .select("id")
      .eq("user_id", user_id)
      .eq("listing_id", listing_id)
      .in("status", ["confirmed", "completed"])
      .eq("payment_status", "paid")
      .limit(1);

    if (!eligibleBooking || eligibleBooking.length === 0) {
      return NextResponse.json(
        { error: "You can only review properties you have booked and paid for." },
        { status: 403 }
      );
    }

    // Check for duplicate reviews
    const { data: existingReview } = await supabaseServer
      .from("reviews")
      .select("id")
      .eq("user_id", user_id)
      .eq("listing_id", listing_id)
      .limit(1);

    if (existingReview && existingReview.length > 0) {
      return NextResponse.json(
        { error: "You have already reviewed this listing." },
        { status: 409 }
      );
    }

    // Insert the review
    const { data: review, error: reviewError } = await supabaseServer
      .from("reviews")
      .insert([{ user_id, listing_id, rating, comment }])
      .select()
      .single();

    if (reviewError) {
      return NextResponse.json({ error: reviewError.message }, { status: 500 });
    }

    // Update the listing's average rating and review count
    const { data: allReviews } = await supabaseServer
      .from("reviews")
      .select("rating")
      .eq("listing_id", listing_id);

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length;
      await supabaseServer
        .from("listings")
        .update({
          average_rating: parseFloat(avg.toFixed(2)),
          reviews_count: allReviews.length,
        })
        .eq("id", listing_id);
    }

    return NextResponse.json({ success: true, review });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
