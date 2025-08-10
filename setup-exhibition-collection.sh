#!/bin/bash

# SAYU Exhibition Data Collection Setup Script
# Run this script to set up exhibition data collection in minutes

set -e

echo "🎨 SAYU Exhibition Data Collection Setup"
echo "======================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the SAYU project root directory"
    exit 1
fi

print_status "Found SAYU project directory"

# Navigate to backend
cd backend

# Check Node.js installation
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v)"

# Install dependencies
print_info "Installing Node.js dependencies..."
npm install axios puppeteer pg dotenv xml2js cheerio node-cron

print_status "Dependencies installed"

# Check for .env file
if [ ! -f ".env" ]; then
    print_info "Creating .env file..."
    
    # Create basic .env file
    cat > .env << EOF
# Database connection
DATABASE_URL=postgresql://username:password@localhost:5432/sayu

# API Keys (Register at the provided URLs)
CULTURE_API_KEY=
SEOUL_API_KEY=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# Feature flags
EXHIBITION_COLLECTION_ENABLED=true
EXHIBITION_CRAWLING_ENABLED=true
REAL_TIME_UPDATES=true

# Optional: OpenAI for data enrichment
OPENAI_API_KEY=

# Environment
NODE_ENV=development
EOF

    print_status "Created .env file template"
    print_warning "Please update the .env file with your database URL and API keys"
else
    print_status "Found existing .env file"
fi

# Create necessary directories
mkdir -p collection_results
mkdir -p monitoring_logs
mkdir -p logs

print_status "Created required directories"

# Check database connection
print_info "Testing database connection..."

# Create a simple test script
cat > test_db.js << 'EOF'
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('exhibitions', 'venues')
    `);
    
    if (result.rows.length < 2) {
      console.log('⚠️  Required tables are missing');
      console.log('   Run: npm run db:migrate or execute the SQL files in backend/src/database/');
    } else {
      console.log('✅ Required tables found');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('Please check your DATABASE_URL in the .env file');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
EOF

# Run database test
if node test_db.js; then
    print_status "Database connection verified"
else
    print_warning "Database connection failed - please check your DATABASE_URL"
fi

# Clean up test file
rm test_db.js

# Create quick start package.json scripts if they don't exist
print_info "Setting up npm scripts..."

# Check if package.json exists and add scripts
if [ -f "package.json" ]; then
    # Use Node.js to modify package.json
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    pkg.scripts = pkg.scripts || {};
    pkg.scripts['collect:quick'] = 'node quick-start-exhibition-collection.js';
    pkg.scripts['collect:monitor'] = 'node exhibition-monitoring-system.js';
    pkg.scripts['collect:test'] = 'node -e \"console.log(\\\"Testing collection system...\\\"); require(\\\"./quick-start-exhibition-collection.js\\\")\"';
    
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    console.log('✅ Added npm scripts');
    "
else
    # Create basic package.json
    cat > package.json << EOF
{
  "name": "sayu-backend",
  "version": "1.0.0",
  "description": "SAYU Exhibition Data Collection Backend",
  "main": "index.js",
  "scripts": {
    "collect:quick": "node quick-start-exhibition-collection.js",
    "collect:monitor": "node exhibition-monitoring-system.js",
    "collect:test": "node -e \"console.log('Testing collection system...'); require('./quick-start-exhibition-collection.js')\""
  },
  "dependencies": {
    "axios": "^1.6.0",
    "puppeteer": "^21.5.0",
    "pg": "^8.11.0",
    "dotenv": "^16.3.0",
    "xml2js": "^0.6.2",
    "cheerio": "^1.0.0-rc.12",
    "node-cron": "^3.0.0"
  }
}
EOF
    print_status "Created package.json with collection scripts"
fi

# Display API key instructions
echo ""
echo "🔑 API Key Setup Instructions"
echo "============================="
echo ""
echo "To start collecting exhibition data, please obtain these FREE API keys:"
echo ""
echo "1. Culture Data Portal (Korean Government)"
echo "   🌐 https://www.culture.go.kr/data"
echo "   📝 Register for free account and request API key"
echo "   💰 Cost: FREE (1,000 requests/day)"
echo "   🎯 Covers: Major Korean museums and cultural venues"
echo ""
echo "2. Seoul Open Data (Seoul Metropolitan Government)"
echo "   🌐 https://data.seoul.go.kr"
echo "   📝 Register and create API key"
echo "   💰 Cost: FREE (unlimited)"
echo "   🎯 Covers: All Seoul cultural exhibitions"
echo ""
echo "3. Naver Search API (Optional but recommended)"
echo "   🌐 https://developers.naver.com"
echo "   📝 Create application and get Client ID/Secret"
echo "   💰 Cost: FREE (25,000 requests/day)"
echo "   🎯 Covers: Real-time exhibition mentions and updates"
echo ""

# Create a getting started guide
cat > GETTING_STARTED.md << EOF
# SAYU Exhibition Data Collection - Getting Started

## Quick Start (5 minutes)

1. **Update API Keys**
   Edit the \`.env\` file and add your API keys:
   \`\`\`
   CULTURE_API_KEY=your-culture-portal-key
   SEOUL_API_KEY=your-seoul-data-key
   NAVER_CLIENT_ID=your-naver-client-id
   NAVER_CLIENT_SECRET=your-naver-client-secret
   \`\`\`

2. **Run First Collection**
   \`\`\`bash
   npm run collect:quick
   \`\`\`

3. **Start Monitoring**
   \`\`\`bash
   npm run collect:monitor
   \`\`\`

## Available Commands

- \`npm run collect:quick\` - Run immediate exhibition data collection
- \`npm run collect:monitor\` - Start real-time monitoring system
- \`npm run collect:test\` - Test the collection system

## Next Steps

1. Set up automated scheduling with cron jobs
2. Configure additional data sources
3. Implement data validation and quality checks
4. Add international exhibition sources

## Support

For issues or questions, check the main documentation:
- EXHIBITION_DATA_STRATEGY_2025.md
- backend/src/services/exhibitionDataValidation.js
- backend/exhibition-monitoring-system.js
EOF

print_status "Created GETTING_STARTED.md guide"

# Final status check
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""

# Check what's ready to use
if [ -f "quick-start-exhibition-collection.js" ]; then
    print_status "Quick start collection script ready"
else
    print_warning "Quick start script not found - please ensure all files were created"
fi

if [ -f "exhibition-monitoring-system.js" ]; then
    print_status "Monitoring system ready"
fi

if [ -f "../EXHIBITION_DATA_STRATEGY_2025.md" ]; then
    print_status "Strategy documentation available"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Add your API keys to the .env file"
echo "2. Run: npm run collect:quick"
echo "3. Run: npm run collect:monitor"
echo ""
echo "📚 Documentation:"
echo "- Read GETTING_STARTED.md for detailed instructions"
echo "- Check ../EXHIBITION_DATA_STRATEGY_2025.md for the full strategy"
echo ""

# Check if we can run a quick test
if [ ! -z "$DATABASE_URL" ]; then
    print_info "Would you like to run a quick test now? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_info "Running quick collection test..."
        npm run collect:quick
    fi
fi

echo ""
print_status "Setup completed successfully! 🎨"
echo ""