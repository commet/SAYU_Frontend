const { createClient } = require('@supabase/supabase-js');
const { log } = require('./logger');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  log.error('Supabase configuration missing. Please check environment variables.');
  throw new Error('Supabase configuration missing');
}

// Public client (for browser-safe operations)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Admin client (for server-side operations with full access)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Health check function
async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      log.error('Supabase health check failed:', error);
      return false;
    }

    log.info('Supabase connection successful');
    return true;
  } catch (error) {
    log.error('Supabase connection error:', error);
    return false;
  }
}

// Initialize connection check
checkSupabaseConnection();

module.exports = {
  supabase,
  supabaseAdmin,
  checkSupabaseConnection
};
