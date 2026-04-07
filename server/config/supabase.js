const { createClient } = require('@supabase/supabase-js');

// Use the service role key so this server bypasses Row Level Security
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

module.exports = supabase;
