import { NextResponse } from 'next/server';
import { supabaseAdmin, requireAdmin, logAuditAction } from '@/app/lib/admin';

export async function GET(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  const { data, error: fetchError, count } = await supabaseAdmin
    .from('listings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  
  return NextResponse.json(
    { listings: data, metadata: { total: count, page, limit } },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
  );
}

export async function POST(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const listingData = await req.json();
    
    // Admin creates listing (can override provider_id, defaults to admin's id)
    const { data, error: insertError } = await supabaseAdmin
      .from('listings')
      .insert([{ ...listingData, provider_id: listingData.provider_id || user.id }])
      .select()
      .single();

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    await logAuditAction(user.id, 'CREATE_LISTING', 'listings', data.id, { title: data.title });

    return NextResponse.json({ success: true, listing: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const { id, ...updateData } = await req.json();

    if (!id) return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });

    const { error: updateError } = await supabaseAdmin
      .from('listings')
      .update(updateData)
      .eq('id', id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    await logAuditAction(user.id, 'UPDATE_LISTING', 'listings', id, updateData);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });

    const { error: deleteError } = await supabaseAdmin
      .from('listings')
      .delete()
      .eq('id', id);

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    await logAuditAction(user.id, 'DELETE_LISTING', 'listings', id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
