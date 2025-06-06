# SAYU Development Migration Guide

## 🚀 Complete Setup for New Development Environment

Moving SAYU to a new computer requires more than just copying files. Here's the complete process:

## 📦 Method 1: Git Repository (Recommended)

### Step 1: Create Git Repository (Current Computer)
```bash
cd /home/yclee913/sayu

# Initialize git repository
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.production

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Database
postgres_data/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/

# Build outputs
.next/
dist/
build/

# Temporary files
*.tmp
*.temp

# Redis dumps
dump.rdb
EOF

# Add all files
git add .

# Initial commit
git commit -m "Initial SAYU project setup with 128 profile system

🎨 Features included:
- Backend: Node.js/Express with PostgreSQL and Redis
- Frontend: Next.js 15 with React and Framer Motion
- Quiz system: 14 exhibition + artwork preference questions
- Profile system: 128 unique combinations (16×8)
- Image generation: AI prompt system for personalized profiles
- Authentication: JWT-based user system
- API: Complete REST endpoints for all features

🔧 Architecture:
- Exhibition types: G/S, A/R, M/E, F/C dimensions
- Artwork scoring: Tag-based preference calculation
- Profile mapping: Dynamic image selection system
- Recommendations: Personalized artwork suggestions"

# Add remote repository (GitHub/GitLab)
git remote add origin https://github.com/yourusername/sayu.git
git branch -M main
git push -u origin main
```

### Step 2: Clone on New Computer
```bash
# Clone the repository
git clone https://github.com/yourusername/sayu.git
cd sayu

# Follow the setup steps below...
```

## 📁 Method 2: Manual File Transfer

### Files to Copy
```
sayu/
├── backend/
│   ├── src/
│   ├── package.json
│   ├── schema.sql
│   ├── docker-compose.yml
│   └── .env.example
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── .env.example
└── *.md files (documentation)
```

### What NOT to Copy
```
# Don't copy these:
node_modules/     # Will be recreated
.env              # Contains secrets
.next/           # Build cache
postgres_data/   # Database data
*.log            # Log files
```

## 🛠️ Complete Setup Process (New Computer)

### Prerequisites Installation

#### Windows + WSL2
```bash
# Install WSL2 (if not already installed)
wsl --install

# Update WSL2
wsl --update

# Install Ubuntu (if needed)
wsl --install -d Ubuntu
```

#### Node.js and Package Managers
```bash
# Install Node.js (using nvm - recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install latest Node.js LTS
nvm install --lts
nvm use --lts

# Verify installation
node --version  # Should be v18+ or v20+
npm --version
```

#### Docker and Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

#### PostgreSQL Client (for database operations)
```bash
sudo apt update
sudo apt install postgresql-client
```

### Step 1: Setup Backend

```bash
cd sayu/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Edit `.env` file:**
```bash
# Database
DATABASE_URL=postgresql://sayu_user:your_secure_password@localhost:5432/sayu_db

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3001
NODE_ENV=development

# Auth (Generate a secure secret)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random

# OpenAI (Optional - for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-if-you-have-one

# Frontend
FRONTEND_URL=http://localhost:3000

# Admin (for image generation endpoints)
ADMIN_KEY=your-admin-key-for-image-management
```

### Step 2: Start Database Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Wait for services to start (30-60 seconds)
docker-compose ps

# Should show postgres and redis as "Up"
```

### Step 3: Setup Database Schema

```bash
# Create database schema
psql -h localhost -U sayu_user -d sayu_db -f schema.sql

# Enter password when prompted: your_secure_password
```

### Step 4: Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

**Edit `.env.local` file:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 5: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd sayu/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd sayu/frontend
npm run dev
```

### Step 6: Verify Setup

```bash
# Test backend health
curl http://localhost:3001/api/health

# Should return: {"status":"healthy",...}

# Test frontend
curl http://localhost:3000

# Should return HTML content
```

## 🗂️ Project Structure Reference

```
sayu/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database, Redis config
│   │   ├── controllers/    # API controllers
│   │   ├── data/          # Quiz questions, exhibition types
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic services
│   │   └── server.js      # Main server file
│   ├── package.json
│   ├── schema.sql         # Database schema
│   └── docker-compose.yml # PostgreSQL + Redis
├── frontend/               # Next.js React app
│   ├── app/               # App Router pages
│   ├── components/        # Reusable components
│   ├── hooks/            # Custom React hooks
│   ├── public/           # Static assets
│   │   └── images/
│   │       ├── quiz/     # Quiz question images
│   │       └── profiles/ # 128 profile images (to be generated)
│   ├── package.json
│   └── next.config.js
└── documentation files
```

## 🔧 Development Commands

### Backend Commands
```bash
# Development server
npm run dev

# Database setup (if needed)
npm run db:setup

# Database seeding (if needed)
npm run db:seed
```

### Frontend Commands
```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database Commands
```bash
# Connect to database
psql -h localhost -U sayu_user -d sayu_db

# Backup database
pg_dump -h localhost -U sayu_user -d sayu_db > backup.sql

# Restore database
psql -h localhost -U sayu_user -d sayu_db < backup.sql
```

## 🚨 Common Issues & Solutions

### Issue: Port Already in Use
```bash
# Kill process using port 3001
sudo lsof -t -i tcp:3001 | xargs kill -9

# Kill process using port 3000
sudo lsof -t -i tcp:3000 | xargs kill -9
```

### Issue: Docker Permission Denied
```bash
# Add user to docker group and restart
sudo usermod -aG docker $USER
newgrp docker
```

### Issue: Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart services
docker-compose down
docker-compose up -d
```

### Issue: Node Modules Missing
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📋 Migration Checklist

- [ ] Install Node.js, Docker, PostgreSQL client
- [ ] Copy/clone SAYU project files
- [ ] Setup backend environment variables
- [ ] Start PostgreSQL and Redis with Docker
- [ ] Create database schema
- [ ] Setup frontend environment variables
- [ ] Install all dependencies (backend & frontend)
- [ ] Start development servers
- [ ] Test API endpoints and frontend
- [ ] Verify quiz system works
- [ ] Check profile generation
- [ ] Test image upload system (if using 128 profile images)

## 🎯 Success Criteria

Your SAYU setup is complete when:
1. ✅ Backend API responds at `http://localhost:3001/api/health`
2. ✅ Frontend loads at `http://localhost:3000`
3. ✅ User can register and login
4. ✅ Quiz system works (both exhibition and artwork)
5. ✅ Profile generation creates user profiles
6. ✅ Database stores user data correctly
7. ✅ No console errors in browser or terminal

## 💡 Pro Tips

1. **Use Git**: Always use version control for easier collaboration
2. **Environment Isolation**: Use different .env files for different environments
3. **Docker Volumes**: Don't delete docker volumes unless you want to lose data
4. **Backup Regularly**: Export database and important configurations
5. **Documentation**: Keep this guide updated with any changes you make

Your SAYU development environment is now ready for development on any computer! 🚀