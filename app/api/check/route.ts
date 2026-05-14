import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET() {
  const { data, error } = await supabase.from('listings').select('*');
  return NextResponse.json({ data, error });
}
