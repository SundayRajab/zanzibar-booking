import { createClient } from '@supabase/supabase-js';

// Server-side ONLY: Admin client using the Service Role Key
// WARNING: NEVER expose this to the client-side.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Validates the Authorization header JWT token and ensures the user is an admin.
 * @param request The incoming NextRequest
 * @returns { user, error }
 */
export async function requireAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid Authorization header' };
  }

  const token = authHeader.split(' ')[1];

  // Verify token and get user
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !user) {
    return { user: null, error: 'Unauthorized: Invalid token' };
  }

  // Check RBAC (Role-Based Access Control)
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { user: null, error: 'Profile not found' };
  }

  if (profile.status === 'suspended') {
    return { user: null, error: 'Account suspended' };
  }

  if (profile.role !== 'admin') {
    return { user: null, error: 'Forbidden: Requires admin privileges' };
  }

  return { user, error: null };
}

/**
 * Creates an audit log entry for administrative actions
 */
export async function logAuditAction(userId: string, action: string, entity: string, entityId?: string, details?: Record<string, any>) {
  await supabaseAdmin.from('audit_logs').insert([{
    user_id: userId,
    action,
    entity,
    entity_id: entityId,
    details,
  }]);
}
