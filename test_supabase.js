import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptzvgibyktkujwslpdsb.supabase.co';
const supabaseAnonKey = 'sb_publishable_X3xSIJFPNug6IApqftV3CA_b5GhaYRL';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('listings').select('*').limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
