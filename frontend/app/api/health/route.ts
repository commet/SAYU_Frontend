import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

/**
 * Frontend Health Check Endpoint
 * Monitors critical dependencies for the SAYU frontend
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  const health = {
    status: 'ok',
    timestamp,
    service: 'sayu-frontend',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    checks: {} as Record<string, any>
  };
  
  const failedChecks: string[] = [];
  
  try {
    // 1. Supabase Connection Check
    health.checks.supabase = await checkSupabase();
    if (!health.checks.supabase.healthy) {
      failedChecks.push('supabase');
    }
    
    // 2. OpenAI API Check
    health.checks.openai = await checkOpenAI();
    if (!health.checks.openai.healthy) {
      failedChecks.push('openai');
    }
    
    // 3. Build Health Check
    health.checks.build = checkBuildHealth();
    if (!health.checks.build.healthy) {
      failedChecks.push('build');
    }
    
    // 4. Environment Variables Check
    health.checks.environment = checkEnvironmentVariables();
    if (!health.checks.environment.healthy) {
      failedChecks.push('environment');
    }
    
    // 5. Backend Connectivity Check
    health.checks.backend = await checkBackendConnection();
    if (!health.checks.backend.healthy) {
      failedChecks.push('backend');
    }
    
  } catch (error) {
    console.error('Health check error:', error);
    health.checks.error = {
      healthy: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp
    };
    failedChecks.push('error');
  }
  
  // Overall health status
  health.status = failedChecks.length === 0 ? 'ok' : 'error';
  const responseTime = Date.now() - startTime;
  
  const response = {
    ...health,
    healthy: failedChecks.length === 0,
    failedChecks: failedChecks.length > 0 ? failedChecks : undefined,
    responseTime
  };
  
  const statusCode = failedChecks.length === 0 ? 200 : 503;
  
  return NextResponse.json(response, { status: statusCode });
}

/**
 * Check Supabase connection
 */
async function checkSupabase() {
  const startTime = Date.now();
  
  try {
    if (!supabaseUrl || !supabaseKey) {
      return {
        healthy: false,
        available: false,
        responseTime: Date.now() - startTime,
        message: 'Supabase credentials not configured',
        timestamp: new Date().toISOString()
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    return {
      healthy: true,
      available: true,
      responseTime: Date.now() - startTime,
      details: {
        url: supabaseUrl,
        userCount: data || 0
      },
      message: 'Supabase connection operational',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      healthy: false,
      available: true,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Supabase connection failed',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check OpenAI API availability
 */
async function checkOpenAI() {
  const startTime = Date.now();
  
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return {
        healthy: false,
        available: false,
        responseTime: Date.now() - startTime,
        message: 'OpenAI API key not configured',
        timestamp: new Date().toISOString()
      };
    }
    
    // Test OpenAI API with models endpoint
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    const modelCount = data?.data?.length || 0;
    
    return {
      healthy: true,
      available: true,
      responseTime: Date.now() - startTime,
      details: {
        modelCount,
        apiKeyConfigured: true
      },
      message: 'OpenAI API operational',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      healthy: false,
      available: true,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'OpenAI API check failed',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check build health
 */
function checkBuildHealth() {
  try {
    // Check if essential Next.js environment is working
    const buildTime = process.env.BUILD_TIME || new Date().toISOString();
    const nextVersion = process.env.NEXT_RUNTIME || 'nodejs';
    
    // Verify essential environment variables for build
    const requiredForBuild = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];
    
    const missingBuildVars = requiredForBuild.filter(
      varName => !process.env[varName]
    );
    
    const healthy = missingBuildVars.length === 0;
    
    return {
      healthy,
      details: {
        buildTime,
        nextVersion,
        nodeEnv: process.env.NODE_ENV,
        missingBuildVars: missingBuildVars.length > 0 ? missingBuildVars : undefined
      },
      message: healthy ? 
        'Build configuration healthy' : 
        `Missing build variables: ${missingBuildVars.join(', ')}`,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Build health check failed',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check environment variables
 */
function checkEnvironmentVariables() {
  const required = {
    'NEXT_PUBLIC_SUPABASE_URL': !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_KEY': !!process.env.SUPABASE_SERVICE_KEY,
    'OPENAI_API_KEY': !!process.env.OPENAI_API_KEY
  };
  
  const optional = {
    'GOOGLE_AI_API_KEY': !!process.env.GOOGLE_AI_API_KEY,
    'REPLICATE_API_TOKEN': !!process.env.REPLICATE_API_TOKEN,
    'SENTRY_DSN': !!process.env.SENTRY_DSN,
    'NEXT_PUBLIC_GA_MEASUREMENT_ID': !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  };
  
  const missingRequired = Object.entries(required)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  const availableOptional = Object.entries(optional)
    .filter(([key, value]) => value)
    .map(([key]) => key);
  
  const healthy = missingRequired.length === 0;
  
  return {
    healthy,
    details: {
      required,
      optional,
      missingRequired: missingRequired.length > 0 ? missingRequired : undefined,
      availableOptional
    },
    message: healthy ? 
      'All required environment variables configured' : 
      `Missing required variables: ${missingRequired.join(', ')}`,
    timestamp: new Date().toISOString()
  };
}

/**
 * Check backend connection
 */
async function checkBackendConnection() {
  const startTime = Date.now();
  
  try {
    // Try to connect to backend health endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const healthUrl = `${backendUrl}/health/simple`;
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // Timeout for backend connection
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      throw new Error(`Backend health check failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      healthy: true,
      available: true,
      responseTime: Date.now() - startTime,
      details: {
        backendUrl,
        backendStatus: data.status,
        backendUptime: data.uptime
      },
      message: 'Backend connection operational',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      healthy: false,
      available: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Backend connection failed',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Simple health check for load balancers
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}