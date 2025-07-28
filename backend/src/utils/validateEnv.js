const { log } = require('../config/logger');

// Define required and optional environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SESSION_SECRET'
];

const optionalEnvVars = [
  // Frontend
  'FRONTEND_URL',

  // Database & Cache
  'REDIS_URL',
  'DATABASE_SSL_REJECT_UNAUTHORIZED',

  // APIs
  'OPENAI_API_KEY',
  'REPLICATE_API_TOKEN',

  // OAuth
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',

  // Email
  'EMAIL_SERVICE',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'EMAIL_FROM',

  // Storage
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',

  // Supabase
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'ENABLE_SUPABASE',
  'MIGRATE_TO_SUPABASE',
  'SUPABASE_SERVICES',

  // Monitoring
  'SENTRY_DSN',

  // Features
  'ENABLE_EMAIL_AUTOMATION',
  'ART_PROFILE_FREE_MONTHLY_LIMIT',
  'ART_PROFILE_PREMIUM_MONTHLY_LIMIT'
];

function validateEnv() {
  const errors = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Check optional variables and provide warnings
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(`Optional environment variable not set: ${varName}`);
    }
  });

  // Validate specific variable formats
  if (process.env.NODE_ENV && !['development', 'test', 'production'].includes(process.env.NODE_ENV)) {
    errors.push(`Invalid NODE_ENV value: ${process.env.NODE_ENV}. Must be one of: development, test, production`);
  }

  if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
    errors.push(`Invalid PORT value: ${process.env.PORT}. Must be a number`);
  }

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    errors.push(`Invalid DATABASE_URL format. Must start with postgresql://`);
  }

  if (process.env.ENABLE_SUPABASE && !['true', 'false'].includes(process.env.ENABLE_SUPABASE)) {
    errors.push(`Invalid ENABLE_SUPABASE value: ${process.env.ENABLE_SUPABASE}. Must be true or false`);
  }

  // Supabase configuration validation
  if (process.env.ENABLE_SUPABASE === 'true') {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      errors.push('When ENABLE_SUPABASE is true, both SUPABASE_URL and SUPABASE_ANON_KEY are required');
    }
  }

  // Production-specific validations
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this') {
      errors.push('Default JWT_SECRET detected in production! Please set a secure secret');
    }

    if (!process.env.SENTRY_DSN) {
      warnings.push('SENTRY_DSN not set for production. Error tracking will be disabled');
    }
  }

  // Log results
  if (errors.length > 0) {
    log.error('Environment validation failed:', { errors });
    console.error('\n❌ Environment Validation Failed:\n');
    errors.forEach(error => console.error(`   - ${error}`));
    console.error('\n');

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    log.warn('Environment validation warnings:', { warnings });
    console.warn('\n⚠️  Environment Warnings:\n');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
    console.warn('\n');
  }

  log.info('Environment validation completed', {
    requiredVarsSet: requiredEnvVars.filter(v => process.env[v]).length,
    optionalVarsSet: optionalEnvVars.filter(v => process.env[v]).length,
    totalRequired: requiredEnvVars.length,
    totalOptional: optionalEnvVars.length
  });

  return { errors, warnings };
}

module.exports = { validateEnv };
