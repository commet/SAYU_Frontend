const fs = require('fs').promises;
const path = require('path');

class CollectionMonitor {
  constructor() {
    this.logDir = path.join(__dirname, 'collection_logs');
    this.resultsDir = path.join(__dirname, 'collection_results');
    this.refreshInterval = 5000; // 5초마다 갱신
    this.isRunning = false;
  }

  // 실시간 모니터링 시작
  async startMonitoring() {
    console.clear();
    this.isRunning = true;
    
    console.log('🖥️  ARTMAP COLLECTION MONITOR');
    console.log('============================');
    console.log('Monitoring collection progress in real-time...');
    console.log('Press Ctrl+C to stop monitoring\n');
    
    // 초기 상태 표시
    await this.displayStatus();
    
    // 주기적 갱신
    const interval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }
      
      console.clear();
      console.log('🖥️  ARTMAP COLLECTION MONITOR');
      console.log('============================');
      console.log(`Last updated: ${new Date().toLocaleTimeString()}\n`);
      
      await this.displayStatus();
    }, this.refreshInterval);
  }

  // 현재 상태 표시
  async displayStatus() {
    try {
      // 1. 진행 중인 수집 프로세스 확인
      const processInfo = this.checkRunningProcess();
      
      // 2. 최신 로그 파일 확인
      const latestLog = await this.getLatestLogFile();
      
      // 3. 최신 결과 파일 확인
      const latestResults = await this.getLatestResults();
      
      // 4. 실시간 통계 표시
      await this.displayRealTimeStats(latestLog, latestResults);
      
      // 5. 최근 로그 엔트리 표시
      await this.displayRecentLogs(latestLog);
      
    } catch (error) {
      console.log('❌ Error monitoring collection:', error.message);
    }
  }

  // 실행 중인 프로세스 확인
  checkRunningProcess() {
    // Node.js 프로세스 목록에서 수집 스크립트 찾기
    const { execSync } = require('child_process');
    
    try {
      const processes = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', { encoding: 'utf8' });
      const nodeProcesses = processes.split('\n').filter(line => 
        line.includes('massive-collection') || 
        line.includes('run-massive-collection')
      );
      
      return {
        isRunning: nodeProcesses.length > 0,
        count: nodeProcesses.length
      };
    } catch (error) {
      return { isRunning: false, count: 0 };
    }
  }

  // 최신 로그 파일 찾기
  async getLatestLogFile() {
    try {
      const files = await fs.readdir(this.logDir);
      const logFiles = files
        .filter(file => file.includes('massive_collection') && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.logDir, file),
          time: fs.stat(path.join(this.logDir, file)).then(stat => stat.mtime)
        }));
      
      if (logFiles.length === 0) return null;
      
      // 가장 최근 파일 찾기
      const sortedFiles = await Promise.all(
        logFiles.map(async file => ({ ...file, time: await file.time }))
      );
      
      sortedFiles.sort((a, b) => b.time - a.time);
      return sortedFiles[0];
      
    } catch (error) {
      return null;
    }
  }

  // 최신 결과 파일 찾기
  async getLatestResults() {
    try {
      const files = await fs.readdir(this.resultsDir);
      const resultFiles = files
        .filter(file => file.includes('massive_collection') && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(this.resultsDir, file)
        }));
      
      if (resultFiles.length === 0) return null;
      
      // 가장 최근 파일 찾기 (파일명의 타임스탬프 기준)
      resultFiles.sort((a, b) => b.name.localeCompare(a.name));
      
      const latestFile = resultFiles[0];
      const content = await fs.readFile(latestFile.path, 'utf8');
      return JSON.parse(content);
      
    } catch (error) {
      return null;
    }
  }

  // 실시간 통계 표시
  async displayRealTimeStats(latestLog, latestResults) {
    console.log('📊 COLLECTION STATUS');
    console.log('===================');
    
    // 프로세스 상태
    const processInfo = this.checkRunningProcess();
    const status = processInfo.isRunning ? '🟢 RUNNING' : '🔴 STOPPED';
    console.log(`Status: ${status}`);
    
    if (latestResults) {
      const stats = latestResults.summary || latestResults;
      
      console.log(`Cities processed: ${stats.totalCitiesProcessed || Object.keys(latestResults.cityResults || {}).length}`);
      console.log(`Exhibitions collected: ${stats.totalExhibitionsSaved || latestResults.totalExhibitions || 0}`);
      console.log(`Venues processed: ${stats.totalVenuesProcessed || latestResults.totalVenues || 0}`);
      
      if (stats.duration) {
        const hours = Math.floor(stats.duration / 3600);
        const minutes = Math.floor((stats.duration % 3600) / 60);
        console.log(`Duration: ${hours}h ${minutes}m`);
      }
      
      if (stats.successRate) {
        console.log(`Success rate: ${stats.successRate}%`);
      }
    }
    
    // 시스템 리소스
    const memUsage = process.memoryUsage();
    const memMB = (memUsage.rss / 1024 / 1024).toFixed(1);
    console.log(`Memory usage: ${memMB}MB`);
    
    console.log(''); // 빈 줄
  }

  // 최근 로그 엔트리 표시
  async displayRecentLogs(latestLog) {
    if (!latestLog) {
      console.log('📋 RECENT ACTIVITY');
      console.log('=================');
      console.log('No log files found');
      return;
    }
    
    try {
      const logContent = await fs.readFile(latestLog.path, 'utf8');
      const lines = logContent.split('\n').filter(line => line.trim());
      
      console.log('📋 RECENT ACTIVITY');
      console.log('=================');
      
      // 최근 10개 로그 라인 표시
      const recentLines = lines.slice(-10);
      recentLines.forEach(line => {
        if (line.includes('ERROR')) {
          console.log(`❌ ${line}`);
        } else if (line.includes('completed')) {
          console.log(`✅ ${line}`);
        } else if (line.includes('Processing')) {
          console.log(`🔄 ${line}`);
        } else {
          console.log(`ℹ️  ${line}`);
        }
      });
      
    } catch (error) {
      console.log('Could not read log file');
    }
  }

  // 도시별 진행 상황 표시
  async displayCityProgress(results) {
    if (!results || !results.cityResults) return;
    
    console.log('\n🏙️  CITY PROGRESS');
    console.log('================');
    
    const cities = Object.entries(results.cityResults);
    const completed = cities.filter(([_, data]) => data.exhibitionsSaved > 0);
    const failed = cities.filter(([_, data]) => data.errors && data.errors.length > 0);
    
    console.log(`Completed: ${completed.length}/${cities.length} cities`);
    
    if (completed.length > 0) {
      console.log('\nTop performing cities:');
      const topCities = completed
        .sort(([,a], [,b]) => b.exhibitionsSaved - a.exhibitionsSaved)
        .slice(0, 5);
      
      topCities.forEach(([city, data], index) => {
        console.log(`${index + 1}. ${city}: ${data.exhibitionsSaved} exhibitions`);
      });
    }
    
    if (failed.length > 0) {
      console.log(`\n⚠️  ${failed.length} cities with errors`);
    }
  }

  // 예상 완료 시간 계산
  calculateETA(results) {
    if (!results || !results.cityResults) return null;
    
    const completed = Object.values(results.cityResults).filter(data => data.duration);
    if (completed.length === 0) return null;
    
    const avgDuration = completed.reduce((sum, data) => sum + data.duration, 0) / completed.length;
    const totalCities = 40; // 예상 총 도시 수
    const remainingCities = totalCities - completed.length;
    const etaSeconds = remainingCities * avgDuration;
    
    const hours = Math.floor(etaSeconds / 3600);
    const minutes = Math.floor((etaSeconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  }

  // 모니터링 중지
  stop() {
    this.isRunning = false;
    console.log('\n🛑 Monitoring stopped');
  }
}

// 수집 상태 요약 생성
class CollectionSummary {
  static async generateSummary() {
    const monitor = new CollectionMonitor();
    
    console.log('📋 COLLECTION SUMMARY REPORT');
    console.log('============================');
    
    try {
      const latestResults = await monitor.getLatestResults();
      
      if (!latestResults) {
        console.log('No collection results found');
        return;
      }
      
      const summary = latestResults.summary || latestResults;
      
      console.log(`Report generated: ${new Date().toLocaleString()}`);
      console.log(`Collection period: ${latestResults.startTime} - ${latestResults.endTime || 'In Progress'}`);
      console.log('');
      
      console.log('📊 OVERALL STATISTICS');
      console.log('====================');
      console.log(`Cities processed: ${summary.totalCitiesProcessed || 0}`);
      console.log(`Exhibitions found: ${summary.totalExhibitionsFound || 0}`);
      console.log(`Exhibitions saved: ${summary.totalExhibitionsSaved || 0}`);
      console.log(`Venues processed: ${summary.totalVenuesProcessed || 0}`);
      console.log(`Venues with GPS: ${summary.totalVenuesWithCoordinates || 0}`);
      console.log(`Success rate: ${summary.successRate || 0}%`);
      
      if (summary.duration) {
        const hours = Math.floor(summary.duration / 3600);
        const minutes = Math.floor((summary.duration % 3600) / 60);
        console.log(`Duration: ${hours}h ${minutes}m`);
      }
      
      // 도시별 상세 정보
      if (latestResults.cityResults) {
        console.log('\n🏙️  CITY BREAKDOWN');
        console.log('==================');
        
        const cities = Object.entries(latestResults.cityResults)
          .sort(([,a], [,b]) => (b.exhibitionsSaved || 0) - (a.exhibitionsSaved || 0));
        
        cities.forEach(([city, data], index) => {
          const status = data.exhibitionsSaved > 0 ? '✅' : '❌';
          console.log(`${status} ${city}: ${data.exhibitionsSaved || 0} exhibitions, ${data.venuesProcessed || 0} venues`);
        });
      }
      
      // 오류 요약
      if (latestResults.errors && latestResults.errors.length > 0) {
        console.log('\n❌ ERRORS ENCOUNTERED');
        console.log('=====================');
        console.log(`Total errors: ${latestResults.errors.length}`);
        
        // 오류 유형별 분류
        const errorTypes = {};
        latestResults.errors.forEach(error => {
          const type = error.type || 'general';
          errorTypes[type] = (errorTypes[type] || 0) + 1;
        });
        
        Object.entries(errorTypes).forEach(([type, count]) => {
          console.log(`${type}: ${count} errors`);
        });
      }
      
    } catch (error) {
      console.log('❌ Error generating summary:', error.message);
    }
  }
}

// CLI 실행
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('🖥️  COLLECTION MONITOR');
    console.log('=====================');
    console.log('Usage: node collection-monitor.js [options]');
    console.log('\nOptions:');
    console.log('  --monitor     Start real-time monitoring (default)');
    console.log('  --summary     Generate collection summary report');
    console.log('  --help        Show this help');
    return;
  }
  
  if (args.includes('--summary')) {
    await CollectionSummary.generateSummary();
  } else {
    // 기본값: 실시간 모니터링
    const monitor = new CollectionMonitor();
    
    // Ctrl+C 처리
    process.on('SIGINT', () => {
      monitor.stop();
      process.exit(0);
    });
    
    await monitor.startMonitoring();
  }
}

main();

module.exports = { CollectionMonitor, CollectionSummary };