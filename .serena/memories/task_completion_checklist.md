# Task Completion Checklist for SAYU

## After Making Code Changes

### Required Checks
1. **TypeScript Check**: `npm run typecheck`
2. **Linting**: `npm run lint` 
3. **Testing**: `npm run test` (backend tests)
4. **Health Check**: `npm run health-check` (runs all above)

### Database Changes
- Test database connections work
- Verify schema changes don't break existing data
- Check Supabase migrations apply correctly

### Frontend Changes
- Test mobile responsiveness
- Verify APT type-specific styling works
- Check Korean/English text displays correctly

### Backend Changes
- Verify API endpoints respond correctly
- Test authentication flows
- Check exhibition data updates work

## Before Committing
- All TypeScript errors resolved
- No linting errors
- Tests pass
- Feature works in both development and production modes

## Important Notes
- Never commit with failing tests
- Always test on Windows environment (primary dev platform)
- Verify mobile functionality (mobile-first design)
- Test with real Supabase data when possible