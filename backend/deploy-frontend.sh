#!/bin/bash

echo "🚀 Deploying SAYU Frontend to Railway..."

# Navigate to frontend directory
cd ../frontend

# Deploy to Railway
railway up --service frontend

echo "✅ Frontend deployment initiated!"