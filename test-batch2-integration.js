#!/usr/bin/env node

// Test script for Batch 2 exhibition integration
// Verifies data quality and integration success

const fs = require('fs');

class Batch2IntegrationTester {
  constructor() {
    this.batch1File = 'exhibitions-clean-batch1.json';
    this.batch2File = 'exhibitions-clean-batch2.json';
    this.results = {
      batch1: null,
      batch2: null,
      conflicts: [],
      specialCases: [],
      qualityIssues: []
    };
  }

  async runAllTests() {
    console.log('🧪 SAYU Exhibition Data Batch 2 Integration Tests');
    console.log('=' .repeat(60));

    // 1. Load data files
    this.loadDataFiles();

    // 2. Basic validation
    this.validateBasicStructure();

    // 3. Check for conflicts
    this.checkDataConflicts();

    // 4. Validate special cases
    this.validateSpecialCases();

    // 5. Quality checks
    this.runQualityChecks();

    // 6. Integration readiness
    this.checkIntegrationReadiness();

    // 7. Generate report
    this.generateReport();
  }

  loadDataFiles() {
    console.log('\n📂 Loading data files...');
    
    try {
      if (fs.existsSync(this.batch1File)) {
        this.results.batch1 = JSON.parse(fs.readFileSync(this.batch1File, 'utf8'));
        console.log(`✅ Batch 1: ${this.results.batch1.length} exhibitions loaded`);
      } else {
        console.log('⚠️  Batch 1 file not found');
      }

      if (fs.existsSync(this.batch2File)) {
        this.results.batch2 = JSON.parse(fs.readFileSync(this.batch2File, 'utf8'));
        const count = this.results.batch2.exhibitions ? this.results.batch2.exhibitions.length : this.results.batch2.length;
        console.log(`✅ Batch 2: ${count} exhibitions loaded`);
      } else {
        console.log('⚠️  Batch 2 file not found - run quick-exhibition-parser-batch2.js first');
      }
    } catch (error) {
      console.error('❌ Error loading files:', error.message);
    }
  }

  validateBasicStructure() {
    console.log('\n🔍 Validating basic structure...');

    if (!this.results.batch2) {
      console.log('⏭️  Skipping - Batch 2 data not available');
      return;
    }

    const batch2Data = this.results.batch2.exhibitions || this.results.batch2;
    const requiredFields = [
      'exhibition_title', 'venue_name', 'start_date', 'end_date', 
      'status', 'exhibition_type', 'genre', 'priority_order'
    ];

    let validCount = 0;
    batch2Data.forEach((exhibition, index) => {
      const missing = requiredFields.filter(field => !exhibition[field]);
      if (missing.length === 0) {
        validCount++;
      } else {
        this.results.qualityIssues.push({
          type: 'missing_fields',
          exhibition: exhibition.exhibition_title || `Exhibition ${index}`,
          missing: missing
        });
      }
    });

    console.log(`✅ Valid exhibitions: ${validCount}/${batch2Data.length}`);
    if (batch2Data.length - validCount > 0) {
      console.log(`⚠️  ${batch2Data.length - validCount} exhibitions with missing fields`);
    }
  }

  checkDataConflicts() {
    console.log('\n🔄 Checking for data conflicts...');

    if (!this.results.batch1 || !this.results.batch2) {
      console.log('⏭️  Skipping - Need both batches loaded');
      return;
    }

    const batch2Data = this.results.batch2.exhibitions || this.results.batch2;
    
    // Check priority order conflicts
    const batch1Priorities = this.results.batch1.map(ex => ex.priority_order);
    const batch2Priorities = batch2Data.map(ex => ex.priority_order);
    
    const priorityConflicts = batch2Priorities.filter(p => batch1Priorities.includes(p));
    if (priorityConflicts.length > 0) {
      this.results.conflicts.push({
        type: 'priority_conflict',
        values: priorityConflicts
      });
    }

    // Check title duplicates
    const batch1Titles = this.results.batch1.map(ex => ex.exhibition_title.toLowerCase());
    const batch2Titles = batch2Data.map(ex => ex.exhibition_title.toLowerCase());
    
    const titleDuplicates = batch2Titles.filter(title => batch1Titles.includes(title));
    if (titleDuplicates.length > 0) {
      this.results.conflicts.push({
        type: 'title_duplicate',
        values: titleDuplicates
      });
    }

    console.log(`✅ Priority conflicts: ${priorityConflicts.length}`);
    console.log(`✅ Title duplicates: ${titleDuplicates.length}`);
  }

  validateSpecialCases() {
    console.log('\n🏛️  Validating special cases...');

    if (!this.results.batch2) {
      console.log('⏭️  Skipping - Batch 2 data not available');
      return;
    }

    const batch2Data = this.results.batch2.exhibitions || this.results.batch2;

    // Find multi-venue exhibitions
    const multiVenueCount = batch2Data.filter(ex => ex.is_multi_venue || ex.venue_original_name?.includes('외')).length;
    
    // Find unknown venues
    const unknownVenueCount = batch2Data.filter(ex => ex.is_unknown_venue || ex.venue_name?.includes('미정') || ex.venue_name?.includes('N/A')).length;

    // Find major museums
    const majorMuseums = batch2Data.filter(ex => 
      ex.venue_name?.includes('호암미술관') || 
      ex.venue_name?.includes('부산현대미술관') || 
      ex.venue_name?.includes('서울시립미술관')
    );

    this.results.specialCases = {
      multiVenue: multiVenueCount,
      unknownVenue: unknownVenueCount,
      majorMuseums: majorMuseums.length
    };

    console.log(`✅ Multi-venue exhibitions: ${multiVenueCount}`);
    console.log(`✅ Unknown venue exhibitions: ${unknownVenueCount}`);
    console.log(`✅ Major museum exhibitions: ${majorMuseums.length}`);
  }

  runQualityChecks() {
    console.log('\n🎯 Running quality checks...');

    if (!this.results.batch2) {
      console.log('⏭️  Skipping - Batch 2 data not available');
      return;
    }

    const batch2Data = this.results.batch2.exhibitions || this.results.batch2;

    // Date validation
    const dateIssues = batch2Data.filter(ex => {
      const start = new Date(ex.start_date);
      const end = new Date(ex.end_date);
      return start > end || isNaN(start.getTime()) || isNaN(end.getTime());
    });

    // Priority order validation (should be 40+)
    const priorityIssues = batch2Data.filter(ex => ex.priority_order < 40);

    // Exhibition numbering (should be 145-165)
    const numberingIssues = batch2Data.filter((ex, index) => {
      const expectedNumber = 145 + index;
      return ex.exhibition_number && ex.exhibition_number !== expectedNumber;
    });

    console.log(`✅ Date issues: ${dateIssues.length}`);
    console.log(`✅ Priority issues: ${priorityIssues.length}`);
    console.log(`✅ Numbering issues: ${numberingIssues.length}`);

    if (dateIssues.length > 0) {
      this.results.qualityIssues.push({ type: 'date_issues', count: dateIssues.length });
    }
    if (priorityIssues.length > 0) {
      this.results.qualityIssues.push({ type: 'priority_issues', count: priorityIssues.length });
    }
    if (numberingIssues.length > 0) {
      this.results.qualityIssues.push({ type: 'numbering_issues', count: numberingIssues.length });
    }
  }

  checkIntegrationReadiness() {
    console.log('\n🚀 Checking integration readiness...');

    const hasConflicts = this.results.conflicts.length > 0;
    const hasQualityIssues = this.results.qualityIssues.length > 0;
    const hasBatch2Data = !!this.results.batch2;

    if (hasBatch2Data && !hasConflicts && !hasQualityIssues) {
      console.log('✅ READY FOR INTEGRATION');
      console.log('   All checks passed. Safe to execute SQL.');
    } else if (!hasBatch2Data) {
      console.log('⏳ WAITING FOR DATA');
      console.log('   Run quick-exhibition-parser-batch2.js first.');
    } else if (hasConflicts) {
      console.log('⚠️  CONFLICTS DETECTED');
      console.log('   Resolve conflicts before integration.');
    } else if (hasQualityIssues) {
      console.log('⚠️  QUALITY ISSUES');
      console.log('   Fix quality issues or proceed with caution.');
    }
  }

  generateReport() {
    console.log('\n📊 Integration Report');
    console.log('=' .repeat(60));

    if (this.results.batch1) {
      console.log(`📥 Batch 1: ${this.results.batch1.length} exhibitions`);
    }
    
    if (this.results.batch2) {
      const count = this.results.batch2.exhibitions ? this.results.batch2.exhibitions.length : this.results.batch2.length;
      console.log(`📥 Batch 2: ${count} exhibitions`);
      console.log(`📊 Total after integration: ${(this.results.batch1?.length || 0) + count}`);
    }

    if (this.results.specialCases) {
      console.log(`🏛️  Special Cases:`);
      console.log(`   Multi-venue: ${this.results.specialCases.multiVenue}`);
      console.log(`   Unknown venue: ${this.results.specialCases.unknownVenue}`);
      console.log(`   Major museums: ${this.results.specialCases.majorMuseums}`);
    }

    if (this.results.conflicts.length > 0) {
      console.log(`⚠️  Conflicts: ${this.results.conflicts.length}`);
      this.results.conflicts.forEach(conflict => {
        console.log(`   ${conflict.type}: ${conflict.values?.length || 1} issues`);
      });
    }

    if (this.results.qualityIssues.length > 0) {
      console.log(`🔧 Quality Issues: ${this.results.qualityIssues.length}`);
      this.results.qualityIssues.forEach(issue => {
        console.log(`   ${issue.type}: ${issue.count || 1}`);
      });
    }

    console.log('\n📝 Next Steps:');
    if (!this.results.batch2) {
      console.log('1. Provide 21 exhibitions to quick-exhibition-parser-batch2.js');
      console.log('2. Run parser: node quick-exhibition-parser-batch2.js');
      console.log('3. Re-run this test: node test-batch2-integration.js');
      console.log('4. Execute SQL: exhibitions-clean-batch2.sql');
    } else if (this.results.conflicts.length === 0 && this.results.qualityIssues.length === 0) {
      console.log('1. ✅ Execute SQL in Supabase: exhibitions-clean-batch2.sql');
      console.log('2. ✅ Verify integration in database');
      console.log('3. ✅ Update application to use new data');
    } else {
      console.log('1. ⚠️  Address conflicts and quality issues');
      console.log('2. 🔄 Re-run parser if needed');
      console.log('3. 🔄 Re-run this test');
      console.log('4. ✅ Execute SQL when clean');
    }
  }
}

// Run tests
const tester = new Batch2IntegrationTester();
tester.runAllTests().catch(console.error);