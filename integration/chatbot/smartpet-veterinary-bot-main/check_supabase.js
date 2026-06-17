require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { realtime: { transport: ws } }
);

async function check() {
  const { data, error } = await supabase.from('pet_profiles').select('id, metadata, content');
  console.log(error ? error : JSON.stringify(data, null, 2));
}
check();
