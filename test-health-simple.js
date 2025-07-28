const http = require('http');

function testEndpoint(path, name) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`${name}: Status ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          if (path === '/api/health') {
            console.log(`  Overall Health: ${json.healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
            console.log(`  Response Time: ${json.responseTime}ms`);
            console.log(`  Failed Checks: ${json.failedChecks?.length || 0}`);
          } else {
            console.log(`  Status: ${json.status}`);
          }
        } catch (e) {
          console.log(`  Response: ${data.substring(0, 100)}...`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`${name}: ERROR - ${error.message}`);
      resolve();
    });

    req.on('timeout', () => {
      console.log(`${name}: TIMEOUT`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing SAYU Health Endpoints...\n');
  
  await testEndpoint('/api/health', 'Main Health Check');
  await testEndpoint('/api/health/simple', 'Simple Health Check');
  await testEndpoint('/api/health/ready', 'Readiness Probe');
  await testEndpoint('/api/health/live', 'Liveness Probe');
  
  console.log('\n✅ Health endpoint tests completed');
}

runTests().catch(console.error);