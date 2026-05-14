import { NextResponse } from 'next/server';
import { supabaseAdmin, requireAdmin, logAuditAction } from '@/app/lib/admin';

export async function GET(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  // Optimized query with server-side pagination
  const { data: profiles, error: profError, count } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (profError) return NextResponse.json({ error: profError.message }, { status: 500 });

  return NextResponse.json(
    { users: profiles, metadata: { total: count, page, limit } },
    {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300' // Edge caching for production
      }
    }
  );
}

export async function POST(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const body = await req.json();
    const { email, password, full_name, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for admin creations
      user_metadata: { full_name }
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Failed to create auth user' }, { status: 500 });
    }

    const newUserId = authData.user.id;

    // 2. Update the profile role (the trigger usually creates the profile row automatically, but we can update it)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: role || 'user', full_name })
      .eq('id', newUserId);

    if (profileError) {
      return NextResponse.json({ error: 'User created but profile update failed' }, { status: 500 });
    }

    await logAuditAction(user.id, 'CREATE_USER', 'users', newUserId, { email, role });

    return NextResponse.json({ success: true, user: authData.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const { targetUserId, action, role, status } = await req.json();

    if (!targetUserId || !action) {
      return NextResponse.json({ error: 'Target user ID and action are required' }, { status: 400 });
    }

    let updateData = {};
    if (action === 'update_role' && role) {
      updateData = { role };
    } else if (action === 'update_status' && status) {
      updateData = { status }; // 'active' or 'suspended'
    } else {
      return NextResponse.json({ error: 'Invalid action or missing payload' }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', targetUserId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await logAuditAction(user.id, `UPDATE_USER_${action.toUpperCase()}`, 'users', targetUserId, updateData);

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
    const targetUserId = searchParams.get('id');

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Delete auth user (this will cascade delete the profile if foreign keys are setup correctly)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    await logAuditAction(user.id, 'DELETE_USER', 'users', targetUserId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
