# Museum API Licensing for Commercial Use

This document outlines the licensing terms for museum APIs used in SAYU and their commercial use permissions.

## ✅ APPROVED FOR COMMERCIAL USE

### Metropolitan Museum of Art API
- **URL**: https://collectionapi.metmuseum.org/
- **License**: Open Access
- **Commercial Use**: ✅ Explicitly allowed
- **Terms**: "The Metropolitan Museum of Art provides select datasets of information on more than 470,000 artworks in its collection for unrestricted commercial and noncommercial use."
- **Rate Limit**: ~100 requests per minute
- **Data**: 470,000+ artworks, many with high-resolution images

### Cleveland Museum of Art API
- **URL**: https://openaccess-api.clevelandart.org/
- **License**: Open Access
- **Commercial Use**: ✅ Explicitly allowed
- **Terms**: "All data is available for commercial and noncommercial use without restriction"
- **Rate Limit**: ~4,000 requests per day
- **Data**: 62,000+ artworks with high-quality images

### Rijksmuseum API
- **URL**: https://www.rijksmuseum.nl/en/api
- **License**: Creative Commons (for public domain works)
- **Commercial Use**: ✅ Allowed for public domain works
- **Terms**: "You may use our API for commercial purposes provided that you comply with the terms"
- **Rate Limit**: ~10,000 requests per day
- **Data**: 700,000+ objects, focus on Dutch art and history
- **Note**: Requires API key registration

## ❌ REMOVED - NOT COMMERCIALLY LICENSED

### Harvard Art Museums API
- **License**: Non-commercial use only
- **Reason for removal**: Terms explicitly restrict commercial use
- **Quote**: "The API is intended for non-commercial use only"

### Brooklyn Museum API
- **License**: Unclear/Restricted
- **Reason for removal**: Terms of service not clearly defined for commercial use

### Cooper Hewitt Smithsonian API
- **License**: Non-commercial use only
- **Reason for removal**: Smithsonian APIs typically restrict commercial use

## IMPLEMENTATION NOTES

1. **API Keys Required**:
   - Rijksmuseum: Register at https://www.rijksmuseum.nl/en/api
   - Met Museum: No API key required
   - Cleveland: No API key required

2. **Rate Limiting**:
   - All APIs implement respectful rate limiting
   - Delays calculated to stay within published limits
   - Exponential backoff on errors

3. **Data Quality**:
   - Only artworks with images are synchronized
   - Public domain status is tracked when available
   - High-resolution images preferred

4. **Legal Compliance**:
   - All selected APIs explicitly allow commercial use
   - Terms reviewed as of 2024
   - Regular license review recommended

## ENVIRONMENT VARIABLES

```bash
# Required for Rijksmuseum
RIJKS_API_KEY=your_rijksmuseum_api_key

# Optional - other APIs don't require keys
# HARVARD_API_KEY=removed_non_commercial
# COOPER_HEWITT_API_KEY=removed_non_commercial
```

## USAGE EXAMPLES

The museum API service only includes commercially-licensed sources:

```javascript
// Available sync methods
await museumAPIService.syncMetMuseum();
await museumAPIService.syncClevelandMuseum();
await museumAPIService.syncRijksmuseum();

// Or sync all commercial sources
await museumAPIService.syncAllMuseums();
```

## DISCLAIMERS

1. **License Verification**: While these APIs allowed commercial use at the time of implementation, license terms can change. Regular verification is recommended.

2. **Attribution**: Some museums request attribution even for public domain works. Consider adding museum credits in your UI.

3. **Rate Limits**: Respect published rate limits and implement proper error handling.

4. **Image Rights**: While the data may be open access, individual artworks may have specific rights. Check individual artwork rights before commercial use.

## REGULAR REVIEW

- Review API terms annually
- Monitor for any changes in licensing
- Add new commercially-licensed APIs as they become available
- Update rate limits based on current API documentation

Last Updated: 2024
Next Review Due: 2025