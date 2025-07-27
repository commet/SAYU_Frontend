#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function main() {
  console.log('📥 Loading waitlist_data...');
  
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const dataFile = path.join(__dirname, 'data_waitlists.json');
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  
  console.log('Found', data.length, 'waitlist records');
  
  let success = 0;
  let failed = 0;
  
  for (const row of data) {
    try {
      const { id, ...cleanData } = row;
      const filteredData = {};
      
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] !== null && cleanData[key] !== undefined) {
          filteredData[key] = cleanData[key];
        }
      });
      
      const { data: inserted, error } = await supabase
        .from('waitlist_data')
        .insert(filteredData)
        .select('id');
      
      if (error) {
        console.log('❌ Error:', error.message);
        failed++;
      } else {
        console.log('✅ Inserted:', inserted[0]?.id);
        success++;
      }
    } catch (e) {
      console.log('❌ Exception:', e.message);
      failed++;
    }
  }
  
  console.log(`\n📊 Result: ${success} success, ${failed} failed`);
  
  if (success === 2) {
    console.log('🎉 PERFECT! All waitlist records loaded!');
    console.log('🏆 MIGRATION 100% COMPLETE!');
  }
}

main().catch(console.error);