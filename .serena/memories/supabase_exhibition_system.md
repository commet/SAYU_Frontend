# Supabase Exhibition System

## Database Tables
### exhibitions table
Main table storing exhibition information with fields like:
- id, title, title_ko (Korean title)
- venue_name, venue_id
- start_date, end_date
- description, image_url
- status, category
- created_at, updated_at

### venues table
Exhibition venues with location and metadata

### artists table
Artist information linked to exhibitions and artworks

## Data Issues
- Some exhibition titles are incorrect/incomplete
- Frontend displays may show wrong exhibition names
- MMCA and other major venues need title updates

## Common Operations
- Exhibition data collection from Korean sources
- Title standardization and correction
- Venue information management
- Artist-exhibition relationships

## Update Patterns
- Use backend scripts for bulk updates
- Verify titles match official exhibition names
- Maintain both Korean and English titles where applicable