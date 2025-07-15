#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function saveExhibitionsToSupabase() {
  try {
    console.log('🎨 Loading collected exhibitions...');
    
    // 가장 최근 수집된 전시 파일 찾기
    const files = await fs.readdir('.');
    const exhibitionFiles = files.filter(file => 
      file.startsWith('exhibitions-') && file.endsWith('.json')
    );
    
    if (exhibitionFiles.length === 0) {
      console.error('❌ No exhibition files found. Run test-exhibition-collection-v2.js first.');
      return;
    }
    
    // 가장 최근 파일 선택
    const latestFile = exhibitionFiles.sort().pop();
    console.log(`📁 Using file: ${latestFile}`);
    
    // 전시 데이터 로드
    const exhibitionData = await fs.readFile(latestFile, 'utf8');
    const exhibitions = JSON.parse(exhibitionData);
    
    console.log(`📊 Found ${exhibitions.length} exhibitions to process`);
    
    // 각 전시에 대해 venue_id 매핑하고 저장
    const savedExhibitions = [];
    const errors = [];
    
    for (const exhibition of exhibitions) {
      try {
        // 1. Venue ID 찾기
        const { data: venue, error: venueError } = await supabase
          .from('venues')
          .select('id')
          .eq('name', exhibition.venueName)
          .single();
        
        if (venueError || !venue) {
          console.warn(`⚠️  Venue not found: ${exhibition.venueName}`);
          errors.push(`Venue not found: ${exhibition.venueName}`);
          continue;
        }
        
        // 2. 전시 데이터 준비
        const exhibitionRecord = {
          venue_id: venue.id,
          title: exhibition.title,
          venue_name: exhibition.venueName,
          venue_city: exhibition.venueCity,
          venue_country: exhibition.venueCountry || 'KR',
          start_date: exhibition.startDate ? new Date(exhibition.startDate).toISOString().split('T')[0] : null,
          end_date: exhibition.endDate ? new Date(exhibition.endDate).toISOString().split('T')[0] : null,
          description: exhibition.description || null,
          artists: exhibition.artists || [],
          admission_fee: exhibition.admissionFee || 0,
          source: exhibition.source || 'naver_blog',
          source_url: exhibition.sourceUrl || null,
          verification_status: 'verified', // 자동 검증됨으로 설정
          status: determineStatus(exhibition.startDate, exhibition.endDate),
          type: 'group' // 기본값
        };
        
        // 3. 중복 체크 및 저장
        const { data: existing, error: checkError } = await supabase
          .from('exhibitions')
          .select('id')
          .eq('title', exhibition.title)
          .eq('venue_id', venue.id)
          .eq('start_date', exhibitionRecord.start_date)
          .maybeSingle();
        
        if (checkError) {
          console.error(`❌ Error checking duplicate: ${checkError.message}`);
          errors.push(`Check error: ${exhibition.title}`);
          continue;
        }
        
        if (existing) {
          console.log(`⏭️  Skipping duplicate: ${exhibition.title}`);
          continue;
        }
        
        // 4. 전시 저장
        const { data: savedExhibition, error: saveError } = await supabase
          .from('exhibitions')
          .insert(exhibitionRecord)
          .select()
          .single();
        
        if (saveError) {
          console.error(`❌ Error saving exhibition: ${saveError.message}`);
          errors.push(`Save error: ${exhibition.title} - ${saveError.message}`);
          continue;
        }
        
        savedExhibitions.push(savedExhibition);
        console.log(`✅ Saved: ${exhibition.title} (${exhibition.venueName})`);
        
      } catch (error) {
        console.error(`❌ Error processing exhibition: ${error.message}`);
        errors.push(`Processing error: ${exhibition.title} - ${error.message}`);
      }
    }
    
    // 결과 요약
    console.log('\n📊 Save Summary:');
    console.log(`✅ Successfully saved: ${savedExhibitions.length}`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Error Details:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // 저장된 전시 확인
    if (savedExhibitions.length > 0) {
      console.log('\n🎨 Saved Exhibitions:');
      savedExhibitions.forEach(ex => {
        console.log(`  📍 ${ex.title} at ${ex.venue_name}`);
        console.log(`     📅 ${ex.start_date} ~ ${ex.end_date}`);
        console.log(`     🎯 Status: ${ex.status}`);
      });
    }
    
    // 전체 전시 통계
    const { data: allExhibitions, count, error: statsError } = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact' });
    
    if (!statsError) {
      console.log(`\n🎯 Total exhibitions in database: ${count}`);
      
      // 상태별 통계
      const statusStats = allExhibitions.reduce((acc, ex) => {
        acc[ex.status] = (acc[ex.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Status breakdown:');
      Object.entries(statusStats).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to save exhibitions:', error);
  }
}

// 전시 상태 결정 함수
function determineStatus(startDate, endDate) {
  if (!startDate || !endDate) return 'draft';
  
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'ongoing';
}

// 실행
saveExhibitionsToSupabase();