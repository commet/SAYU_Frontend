# SAYU Code Style & Conventions

## Philosophy
- **완전한 구현**: No TODO or placeholder code - all features fully implemented
- **적응적 설계**: User type and situation-adaptive interfaces
- **Always solve for MVP instead of feature rich solutions**
- **Prefer quick, working solutions over perfect code**
- **Don't add features not explicitly requested**

## TypeScript Usage
- Strict TypeScript configuration
- Type definitions in `shared/` workspace
- Strong typing for APT system and art data structures

## Component Structure
- React functional components with hooks
- Mobile-first responsive design
- Personality-based styling (16 APT types)
- Emotion-based UI adaptations

## File Organization
- Monorepo with clear workspace separation
- `frontend/` - Next.js application
- `backend/` - Express.js API server
- `shared/` - Common types and utilities

## Korean Language Support
- Bilingual interface (Korean/English)
- Korean exhibition and artist data
- Cultural context-aware recommendations

## Database Conventions
- Snake_case for database columns
- Descriptive table names (exhibitions, artists, venues)
- Foreign key relationships clearly defined
- APT type integration throughout schema