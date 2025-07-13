const { createClient } = require('@supabase/supabase-js');
const { log } = require('./logger');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client instances
let supabaseClient = null;
let supabaseAdmin = null;

/**
 * Initialize Supabase client for public access
 */
function getSupabaseClient() {
  if (!supabaseClient && supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-application-name': 'sayu-backend'
        }
      }
    });
    
    log.info('Supabase client initialized', {
      url: supabaseUrl,
      hasAnonKey: !!supabaseAnonKey
    });
  }
  
  return supabaseClient;
}

/**
 * Initialize Supabase admin client for server-side operations
 */
function getSupabaseAdmin() {
  if (!supabaseAdmin && supabaseUrl && supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-application-name': 'sayu-backend-admin'
        }
      }
    });
    
    log.info('Supabase admin client initialized');
  }
  
  return supabaseAdmin;
}

/**
 * Test Supabase connection
 */
async function testSupabaseConnection() {
  try {
    const client = getSupabaseClient();
    if (!client) {
      log.warn('Supabase not configured - missing environment variables');
      return false;
    }
    
    // Test query
    const { error } = await client.from('users').select('id').limit(1);
    
    if (error) {
      log.error('Supabase connection test failed', error);
      return false;
    }
    
    log.info('Supabase connection test successful');
    return true;
  } catch (error) {
    log.error('Supabase connection test error', error);
    return false;
  }
}

/**
 * Check if Supabase is configured
 */
function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Check if Supabase admin is configured
 */
function isSupabaseAdminConfigured() {
  return !!(supabaseUrl && supabaseServiceKey);
}

/**
 * Get Supabase auth instance
 */
function getSupabaseAuth() {
  const client = getSupabaseClient();
  return client ? client.auth : null;
}

/**
 * Get Supabase storage instance
 */
function getSupabaseStorage() {
  const client = getSupabaseClient();
  return client ? client.storage : null;
}

/**
 * Get Supabase realtime instance
 */
function getSupabaseRealtime() {
  const client = getSupabaseClient();
  return client ? client.realtime : null;
}

module.exports = {
  getSupabaseClient,
  getSupabaseAdmin,
  testSupabaseConnection,
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
  getSupabaseAuth,
  getSupabaseStorage,
  getSupabaseRealtime
};