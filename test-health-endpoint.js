const http = require('http');

// Test the health endpoint
function testHealthEndpoint() {
  console.log('🔍 Testing SAYU health endpoint...');

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/health',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const health = JSON.parse(data);
        console.log(`\n📊 Health Check Results (Status: ${res.statusCode})`);
        console.log('='.repeat(50));
        console.log(`Overall Status: ${health.healthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
        console.log(`Response Time: ${health.responseTime}ms`);
        console.log(`Uptime: ${Math.round(health.uptime)}s`);
        console.log(`Environment: ${health.environment}`);
        
        if (health.failedChecks && health.failedChecks.length > 0) {
          console.log(`Failed Checks: ${health.failedChecks.join(', ')}`);
        }

        console.log('\n🔍 Service Details:');
        console.log('-'.repeat(30));

        // Database
        if (health.checks.database) {
          console.log(`Database: ${health.checks.database.healthy ? '✅' : '❌'} (${health.checks.database.responseTime}ms)`);
          if (health.checks.database.details) {
            console.log(`  Railway: ${health.checks.database.details.railway.connected ? '✅' : '❌'} (${health.checks.database.details.railway.latency}ms)`);
            console.log(`  Supabase: ${health.checks.database.details.supabase.connected ? '✅' : '❌'} (${health.checks.database.details.supabase.latency}ms)`);
          }
        }

        // Redis
        if (health.checks.redis) {
          console.log(`Redis: ${health.checks.redis.healthy ? '✅' : '❌'} ${health.checks.redis.available ? '(Available)' : '(Not Configured)'}`);
        }

        // OpenAI
        if (health.checks.openai) {
          console.log(`OpenAI: ${health.checks.openai.healthy ? '✅' : '❌'} (${health.checks.openai.responseTime}ms)`);
          if (health.checks.openai.details && health.checks.openai.details.modelCount) {
            console.log(`  Models Available: ${health.checks.openai.details.modelCount}`);
          }
        }

        // Memory
        if (health.checks.memory) {
          const mem = health.checks.memory;
          console.log(`Memory: ${mem.healthy ? '✅' : '❌'} ${mem.warning ? '⚠️' : ''}`);
          console.log(`  Usage: ${mem.details.rss}MB (${mem.details.memoryPercentage}%)`);
          console.log(`  Heap: ${mem.details.heapUsed}MB / ${mem.details.heapTotal}MB`);
        }

        // Process
        if (health.checks.process) {
          console.log(`Process: ${health.checks.process.healthy ? '✅' : '❌'}`);
          console.log(`  PID: ${health.checks.process.details.pid}`);
          console.log(`  Uptime: ${health.checks.process.details.uptimeHours}h`);
          console.log(`  Node: ${health.checks.process.details.nodeVersion}`);
        }

        // Dependencies
        if (health.checks.dependencies) {
          console.log(`Dependencies: ${health.checks.dependencies.healthy ? '✅' : '❌'}`);
          if (health.checks.dependencies.missingRequired) {
            console.log(`  Missing: ${health.checks.dependencies.missingRequired.join(', ')}`);
          }
        }

        console.log('\n' + '='.repeat(50));
        console.log(health.healthy ? '🎉 All systems operational!' : '⚠️  Some systems need attention');

      } catch (error) {
        console.error('❌ Failed to parse health response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Health check request failed:', error.message);
    console.log('💡 Make sure the server is running on port 3001');
    console.log('💡 Try: cd backend && npm run dev');
  });

  req.on('timeout', () => {
    console.error('❌ Health check timed out');
    req.destroy();
  });

  req.end();
}

// Test additional endpoints
function testOtherEndpoints() {
  const endpoints = [
    '/api/health/simple',
    '/api/health/ready', 
    '/api/health/live'
  ];

  endpoints.forEach((endpoint, index) => {
    setTimeout(() => {
      console.log(`\n🔍 Testing ${endpoint}...`);
      
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: endpoint,
        method: 'GET',
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            console.log(`${endpoint}: ${res.statusCode} - ${result.status}`);
          } catch (error) {
            console.log(`${endpoint}: ${res.statusCode} - ${data}`);
          }
        });
      });

      req.on('error', (error) => {
        console.log(`${endpoint}: Failed - ${error.message}`);
      });

      req.end();
    }, index * 1000);
  });
}

// Run tests
console.log('🚀 SAYU Health Endpoint Test Suite');
console.log('='.repeat(50));
testHealthEndpoint();

// Test other endpoints after main test
setTimeout(testOtherEndpoints, 2000);