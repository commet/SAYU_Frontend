# Suggested Commands for SAYU Development

## Build & Development
- `npm run build` - Build shared components
- `npm run dev:frontend` - Start frontend development server
- `npm run dev:backend` - Start backend development server
- `npm start` - Start production backend server

## Code Quality
- `npm run typecheck` - TypeScript type checking
- `npm run lint` - ESLint code linting
- `npm run test` - Run backend tests
- `npm run health-check` - Run all checks (typecheck + lint + test)

## Database Operations
- Backend contains various database migration scripts in `migrations/` folder
- Supabase client configurations in `backend/src/config/`

## Windows Commands
- `start-dev.bat` - Windows batch file to start development
- Uses PowerShell and CMD for Windows compatibility

## Important Files
- `CLAUDE.md` - Project context and instructions
- `package.json` - Root workspace configuration
- `frontend/package.json` - Frontend dependencies
- `backend/package.json` - Backend dependencies