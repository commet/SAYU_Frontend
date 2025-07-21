# Art Exhibition Websites Crawling Legal Analysis

## Summary Report

### Sites with PERMISSIVE Crawling Policies

#### 1. **Artreview.com** ✅ FULLY ACCESSIBLE
- **robots.txt**: `Allow: /` for all user agents
- **Restrictions**: None
- **Crawl delay**: None specified
- **Recommendation**: Best option for crawling - completely open policy

#### 2. **Ocula.com** ✅ ACCESSIBLE WITH RESTRICTIONS
- **robots.txt**: `Allow: /` for all paths
- **Sitemap**: Available at https://ocula.com/site-map/
- **Crawl delay**: 10 seconds (must be respected)
- **Recommendation**: Good option but must implement 10-second delay between requests

#### 3. **Artsy.net** ✅ PARTIALLY ACCESSIBLE
- **Exhibition data**: Appears accessible (has sitemap-shows.xml)
- **Restrictions**: Search pages and certain URL parameters blocked
- **Sitemaps**: 17 sitemaps available including shows/exhibitions
- **Crawl delay**: None specified
- **Special note**: Has API but being retired July 2025 (public domain works only)

#### 4. **e-flux.com** ✅ MOSTLY ACCESSIBLE
- **Restrictions**: Only `/accounts` path blocked
- **Exhibition pages**: Likely accessible (announcements section exists)
- **Crawl delay**: None specified
- **Note**: No RSS/API found, only email subscriptions

### Sites with RESTRICTIVE Policies

#### 5. **Artforum.com** ❌ HIGHLY RESTRICTED
- **AI/Bot blocking**: Explicitly blocks ChatGPT, GPTBot, Anthropic-ai, etc.
- **Sitemaps**: Available but crawling discouraged for AI bots
- **Exhibition data**: Technically accessible but legally questionable for AI purposes

#### 6. **Hyperallergic.com** ❌ COMPLETELY BLOCKED
- **Policy**: Blocks all major crawlers with `Disallow: /`
- **Specifically blocks**: GPTbot, ChatGPT-User, CCBot, Google-Extended, PerplexityBot
- **Recommendation**: Do not crawl - clear prohibition

#### 7. **Artnet.com** ❓ UNCLEAR
- **Issue**: robots.txt protected by Incapsula/security system
- **Status**: Cannot determine crawling policy
- **Recommendation**: Assume restricted until confirmed otherwise

#### 8. **Frieze.com** ❓ INACCESSIBLE
- **Issue**: 403 Forbidden error when accessing robots.txt
- **Status**: Cannot determine crawling policy
- **Recommendation**: Assume restricted

## Recommended Approach

### Best Options for Legal Crawling:
1. **Artreview.com** - No restrictions, fully open
2. **Ocula.com** - Open with 10-second crawl delay
3. **Artsy.net** - Use their sitemaps for structured access

### Implementation Guidelines:
1. Always respect crawl delays where specified
2. Use sitemaps when available for more efficient crawling
3. Include proper User-Agent headers identifying your crawler
4. Consider reaching out to sites for explicit permission
5. For sites with APIs (even if limited), prefer API access over crawling

### Alternative Data Sources:
- Consider partnerships or data licensing agreements
- Look for press release aggregators that may have redistribution rights
- Check if museums/galleries provide their own RSS feeds or APIs
- Consider manual curation for high-value content from restricted sites

## Legal Disclaimer
This analysis is based on robots.txt files only. Always:
- Review each site's Terms of Service
- Consider copyright implications for content
- Respect rate limits and server resources
- Consider GDPR/privacy regulations for any user data