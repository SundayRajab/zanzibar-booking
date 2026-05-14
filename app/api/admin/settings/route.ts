import { NextResponse } from 'next/server';
import { supabaseAdmin, requireAdmin, logAuditAction } from '@/app/lib/admin';

export async function GET(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { data, error: fetchError } = await supabaseAdmin
    .from('system_settings')
    .select('*');

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

  // Convert array to object mapping
  const settingsObj = data.reduce((acc: any, item: any) => {
    acc[item.setting_key] = item.setting_value;
    return acc;
  }, {});

  return NextResponse.json({ settings: settingsObj });
}

export async function POST(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const { setting_key, setting_value, description } = await req.json();

    if (!setting_key) {
      return NextResponse.json({ error: 'setting_key is required' }, { status: 400 });
    }

    const { error: upsertError } = await supabaseAdmin
      .from('system_settings')
      .upsert(
        { setting_key, setting_value, description },
        { onConflict: 'setting_key' }
      );

    if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 });

    await logAuditAction(user.id, 'UPDATE_SETTING', 'system_settings', setting_key, { setting_value });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Optional bulk update
export async function PATCH(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    const settings = await req.json(); // Expected format: { key1: value1, key2: value2 }

    for (const [setting_key, setting_value] of Object.entries(settings)) {
      await supabaseAdmin
        .from('system_settings')
        .upsert(
          { setting_key, setting_value: String(setting_value) },
          { onConflict: 'setting_key' }
        );
    }

    await logAuditAction(user.id, 'BULK_UPDATE_SETTINGS', 'system_settings', undefined, settings);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
