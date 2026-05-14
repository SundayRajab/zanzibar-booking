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
    .from('bookings')
    .select('*, listings(id, title, category)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  
  return NextResponse.json(
    { bookings: data, metadata: { total: count, page, limit } },
    { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=120' } }
  );
}

export async function PATCH(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const { id, status, payment_status } = await req.json();

    if (!id) return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });

    let updateData: any = {};
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    await logAuditAction(user.id, 'UPDATE_BOOKING', 'bookings', id, updateData);

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

    if (!id) return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });

    const { error: deleteError } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', id);

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    await logAuditAction(user.id, 'DELETE_BOOKING', 'bookings', id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
