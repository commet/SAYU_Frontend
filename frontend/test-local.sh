#!/bin/bash

echo "🚀 SAYU Frontend Local Test Script"
echo "================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🌐 Starting production server..."
    echo "📍 Access at: http://localhost:3000"
    echo ""
    echo "🧪 Test checklist:"
    echo "  1. Gallery page (/gallery) - Check if images load"
    echo "  2. Quiz page (/quiz) - Select 'Museum Journey (Scenario)'"
    echo "  3. Scenario quiz (/quiz/scenario) - Check if background images show"
    echo "  4. Daily recommendations - Check artwork images"
    echo ""
    echo "Press Ctrl+C to stop the server"
    npm start
else
    echo "❌ Build failed! Check the errors above."
    exit 1
fi