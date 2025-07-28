#!/usr/bin/env node

/**
 * SAYU Node.js Process Memory Manager
 * 높은 메모리 사용량의 Node.js 프로세스를 안전하게 종료하는 도구
 */

const { exec, spawn } = require('child_process');
const path = require('path');

class NodeProcessManager {
  constructor(options = {}) {
    this.options = {
      // 메모리 임계값 (MB)
      memoryThresholdMB: options.memoryThresholdMB || 1000,
      
      // 강제 종료까지의 대기 시간 (초)
      gracefulTimeout: options.gracefulTimeout || 10,
      
      // 자동 정리 여부
      autoCleanup: options.autoCleanup || false,
      
      // 로깅 활성화
      enableLogging: options.enableLogging !== false,
      
      // 보호할 프로세스 (종료하지 않음)
      protectedProcesses: options.protectedProcesses || []
    };
  }
  
  /**
   * Node.js 프로세스 목록 조회
   */
  async getNodeProcesses() {
    return new Promise((resolve, reject) => {
      exec('wmic process where "name=\'node.exe\'" get ProcessId,WorkingSetSize,CommandLine /format:csv', 
        (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }
          
          const processes = [];
          const lines = stdout.split('\n')
            .filter(line => line.trim() && !line.includes('Node'))
            .filter(line => line.includes(','));
          
          lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length >= 4) {
              const commandLine = parts[1] || '';
              const pid = parseInt(parts[2]) || 0;
              const workingSetSize = parseInt(parts[3]) || 0;
              const memoryMB = Math.round(workingSetSize / 1024 / 1024);
              
              if (pid > 0) {
                processes.push({
                  pid,
                  memoryMB,
                  commandLine: commandLine.trim(),
                  isProtected: this.isProtectedProcess(commandLine)
                });
              }
            }
          });
          
          resolve(processes.sort((a, b) => b.memoryMB - a.memoryMB));
        });
    });
  }
  
  /**
   * 프로세스가 보호 대상인지 확인
   */
  isProtectedProcess(commandLine) {
    return this.options.protectedProcesses.some(pattern => 
      commandLine.toLowerCase().includes(pattern.toLowerCase())
    );
  }
  
  /**
   * 높은 메모리 사용 프로세스 식별
   */
  identifyHighMemoryProcesses(processes) {
    return processes.filter(proc => 
      proc.memoryMB > this.options.memoryThresholdMB && !proc.isProtected
    );
  }
  
  /**
   * 프로세스 정보 출력
   */
  displayProcesses(processes) {
    console.log('\n📊 Current Node.js Processes:');
    console.log('─'.repeat(80));
    console.log('PID\t\tMemory\t\tCommand');
    console.log('─'.repeat(80));
    
    processes.forEach(proc => {
      const memoryColor = proc.memoryMB > this.options.memoryThresholdMB ? '🔴' : 
                         proc.memoryMB > this.options.memoryThresholdMB * 0.7 ? '🟡' : '🟢';
      const protectedMark = proc.isProtected ? '🛡️ ' : '';
      
      console.log(`${proc.pid}\t\t${memoryColor} ${proc.memoryMB}MB\t\t${protectedMark}${this.truncateCommand(proc.commandLine)}`);
    });
    
    console.log('─'.repeat(80));
  }
  
  /**
   * 명령어 줄 단축
   */
  truncateCommand(command) {
    if (command.length > 50) {
      return command.substring(0, 47) + '...';
    }
    return command;
  }
  
  /**
   * 프로세스 안전 종료
   */
  async terminateProcess(pid, graceful = true) {
    return new Promise((resolve, reject) => {
      if (graceful) {
        this.log(`Attempting graceful termination of process ${pid}...`);
        
        // Windows에서 SIGTERM 시뮬레이션
        exec(`taskkill /PID ${pid}`, (error, stdout, stderr) => {
          if (error) {
            this.log(`Graceful termination failed for ${pid}, trying force kill...`, 'warn');
            
            // 강제 종료
            exec(`taskkill /F /PID ${pid}`, (forceError, forceStdout, forceStderr) => {
              if (forceError) {
                reject(forceError);
              } else {
                this.log(`Process ${pid} force killed`, 'warn');
                resolve(true);
              }
            });
          } else {
            this.log(`Process ${pid} terminated gracefully`);
            resolve(true);
          }
        });
      } else {
        // 직접 강제 종료
        exec(`taskkill /F /PID ${pid}`, (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            this.log(`Process ${pid} force killed`, 'warn');
            resolve(true);
          }
        });
      }
    });
  }
  
  /**
   * 메모리 정리 실행
   */
  async cleanupMemory() {
    try {
      this.log('🧹 Starting Node.js memory cleanup...');
      
      // 1. 현재 프로세스 목록 조회
      const processes = await this.getNodeProcesses();
      
      if (processes.length === 0) {
        this.log('No Node.js processes found');
        return { cleaned: 0, totalMemoryFreed: 0 };
      }
      
      // 2. 프로세스 정보 출력
      this.displayProcesses(processes);
      
      // 3. 높은 메모리 사용 프로세스 식별
      const highMemoryProcesses = this.identifyHighMemoryProcesses(processes);
      
      if (highMemoryProcesses.length === 0) {
        this.log(`✅ All processes are below memory threshold (${this.options.memoryThresholdMB}MB)`);
        return { cleaned: 0, totalMemoryFreed: 0 };
      }
      
      this.log(`\n🚨 Found ${highMemoryProcesses.length} high-memory processes:`);
      highMemoryProcesses.forEach(proc => {
        this.log(`  - PID ${proc.pid}: ${proc.memoryMB}MB - ${this.truncateCommand(proc.commandLine)}`);
      });
      
      // 4. 자동 정리 또는 사용자 확인
      let shouldCleanup = this.options.autoCleanup;
      
      if (!shouldCleanup) {
        const answer = await this.promptUser(`\n❓ Terminate ${highMemoryProcesses.length} high-memory processes? (y/N): `);
        shouldCleanup = answer.toLowerCase().startsWith('y');
      }
      
      if (!shouldCleanup) {
        this.log('Cleanup cancelled by user');
        return { cleaned: 0, totalMemoryFreed: 0 };
      }
      
      // 5. 프로세스 종료 실행
      let cleanedCount = 0;
      let totalMemoryFreed = 0;
      
      for (const proc of highMemoryProcesses) {
        try {
          this.log(`Terminating process ${proc.pid} (${proc.memoryMB}MB)...`);
          
          const success = await this.terminateProcess(proc.pid, true);
          
          if (success) {
            cleanedCount++;
            totalMemoryFreed += proc.memoryMB;
            
            // 프로세스 종료 후 잠시 대기
            await this.sleep(1000);
          }
          
        } catch (error) {
          this.log(`Failed to terminate process ${proc.pid}: ${error.message}`, 'error');
        }
      }
      
      // 6. 결과 출력
      this.log(`\n✅ Memory cleanup completed:`);
      this.log(`   - Processes terminated: ${cleanedCount}/${highMemoryProcesses.length}`);
      this.log(`   - Memory freed: ~${totalMemoryFreed}MB`);
      
      // 7. 정리 후 상태 확인
      if (cleanedCount > 0) {
        await this.sleep(2000);
        const afterProcesses = await this.getNodeProcesses();
        this.log(`\n📊 Remaining Node.js processes: ${afterProcesses.length}`);
        
        if (afterProcesses.length > 0) {
          this.displayProcesses(afterProcesses);
        }
      }
      
      return { cleaned: cleanedCount, totalMemoryFreed };
      
    } catch (error) {
      this.log(`Memory cleanup failed: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * 지속적인 모니터링 및 자동 정리
   */
  async startMonitoring(intervalMinutes = 5) {
    this.log(`🔍 Starting continuous monitoring (every ${intervalMinutes} minutes)...`);
    
    const monitorInterval = setInterval(async () => {
      try {
        this.log('Checking memory usage...');
        
        const processes = await this.getNodeProcesses();
        const highMemoryProcesses = this.identifyHighMemoryProcesses(processes);
        
        if (highMemoryProcesses.length > 0) {
          this.log(`Found ${highMemoryProcesses.length} high-memory processes`);
          
          if (this.options.autoCleanup) {
            await this.cleanupMemory();
          } else {
            this.log('High memory usage detected. Run with --auto-cleanup for automatic termination.');
            highMemoryProcesses.forEach(proc => {
              this.log(`  - PID ${proc.pid}: ${proc.memoryMB}MB`, 'warn');
            });
          }
        }
        
      } catch (error) {
        this.log(`Monitoring error: ${error.message}`, 'error');
      }
    }, intervalMinutes * 60 * 1000);
    
    // 종료 처리
    process.on('SIGINT', () => {
      this.log('Stopping monitoring...');
      clearInterval(monitorInterval);
      process.exit(0);
    });
    
    return monitorInterval;
  }
  
  /**
   * 사용자 입력 프롬프트
   */
  async promptUser(question) {
    return new Promise((resolve) => {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }
  
  /**
   * 시스템 메모리 정보 조회
   */
  async getSystemMemoryInfo() {
    return new Promise((resolve, reject) => {
      exec('wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /format:csv', 
        (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }
          
          const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('Node'));
          if (lines.length > 0) {
            const data = lines[lines.length - 1].split(',');
            if (data.length >= 3) {
              const totalKB = parseInt(data[2]) || 0;
              const freeKB = parseInt(data[1]) || 0;
              
              resolve({
                totalMB: Math.round(totalKB / 1024),
                freeMB: Math.round(freeKB / 1024),
                usedMB: Math.round((totalKB - freeKB) / 1024),
                usagePercent: Math.round(((totalKB - freeKB) / totalKB) * 100)
              });
              return;
            }
          }
          
          resolve({ totalMB: 0, freeMB: 0, usedMB: 0, usagePercent: 0 });
        });
    });
  }
  
  /**
   * 시스템 상태 출력
   */
  async displaySystemStatus() {
    try {
      const memInfo = await this.getSystemMemoryInfo();
      
      console.log('\n💻 System Memory Status:');
      console.log(`   Total: ${memInfo.totalMB}MB`);
      console.log(`   Used: ${memInfo.usedMB}MB (${memInfo.usagePercent}%)`);
      console.log(`   Free: ${memInfo.freeMB}MB`);
      
    } catch (error) {
      this.log(`Failed to get system memory info: ${error.message}`, 'warn');
    }
  }
  
  /**
   * 로깅
   */
  log(message, level = 'info') {
    if (!this.options.enableLogging) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }
  
  /**
   * 대기
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI 실행
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    autoCleanup: args.includes('--auto-cleanup') || args.includes('-a'),
    memoryThresholdMB: 800, // 기본값을 낮춤
    enableLogging: !args.includes('--quiet')
  };
  
  // 임계값 설정
  const thresholdIndex = args.findIndex(arg => arg === '--threshold' || arg === '-t');
  if (thresholdIndex !== -1 && args[thresholdIndex + 1]) {
    options.memoryThresholdMB = parseInt(args[thresholdIndex + 1]);
  }
  
  // 보호 프로세스 설정
  const protectIndex = args.findIndex(arg => arg === '--protect');
  if (protectIndex !== -1 && args[protectIndex + 1]) {
    options.protectedProcesses = args[protectIndex + 1].split(',');
  }
  
  const manager = new NodeProcessManager(options);
  
  if (args.includes('--monitor') || args.includes('-m')) {
    // 모니터링 모드
    const intervalIndex = args.findIndex(arg => arg === '--interval');
    const interval = intervalIndex !== -1 && args[intervalIndex + 1] ? 
                    parseInt(args[intervalIndex + 1]) : 5;
    
    manager.startMonitoring(interval).catch(console.error);
    
  } else if (args.includes('--status') || args.includes('-s')) {
    // 상태 조회만
    (async () => {
      await manager.displaySystemStatus();
      const processes = await manager.getNodeProcesses();
      manager.displayProcesses(processes);
    })().catch(console.error);
    
  } else if (args.includes('--help') || args.includes('-h')) {
    // 도움말
    console.log(`
🧹 SAYU Node.js Process Memory Manager

Usage: node kill-node-processes.js [options]

Options:
  -a, --auto-cleanup         Automatically terminate high-memory processes
  -t, --threshold <MB>       Memory threshold in MB (default: 800)
  -m, --monitor             Start continuous monitoring
  --interval <minutes>       Monitoring interval (default: 5)
  -s, --status              Show system and process status only
  --protect <processes>      Comma-separated list of protected process patterns
  --quiet                   Disable logging
  -h, --help                Show this help

Examples:
  node kill-node-processes.js                    # Interactive cleanup
  node kill-node-processes.js -a -t 1000         # Auto cleanup above 1GB
  node kill-node-processes.js -m --interval 3    # Monitor every 3 minutes
  node kill-node-processes.js -s                 # Show status only
`);
    
  } else {
    // 기본 정리 모드
    (async () => {
      await manager.displaySystemStatus();
      await manager.cleanupMemory();
    })().catch(console.error);
  }
}

module.exports = NodeProcessManager;