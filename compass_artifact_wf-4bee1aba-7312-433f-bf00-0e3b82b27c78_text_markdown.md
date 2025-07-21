# Exhibition Information Database: Comprehensive Research on Gallery and Museum Data Collection Methods

Based on extensive research across domestic and international sources, this report provides a complete guide for building an exhibition information database. A critical finding: **Artsy's public API retires on July 28, 2025**, fundamentally changing the landscape of available data sources.

## Korean domestic gallery ecosystem lacks public APIs

Korean galleries operate without standardized data access systems, requiring alternative collection strategies. Major galleries like Gallery Hyundai, Kukje Gallery, Leeum Museum, PKM Gallery, and Arario Gallery maintain sophisticated websites but offer no public APIs or structured data exports. This pattern extends to regional galleries in Seoul, Busan, Daegu, and Gwangju.

**Neolook (네오룩)** emerges as the most comprehensive Korean art platform, operating since the 1970s and recognized as "Internet Cultural Heritage" by UNESCO Korea Committee. Despite its extensive nationwide coverage, Neolook provides no API, requiring web scraping for data extraction. ArtBava and Art in Culture similarly lack programmatic access, with ArtBava implementing restrictive robots.txt policies.

The Galleries Association of Korea, founded in 1976 with approximately 170 member galleries, hosts the Korea International Art Fair (KIAF) but provides no unified data access system. Government resources through Korea Public Data Portal and Seoul Open Data Plaza offer limited cultural facility information but minimal exhibition-specific data.

### Implementation strategy for Korean galleries

```python
import requests
from bs4 import BeautifulSoup
import time
import json

class KoreanGalleryScraper:
    def __init__(self):
        self.galleries = {
            'gallery_hyundai': 'https://www.galleryhyundai.com/',
            'kukje': 'https://www.kukjegallery.com/exhibition/list',
            'pkm': 'https://www.pkmgallery.com/',
            'arario': 'https://www.arariogallery.com/exhibitions/',
            'neolook': 'https://neolook.com/archives'
        }
        
    def scrape_gallery(self, gallery_key, url):
        headers = {
            'User-Agent': 'Art Data Collector - contact@research-institute.org'
        }
        
        # Check robots.txt compliance
        if not self.check_robots_allowed(url):
            print(f"Scraping not allowed for {gallery_key}")
            return None
            
        response = requests.get(url, headers=headers)
        time.sleep(2)  # Respect rate limits
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            return self.extract_exhibitions(soup, gallery_key)
        return None
```

## International museum APIs provide robust infrastructure

Public museums offer the most comprehensive API access for exhibition data. The **Metropolitan Museum of Art** leads with a completely open API requiring no authentication, supporting 80 requests per second, and providing access to 470,000+ artworks. The **Smithsonian Institution** offers 11+ million metadata records through GitHub and EDAN API system, though requiring free API key registration.

European institutions show varied approaches. **Rijksmuseum** provides excellent API access with 800,000+ objects supporting multiple metadata standards (OAI-PMH, LIDO, Dublin Core). **Paris Musées** unifies 14 municipal museums with 280,000+ work descriptions through a single API. The **Europeana** platform aggregates 50+ million objects from 4,000+ institutions across Europe.

Asian museums primarily offer database access rather than REST APIs. Japan's **ColBase system** integrates four national museums with multilingual support but no programmatic API. The landscape reveals strong US leadership in API development, mixed European approaches, and limited Asian API availability.

### Museum API implementation examples

```python
# Metropolitan Museum API - No authentication required
def fetch_met_exhibitions():
    base_url = "https://collectionapi.metmuseum.org/public/collection/v1"
    
    # Search for objects on view
    search_url = f"{base_url}/search?hasImages=true&isOnView=true&q=exhibition"
    response = requests.get(search_url)
    
    if response.status_code == 200:
        object_ids = response.json()['objectIDs'][:100]  # Limit to 100
        
        exhibitions = []
        for obj_id in object_ids:
            obj_response = requests.get(f"{base_url}/objects/{obj_id}")
            if obj_response.status_code == 200:
                exhibitions.append(obj_response.json())
                
        return exhibitions
    return []

# Rijksmuseum API - Requires API key
class RijksmuseumAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://www.rijksmuseum.nl/api"
        
    def search_exhibitions(self, query="exhibition"):
        params = {
            'key': self.api_key,
            'q': query,
            'format': 'json',
            'culture': 'en'
        }
        
        response = requests.get(f"{self.base_url}/en/collection", params=params)
        return response.json() if response.status_code == 200 else None
```

## Private galleries and platforms offer minimal data access

The commercial gallery sector provides virtually no public API access. **Gagosian, Pace Gallery, David Zwirner, Hauser & Wirth** - none offer developer programs or structured data exports despite their global presence. This closed ecosystem extends to major art fairs like Art Basel, Frieze, and TEFAF.

Most critically, **Artsy's public API retires July 28, 2025**, eliminating the primary commercial gallery data source. The API currently offers HAL+JSON format for educational use only, with partner API restricted to Artsy gallery members. This imminent closure necessitates immediate transition planning.

Alternative platforms show similar limitations. **Artnet** offers subscription-based price databases without developer access. **Google Arts & Culture** aggregates content from 2,000+ institutions but provides no extraction API - only one-way data submission for partners. **Ocula** operates as an invitation-only platform for 220+ galleries with membership starting at $245/month but no API access.

### Transitioning from Artsy API

```python
import datetime
from typing import List, Dict

class ArtsyMigrationStrategy:
    def __init__(self):
        self.sunset_date = datetime.datetime(2025, 7, 28)
        self.days_remaining = (self.sunset_date - datetime.datetime.now()).days
        
    def export_artsy_data(self, xapp_token: str) -> List[Dict]:
        """Emergency export before API sunset"""
        if self.days_remaining <= 0:
            raise Exception("Artsy API has been retired")
            
        headers = {'X-Xapp-Token': xapp_token}
        base_url = "https://api.artsy.net/api"
        
        # Export critical data before sunset
        data_to_export = []
        
        # Get artist data
        artists_response = requests.get(
            f"{base_url}/artists",
            headers=headers
        )
        
        if artists_response.status_code == 200:
            data_to_export.append({
                'type': 'artists',
                'data': artists_response.json(),
                'exported_at': datetime.datetime.now().isoformat()
            })
            
        print(f"WARNING: {self.days_remaining} days until Artsy API sunset")
        return data_to_export
```

## Integrated exhibition platforms analysis

Research reveals limited options for consolidated exhibition data access. With Artsy's retirement, focus shifts to museum APIs and web scraping. **Art Institute of Chicago** provides excellent exhibition endpoints with no authentication required. **Harvard Art Museums** offers comprehensive API including exhibitions, requiring free registration with 2,500 daily requests.

Specialized services like **ArtPI** offer AI-powered similarity matching but focus on image analysis rather than exhibition data. The fragmented landscape necessitates hybrid approaches combining multiple sources.

### Unified platform integration

```python
class UnifiedExhibitionAPI:
    def __init__(self):
        self.sources = {
            'met': MetMuseumAPI(),
            'harvard': HarvardMuseumsAPI(api_key="YOUR_KEY"),
            'chicago': ChicagoArtAPI(),
            'rijksmuseum': RijksmuseumAPI(api_key="YOUR_KEY")
        }
        
    def search_all_sources(self, query: str) -> Dict[str, List]:
        results = {}
        
        for source_name, api in self.sources.items():
            try:
                results[source_name] = api.search_exhibitions(query)
            except Exception as e:
                print(f"Error searching {source_name}: {e}")
                results[source_name] = []
                
        return results
        
    def normalize_results(self, raw_results: Dict) -> List[Dict]:
        """Convert different API formats to unified schema"""
        normalized = []
        
        for source, items in raw_results.items():
            for item in items:
                normalized.append(self.normalize_item(item, source))
                
        return normalized
```

## Web scraping implementation for non-API sources

When APIs are unavailable, ethical web scraping becomes essential. **Scrapy** excels for large-scale gallery crawling with built-in middleware and concurrent request handling. **Playwright** provides superior cross-browser support for JavaScript-heavy sites, while **BeautifulSoup** remains ideal for static HTML parsing.

Legal compliance requires strict adherence to robots.txt, implementation of rate limiting (minimum 1-second delays), and proper user-agent identification. European GDPR regulations mandate careful handling of personal data, while copyright laws generally permit factual data collection (dates, venues) but restrict creative content scraping.

### Production-ready gallery scraper

```python
import urllib.robotparser
from dataclasses import dataclass
from typing import Optional, List
import logging

@dataclass
class Exhibition:
    title: Optional[str] = None
    artist: Optional[str] = None
    venue: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    image_urls: List[str] = field(default_factory=list)

class EthicalGalleryScraper:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = self._create_session()
        self.robots_parser = self._setup_robots_parser()
        
    def _setup_robots_parser(self):
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(urljoin(self.base_url, '/robots.txt'))
        rp.read()
        return rp
        
    def can_fetch(self, url: str) -> bool:
        return self.robots_parser.can_fetch('*', url)
        
    def extract_exhibition_data(self, soup: BeautifulSoup) -> List[Exhibition]:
        exhibitions = []
        
        # Try multiple selectors for different gallery systems
        selectors = [
            '.exhibition-item',
            '[itemtype*="Event"]',
            '.show-listing'
        ]
        
        for selector in selectors:
            items = soup.select(selector)
            if items:
                for item in items:
                    exhibition = self._extract_single_exhibition(item)
                    if exhibition.title:
                        exhibitions.append(exhibition)
                break
                
        return exhibitions
```

## Data integration and normalization architecture

Successful exhibition database construction requires sophisticated data integration strategies. The recommended approach uses **PostgreSQL with JSONB support** for flexible schema evolution while maintaining query performance. This enables storage of multilingual content and varying metadata structures from different sources.

The unified exhibition schema accommodates multiple languages through nested JSON structures, supports LIDO and CIDOC-CRM standards for museum interoperability, and includes comprehensive venue and artist relationships. Deduplication relies on fuzzy matching algorithms combining title similarity, venue matching, and date overlap detection.

### Comprehensive schema implementation

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": {"type": "string"},
    "title": {
      "type": "object",
      "properties": {
        "original": {"type": "string"},
        "original_language": {"type": "string"},
        "translations": {
          "type": "object",
          "patternProperties": {
            "^[a-z]{2}$": {"type": "string"}
          }
        }
      }
    },
    "dates": {
      "type": "object",
      "properties": {
        "startDate": {"type": "string", "format": "date-time"},
        "endDate": {"type": "string", "format": "date-time"},
        "timezone": {"type": "string"}
      }
    },
    "venue": {
      "type": "object",
      "properties": {
        "id": {"type": "string"},
        "name": {"type": "string"},
        "location": {
          "type": "object",
          "properties": {
            "address": {"type": "object"},
            "coordinates": {
              "type": "object",
              "properties": {
                "lat": {"type": "number"},
                "lng": {"type": "number"}
              }
            }
          }
        }
      }
    }
  }
}
```

### ETL pipeline with deduplication

```python
from fuzzywuzzy import fuzz
import pandas as pd

class ExhibitionETLPipeline:
    def __init__(self, db_connection):
        self.db = db_connection
        self.dedup_threshold = 85
        
    def process_exhibition_batch(self, exhibitions: List[Dict]) -> List[Dict]:
        # Extract
        normalized = self.normalize_exhibitions(exhibitions)
        
        # Transform - includes deduplication
        deduplicated = self.deduplicate_exhibitions(normalized)
        
        # Validate
        validated = self.validate_exhibitions(deduplicated)
        
        # Load
        self.load_to_database(validated)
        
        return validated
        
    def deduplicate_exhibitions(self, exhibitions: List[Dict]) -> List[Dict]:
        df = pd.DataFrame(exhibitions)
        duplicates = []
        
        for i, row in df.iterrows():
            for j, other in df.iloc[i+1:].iterrows():
                # Fuzzy match on title
                title_score = fuzz.ratio(
                    row['title']['original'], 
                    other['title']['original']
                )
                
                # Check venue match
                venue_match = row['venue']['id'] == other['venue']['id']
                
                # Check date overlap
                date_overlap = self.check_date_overlap(
                    row['dates'], other['dates']
                )
                
                if title_score > self.dedup_threshold and venue_match and date_overlap:
                    duplicates.append(j)
                    
        # Remove duplicates
        df = df.drop(duplicates)
        return df.to_dict('records')
```

### Multilingual processing system

```python
from langdetect import detect
from googletrans import Translator

class MultilingualProcessor:
    def __init__(self):
        self.translator = Translator()
        self.target_languages = ['ko', 'en', 'ja', 'zh']
        
    def process_exhibition(self, exhibition: Dict) -> Dict:
        # Detect original language
        original_text = exhibition.get('title', '')
        original_lang = detect(original_text)
        
        # Generate translations
        translations = {}
        for lang in self.target_languages:
            if lang != original_lang:
                translations[lang] = self.translator.translate(
                    original_text, 
                    src=original_lang, 
                    dest=lang
                ).text
                
        exhibition['title'] = {
            'original': original_text,
            'original_language': original_lang,
            'translations': translations
        }
        
        return exhibition
```

## Implementation roadmap and recommendations

The fragmented nature of gallery and museum data sources necessitates a phased implementation approach. **Phase 1** focuses on establishing robust web scraping infrastructure for Korean galleries while maximizing museum API utilization. **Phase 2** implements comprehensive deduplication and multilingual processing. **Phase 3** adds media handling with copyright compliance. **Phase 4** optimizes performance and adds advanced search capabilities.

Critical immediate actions include migrating away from Artsy API before the July 28 deadline, establishing partnerships with Korean galleries for potential data sharing agreements, and implementing comprehensive monitoring for web scraping operations. Long-term success requires contributing to open cultural data initiatives while maintaining ethical data collection practices.

This research reveals that while commercial galleries remain largely closed to programmatic access, combining museum APIs with ethical web scraping provides a viable path to comprehensive exhibition data collection. The key lies in building flexible, scalable infrastructure that can adapt to changing data sources while maintaining data quality and legal compliance.