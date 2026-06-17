require('dotenv').config();
const { retrievePetContext } = require('./services/supabaseService');

async function test() {
  const result = await retrievePetContext('hi', '6a2fc779aedfe57331ad3751');
  console.log("RESULT:", result);
}
test();
