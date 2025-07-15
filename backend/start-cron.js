#!/usr/bin/env node

const { startCronJobs } = require('./cron-exhibition-collection');

console.log('🚀 Starting SAYU Exhibition Collection Cron Service...');
console.log('📅 Scheduled jobs:');
console.log('  - Daily Tier 1 collection: 9:00 AM');
console.log('  - Weekly Tier 2 collection: Monday 10:00 AM');
console.log('  - Monthly Tier 3 collection: 1st day 11:00 AM');

// 크론 작업 시작
startCronJobs();

// 프로세스 종료 처리
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down cron service...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down cron service...');
  process.exit(0);
});

// 프로세스 유지
process.stdin.resume();