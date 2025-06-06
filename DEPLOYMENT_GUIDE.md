# SAYU Production Deployment Guide

## Quick Start - Cost Optimization Steps

### 1. Deploy 128-Profile Image System (Saves 70% AI Costs)
```bash
# Generate 128 images (one-time cost ~$30-130)
cd backend
node src/scripts/addUserRoles.js  # Add role support first
node src/scripts/createAdmin.js admin@sayu.com secure-password-here

# Login as admin and download prompts
curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@sayu.com","password":"secure-password-here"}' \
     > admin-token.json

# Get prompts (use token from above)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:3001/api/image-generation/export-prompts \
     -o sayu_128_prompts.txt

# Generate images using AI service and upload to:
mkdir -p frontend/public/images/profiles
# Upload all 128 images with exact filenames from prompts
```

### 2. Security Updates Applied
✅ Replaced header-based admin auth with JWT role-based system
✅ Added proper admin middleware with role checking
✅ Created admin user creation script

### 3. AI Cost Optimizations Applied
✅ Switched curator chat from GPT-4 to GPT-3.5 (90% cost reduction)
✅ Added model selection based on task complexity
✅ Reduced token limits for simple operations

## Immediate Production Steps

### Run Database Migration
```bash
cd backend
node src/scripts/addUserRoles.js
```

### Create Admin User
```bash
node src/scripts/createAdmin.js admin@yourdomain.com your-secure-password
```

### Environment Variables
```env
# Required
JWT_SECRET=generate-64-char-secret-here
OPENAI_API_KEY=your-openai-key
DATABASE_URL=postgresql://user:pass@host:5432/sayu
REDIS_URL=redis://localhost:6379

# Optional but recommended
NODE_ENV=production
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

## Cost Breakdown

### Current Monthly Costs (100k users)
- Profile Generation: $11,000 (using DALL-E)
- Curator Chat: $30,000 (20 messages/user avg)
- Total: ~$41,000/month

### After Optimizations
- Profile Generation: $0 (using pre-generated images)
- Curator Chat: $3,000 (using GPT-3.5)
- Total: ~$3,000/month (93% reduction!)

## Still TODO for Production

### High Priority
1. **JWT Refresh Tokens** - Implement token rotation for security
2. **Redis Caching** - Cache profiles and AI responses
3. **Input Validation** - Add comprehensive validation middleware
4. **Rate Limiting** - Enhance current basic implementation

### Medium Priority
1. **Test Coverage** - Add tests for auth and core features
2. **Error Tracking** - Integrate Sentry or similar
3. **Logging** - Structured logging with Winston/Pino
4. **Health Checks** - Add comprehensive monitoring endpoints

### Infrastructure
1. **Database Indexes** - Add indexes on frequently queried fields
2. **CDN Setup** - Serve static assets via CDN
3. **Load Balancing** - Prepare for horizontal scaling
4. **Backup Strategy** - Automated database backups

## Quick Commands

```bash
# Check image deployment status
curl -H "Authorization: Bearer ADMIN_TOKEN" \
     http://localhost:3001/api/image-generation/validate-images

# Monitor AI costs
grep "model:" backend/logs/api.log | sort | uniq -c

# Test security
curl http://localhost:3001/api/image-generation/combinations
# Should return 403 without proper admin token
```

## Support

For issues or questions about deployment, check the logs first:
- Backend logs: `pm2 logs sayu-backend`
- Database logs: Check PostgreSQL logs
- Redis: `redis-cli monitor`