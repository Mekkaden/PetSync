require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ws = require('ws');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { realtime: { transport: ws } });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  const model = genAI.getGenerativeModel({ model: 'models/gemini-embedding-001' });
  const result = await model.embedContent('hi');
  const embedding = result.embedding.values;

  const rpcResponse = await supabase.rpc('match_pet_profiles', {
    match_count: 10,
    query_embedding: embedding
  });
  console.log(rpcResponse.data);
}
test();
