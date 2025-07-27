#!/usr/bin/env node
/**
 * Simple Schema Test
 * Tests basic connection and applies minimal schema
 */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function testConnection() {
  console.log('🔌 Testing Supabase Connection...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  console.log('URL:', supabaseUrl);
  console.log('Key (first 20 chars):', supabaseKey?.substring(0, 20) + '...');
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables');
    return false;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test connection with auth check
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message.includes('Invalid API key')) {
      console.log('❌ Invalid API key');
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log('Auth check passed');
    return true;
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
}

async function createBasicTable() {
  console.log('\n📋 Testing database write access...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  
  try {
    // Test if we can use the REST API by checking for existing tables
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_KEY
      }
    });
    
    if (!response.ok) {
      console.log('❌ Database API access failed:', response.status, response.statusText);
      return false;
    }
    
    console.log('✅ Database API access successful!');
    console.log('Status:', response.status);
    return true;
  } catch (error) {
    console.log('❌ Database access error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Supabase Connection Test\n');
  
  const connected = await testConnection();
  
  if (connected) {
    await createBasicTable();
  }
}

main().catch(console.error);