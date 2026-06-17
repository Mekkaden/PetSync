require('dotenv').config({ path: 'integration/chatbot/smartpet-veterinary-bot-main/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function check() {
  const { data, error } = await supabase.from('pet_profiles').select('*');
  console.log(error ? error : data);
}
check();
