#!/usr/bin/env python3
"""
SAYU Wikipedia 아티스트 정보 수집기
Python Wikipedia-API를 활용한 정밀한 아티스트 데이터 수집

설치 방법:
pip install wikipedia-api requests psycopg2-binary openai

사용법:
python wikipediaArtistCollector.py --artist "Pablo Picasso"
python wikipediaArtistCollector.py --batch artists_list.txt
"""

import wikipediaapi
import requests
import json
import re
import sys
import argparse
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import openai
import os
from dataclasses import dataclass

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('artist_collection.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class ArtistInfo:
    """아티스트 정보 데이터 클래스"""
    name: str
    name_ko: Optional[str] = None
    birth_year: Optional[int] = None
    death_year: Optional[int] = None
    birth_date: Optional[str] = None
    death_date: Optional[str] = None
    nationality: Optional[str] = None
    nationality_ko: Optional[str] = None
    biography: Optional[str] = None
    biography_ko: Optional[str] = None
    art_movement: Optional[str] = None
    birth_place: Optional[str] = None
    death_place: Optional[str] = None
    education: Optional[List[str]] = None
    notable_works: Optional[List[str]] = None
    awards: Optional[List[str]] = None
    influences: Optional[List[str]] = None
    influenced: Optional[List[str]] = None
    spouse: Optional[str] = None
    image_url: Optional[str] = None
    wikipedia_url: Optional[str] = None
    wikidata_id: Optional[str] = None
    categories: Optional[List[str]] = None
    references: Optional[List[str]] = None
    
class WikipediaArtistCollector:
    """Wikipedia API를 활용한 정밀 아티스트 정보 수집기"""
    
    def __init__(self):
        # Wikipedia API 설정 (다국어 지원)
        self.wiki_en = wikipediaapi.Wikipedia(
            language='en',
            extract_format=wikipediaapi.ExtractFormat.WIKI,
            user_agent='SAYU-ArtCollector/1.0 (https://sayu.life) Data Collection Bot'
        )
        
        self.wiki_ko = wikipediaapi.Wikipedia(
            language='ko',
            extract_format=wikipediaapi.ExtractFormat.WIKI,
            user_agent='SAYU-ArtCollector/1.0 (https://sayu.life) Data Collection Bot'
        )
        
        # OpenAI 설정
        if os.getenv('OPENAI_API_KEY'):
            openai.api_key = os.getenv('OPENAI_API_KEY')
        
        # 데이터베이스 연결
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', 5432),
            'database': os.getenv('DB_NAME', 'sayu'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', '')
        }
        
        # 예술 관련 키워드 (정확도 향상용)
        self.art_keywords = [
            'painter', 'artist', 'sculptor', 'photographer', 'printmaker',
            'conceptual artist', 'installation artist', 'performance artist',
            'ceramic artist', 'textile artist', 'video artist', 'digital artist'
        ]
        
        # 예술 사조 매핑
        self.art_movements = {
            'impressionism': '인상주의',
            'expressionism': '표현주의', 
            'cubism': '입체주의',
            'surrealism': '초현실주의',
            'abstract expressionism': '추상표현주의',
            'pop art': '팝아트',
            'minimalism': '미니멀리즘',
            'conceptual art': '개념미술',
            'dadaism': '다다이즘',
            'fauvism': '야수주의',
            'futurism': '미래주의',
            'constructivism': '구성주의'
        }

    def search_artist(self, artist_name: str) -> Optional[ArtistInfo]:
        """
        아티스트 이름으로 Wikipedia 검색 및 정보 수집
        """
        logger.info(f"🎨 Wikipedia에서 '{artist_name}' 검색 시작")
        
        try:
            # 1. 영문 Wikipedia 검색
            en_page = self.wiki_en.page(artist_name)
            
            if not en_page.exists():
                # 검색어 변형 시도
                search_results = self.search_variations(artist_name)
                if search_results:
                    en_page = self.wiki_en.page(search_results[0])
                else:
                    logger.warning(f"영문 Wikipedia에서 '{artist_name}' 찾을 수 없음")
                    return None
            
            # 아티스트 여부 확인
            if not self.is_artist_page(en_page):
                logger.warning(f"'{artist_name}'은(는) 아티스트가 아닌 것으로 판단됨")
                return None
            
            # 2. 기본 정보 추출
            artist_info = self.extract_basic_info(en_page)
            
            # 3. 한국어 Wikipedia 검색
            ko_info = self.search_korean_wikipedia(artist_name, artist_info)
            if ko_info:
                artist_info = self.merge_korean_info(artist_info, ko_info)
            
            # 4. Wikidata 정보 추가
            wikidata_info = self.fetch_wikidata_info(artist_info.wikidata_id)
            if wikidata_info:
                artist_info = self.merge_wikidata_info(artist_info, wikidata_info)
            
            # 5. 이미지 정보 수집
            artist_info.image_url = self.extract_main_image(en_page)
            
            # 6. 카테고리 정보 추출
            artist_info.categories = self.extract_categories(en_page)
            
            # 7. 참고 문헌 추출
            artist_info.references = self.extract_references(en_page)
            
            logger.info(f"✅ '{artist_name}' 정보 수집 완료")
            return artist_info
            
        except Exception as e:
            logger.error(f"❌ '{artist_name}' 정보 수집 실패: {str(e)}")
            return None
    
    def is_artist_page(self, page) -> bool:
        """
        페이지가 아티스트 관련인지 확인
        """
        content = page.text.lower()
        categories = [cat.lower() for cat in page.categories.keys()]
        
        # 아티스트 키워드 확인
        for keyword in self.art_keywords:
            if keyword in content[:1000]:  # 첫 1000자에서 확인
                return True
        
        # 카테고리에서 확인
        artist_categories = [
            'artists', 'painters', 'sculptors', 'photographers',
            'american artists', 'french artists', 'british artists',
            'contemporary artists', 'modern artists'
        ]
        
        for cat in categories:
            for art_cat in artist_categories:
                if art_cat in cat:
                    return True
        
        return False
    
    def extract_basic_info(self, page) -> ArtistInfo:
        """
        Wikipedia 페이지에서 기본 정보 추출
        """
        content = page.text
        
        artist_info = ArtistInfo(
            name=page.title,
            wikipedia_url=page.fullurl,
            biography=content[:2000] if len(content) > 2000 else content  # 처음 2000자
        )
        
        # 생몰년도 추출
        birth_death = self.extract_birth_death_dates(content)
        artist_info.birth_year = birth_death.get('birth_year')
        artist_info.death_year = birth_death.get('death_year')
        artist_info.birth_date = birth_death.get('birth_date')
        artist_info.death_date = birth_death.get('death_date')
        
        # 국적 추출
        artist_info.nationality = self.extract_nationality(content)
        
        # 출생지 추출
        artist_info.birth_place = self.extract_birth_place(content)
        
        # 예술 사조 추출
        artist_info.art_movement = self.extract_art_movement(content)
        
        # 주요 작품 추출
        artist_info.notable_works = self.extract_notable_works(content)
        
        # Wikidata ID 추출
        artist_info.wikidata_id = self.extract_wikidata_id(page)
        
        return artist_info
    
    def extract_birth_death_dates(self, content: str) -> Dict[str, Any]:
        """
        생몰년도 정밀 추출
        """
        result = {}
        
        # 다양한 날짜 패턴
        patterns = [
            # (1881-1973)
            r'\((\d{4})[–-](\d{4})\)',
            # born 1881, died 1973
            r'born\s+(\d{4}).*?died\s+(\d{4})',
            # 1881–1973
            r'(\d{4})[–-](\d{4})',
            # born on 25 October 1881
            r'born\s+(?:on\s+)?(\d{1,2}\s+\w+\s+\d{4})',
            # died 8 April 1973
            r'died\s+(\d{1,2}\s+\w+\s+\d{4})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                if len(match.groups()) == 2 and match.group(1).isdigit() and match.group(2).isdigit():
                    result['birth_year'] = int(match.group(1))
                    result['death_year'] = int(match.group(2))
                    break
        
        # 개별 날짜 패턴
        birth_match = re.search(r'born\s+(?:on\s+)?([^,\n]+)', content[:1000], re.IGNORECASE)
        if birth_match:
            result['birth_date'] = birth_match.group(1).strip()
            
        death_match = re.search(r'died\s+([^,\n]+)', content[:1000], re.IGNORECASE)
        if death_match:
            result['death_date'] = death_match.group(1).strip()
        
        return result
    
    def extract_nationality(self, content: str) -> Optional[str]:
        """
        국적 추출
        """
        patterns = [
            r'(\w+)\s+(?:painter|artist|sculptor|photographer)',
            r'was\s+a\s+(\w+)',
            r'born\s+in\s+([^,\n]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, content[:500], re.IGNORECASE)
            if match:
                nationality = match.group(1).strip()
                # 유명한 국적들 확인
                known_nationalities = [
                    'American', 'French', 'Spanish', 'Italian', 'German', 
                    'British', 'Dutch', 'Russian', 'Japanese', 'Korean',
                    'Chinese', 'Mexican', 'Brazilian', 'Indian'
                ]
                if nationality in known_nationalities:
                    return nationality
        
        return None
    
    def extract_birth_place(self, content: str) -> Optional[str]:
        """
        출생지 추출
        """
        pattern = r'born\s+(?:in\s+)?([^,\n\(]+)'
        match = re.search(pattern, content[:1000], re.IGNORECASE)
        if match:
            return match.group(1).strip()
        return None
    
    def extract_art_movement(self, content: str) -> Optional[str]:
        """
        예술 사조 추출
        """
        content_lower = content.lower()
        
        for movement, korean in self.art_movements.items():
            if movement in content_lower:
                return movement.title()
        
        return None
    
    def extract_notable_works(self, content: str) -> List[str]:
        """
        주요 작품 추출
        """
        works = []
        
        # "Notable works" 섹션 찾기
        notable_section = re.search(
            r'(?:notable works?|major works?|famous works?)[:\n](.*?)(?:\n\n|\n[A-Z])', 
            content, 
            re.IGNORECASE | re.DOTALL
        )
        
        if notable_section:
            section_text = notable_section.group(1)
            # 작품명 패턴 (따옴표나 이탤릭체)
            work_patterns = [
                r'"([^"]+)"',
                r"'([^']+)'",
                r'\*([^*]+)\*',
                r'_([^_]+)_'
            ]
            
            for pattern in work_patterns:
                matches = re.findall(pattern, section_text)
                works.extend(matches)
        
        return works[:10]  # 최대 10개
    
    def extract_wikidata_id(self, page) -> Optional[str]:
        """
        Wikidata ID 추출
        """
        try:
            # Wikipedia API를 통해 Wikidata ID 가져오기
            api_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{page.title}"
            response = requests.get(api_url)
            if response.status_code == 200:
                data = response.json()
                wikibase_item = data.get('wikibase_item')
                if wikibase_item:
                    return wikibase_item
        except Exception as e:
            logger.warning(f"Wikidata ID 추출 실패: {e}")
        
        return None
    
    def extract_main_image(self, page) -> Optional[str]:
        """
        메인 이미지 URL 추출
        """
        try:
            # Wikipedia API를 통해 이미지 정보 가져오기
            api_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{page.title}"
            response = requests.get(api_url)
            if response.status_code == 200:
                data = response.json()
                thumbnail = data.get('thumbnail', {})
                if thumbnail:
                    return thumbnail.get('source')
        except Exception as e:
            logger.warning(f"이미지 추출 실패: {e}")
        
        return None
    
    def extract_categories(self, page) -> List[str]:
        """
        Wikipedia 카테고리 추출
        """
        try:
            categories = list(page.categories.keys())
            # 아티스트 관련 카테고리만 필터링
            art_related = []
            for cat in categories:
                cat_lower = cat.lower()
                if any(keyword in cat_lower for keyword in ['artist', 'painter', 'sculptor', 'art']):
                    art_related.append(cat)
            return art_related[:20]  # 최대 20개
        except Exception as e:
            logger.warning(f"카테고리 추출 실패: {e}")
            return []
    
    def extract_references(self, page) -> List[str]:
        """
        참고 문헌 추출
        """
        try:
            # 간단한 링크 추출
            links = list(page.links.keys())[:10]  # 처음 10개 링크
            return links
        except Exception as e:
            logger.warning(f"참고 문헌 추출 실패: {e}")
            return []
    
    def search_korean_wikipedia(self, artist_name: str, artist_info: ArtistInfo) -> Optional[Dict]:
        """
        한국어 Wikipedia 검색
        """
        try:
            # 영문명으로 한국어 페이지 검색
            ko_page = self.wiki_ko.page(artist_name)
            
            if ko_page.exists():
                return {
                    'name_ko': ko_page.title,
                    'biography_ko': ko_page.text[:1000] if ko_page.text else None
                }
            
            # 번역된 이름으로 검색 (OpenAI 활용)
            if os.getenv('OPENAI_API_KEY'):
                translated_name = self.translate_artist_name(artist_name)
                if translated_name:
                    ko_page = self.wiki_ko.page(translated_name)
                    if ko_page.exists():
                        return {
                            'name_ko': ko_page.title,
                            'biography_ko': ko_page.text[:1000] if ko_page.text else None
                        }
        
        except Exception as e:
            logger.warning(f"한국어 Wikipedia 검색 실패: {e}")
        
        return None
    
    def translate_artist_name(self, name: str) -> Optional[str]:
        """
        OpenAI를 사용한 아티스트 이름 번역
        """
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system", 
                        "content": "당신은 예술가 이름을 한국어로 번역하는 전문가입니다. 아티스트 이름만 한국어로 번역해서 답변해주세요."
                    },
                    {
                        "role": "user", 
                        "content": f"다음 아티스트 이름을 한국어로 번역해주세요: {name}"
                    }
                ],
                max_tokens=50,
                temperature=0.1
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.warning(f"이름 번역 실패: {e}")
            return None
    
    def merge_korean_info(self, artist_info: ArtistInfo, ko_info: Dict) -> ArtistInfo:
        """
        한국어 정보 병합
        """
        if ko_info.get('name_ko'):
            artist_info.name_ko = ko_info['name_ko']
        if ko_info.get('biography_ko'):
            artist_info.biography_ko = ko_info['biography_ko']
        
        return artist_info
    
    def fetch_wikidata_info(self, wikidata_id: str) -> Optional[Dict]:
        """
        Wikidata에서 추가 정보 수집
        """
        if not wikidata_id:
            return None
        
        try:
            query = f"""
            SELECT ?item ?itemLabel ?birthDate ?deathDate ?nationalityLabel ?occupationLabel ?educatedAtLabel WHERE {{
              BIND(wd:{wikidata_id} AS ?item)
              OPTIONAL {{ ?item wdt:P569 ?birthDate. }}
              OPTIONAL {{ ?item wdt:P570 ?deathDate. }}
              OPTIONAL {{ ?item wdt:P27 ?nationality. }}
              OPTIONAL {{ ?item wdt:P106 ?occupation. }}
              OPTIONAL {{ ?item wdt:P69 ?educatedAt. }}
              SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
            }}
            """
            
            url = "https://query.wikidata.org/sparql"
            response = requests.get(url, params={
                'query': query,
                'format': 'json'
            }, headers={
                'User-Agent': 'SAYU-ArtCollector/1.0'
            })
            
            if response.status_code == 200:
                data = response.json()
                bindings = data.get('results', {}).get('bindings', [])
                if bindings:
                    return bindings[0]
            
        except Exception as e:
            logger.warning(f"Wikidata 정보 수집 실패: {e}")
        
        return None
    
    def merge_wikidata_info(self, artist_info: ArtistInfo, wikidata_info: Dict) -> ArtistInfo:
        """
        Wikidata 정보 병합
        """
        # 더 정확한 날짜 정보가 있으면 업데이트
        if 'birthDate' in wikidata_info and wikidata_info['birthDate']['value']:
            birth_date = wikidata_info['birthDate']['value']
            artist_info.birth_date = birth_date
            if not artist_info.birth_year:
                artist_info.birth_year = int(birth_date[:4])
        
        if 'deathDate' in wikidata_info and wikidata_info['deathDate']['value']:
            death_date = wikidata_info['deathDate']['value']
            artist_info.death_date = death_date
            if not artist_info.death_year:
                artist_info.death_year = int(death_date[:4])
        
        # 교육 기관 정보
        if 'educatedAtLabel' in wikidata_info:
            if not artist_info.education:
                artist_info.education = []
            artist_info.education.append(wikidata_info['educatedAtLabel']['value'])
        
        return artist_info
    
    def search_variations(self, artist_name: str) -> List[str]:
        """
        아티스트 이름 변형 검색
        """
        try:
            api_url = "https://en.wikipedia.org/api/rest_v1/page/search"
            response = requests.get(api_url, params={
                'q': artist_name,
                'limit': 5
            })
            
            if response.status_code == 200:
                data = response.json()
                pages = data.get('pages', [])
                return [page['title'] for page in pages]
                
        except Exception as e:
            logger.warning(f"검색 변형 실패: {e}")
        
        return []
    
    def save_to_database(self, artist_info: ArtistInfo) -> bool:
        """
        데이터베이스에 아티스트 정보 저장
        """
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            # 중복 확인
            cursor.execute(
                "SELECT id FROM artists WHERE LOWER(name) = LOWER(%s)",
                (artist_info.name,)
            )
            
            existing = cursor.fetchone()
            
            if existing:
                # 업데이트
                update_query = """
                UPDATE artists SET
                    name_ko = COALESCE(%s, name_ko),
                    birth_year = COALESCE(%s, birth_year),
                    death_year = COALESCE(%s, death_year),
                    nationality = COALESCE(%s, nationality),
                    nationality_ko = COALESCE(%s, nationality_ko),
                    bio = COALESCE(%s, bio),
                    bio_ko = COALESCE(%s, bio_ko),
                    era = COALESCE(%s, era),
                    images = COALESCE(%s, images),
                    sources = COALESCE(%s, sources),
                    official_links = COALESCE(%s, official_links),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id
                """
                
                cursor.execute(update_query, (
                    artist_info.name_ko,
                    artist_info.birth_year,
                    artist_info.death_year,
                    artist_info.nationality,
                    artist_info.nationality_ko,
                    artist_info.biography,
                    artist_info.biography_ko,
                    self.classify_era(artist_info.birth_year, artist_info.death_year),
                    json.dumps({'portrait': artist_info.image_url} if artist_info.image_url else {}),
                    json.dumps({
                        'wikipedia': 'collected',
                        'wikidata': artist_info.wikidata_id
                    }),
                    json.dumps({'wikipedia': artist_info.wikipedia_url} if artist_info.wikipedia_url else {}),
                    existing['id']
                ))
                
                logger.info(f"✅ 아티스트 정보 업데이트: {artist_info.name}")
                
            else:
                # 새로 삽입
                insert_query = """
                INSERT INTO artists (
                    name, name_ko, birth_year, death_year, nationality, nationality_ko,
                    bio, bio_ko, copyright_status, era, images, sources, official_links,
                    is_featured
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """
                
                cursor.execute(insert_query, (
                    artist_info.name,
                    artist_info.name_ko,
                    artist_info.birth_year,
                    artist_info.death_year,
                    artist_info.nationality,
                    artist_info.nationality_ko,
                    artist_info.biography,
                    artist_info.biography_ko,
                    self.determine_copyright_status(artist_info),
                    self.classify_era(artist_info.birth_year, artist_info.death_year),
                    json.dumps({'portrait': artist_info.image_url} if artist_info.image_url else {}),
                    json.dumps({
                        'wikipedia': 'collected',
                        'wikidata': artist_info.wikidata_id
                    }),
                    json.dumps({'wikipedia': artist_info.wikipedia_url} if artist_info.wikipedia_url else {}),
                    len(artist_info.notable_works or []) > 5  # 유명 작품이 많으면 featured
                ))
                
                logger.info(f"✅ 새 아티스트 정보 저장: {artist_info.name}")
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True
            
        except Exception as e:
            logger.error(f"❌ DB 저장 실패: {e}")
            return False
    
    def classify_era(self, birth_year: int, death_year: int) -> str:
        """시대 분류"""
        if not birth_year:
            return 'Contemporary'
        
        active_year = death_year or datetime.now().year
        
        if active_year < 1400:
            return 'Medieval'
        elif active_year < 1600:
            return 'Renaissance'
        elif active_year < 1750:
            return 'Baroque'
        elif active_year < 1850:
            return 'Neoclassicism'
        elif active_year < 1900:
            return 'Impressionism'
        elif active_year < 1945:
            return 'Modern'
        elif active_year < 1980:
            return 'Postmodern'
        else:
            return 'Contemporary'
    
    def determine_copyright_status(self, artist_info: ArtistInfo) -> str:
        """저작권 상태 판단"""
        current_year = datetime.now().year
        
        if artist_info.death_year:
            years_since_death = current_year - artist_info.death_year
            if years_since_death >= 70:
                return 'public_domain'
            elif years_since_death >= 50:
                return 'transitional'
            else:
                return 'licensed'
        elif artist_info.birth_year:
            age = current_year - artist_info.birth_year
            if age > 150:
                return 'public_domain'
            else:
                return 'contemporary'
        
        return 'unknown'
    
    def process_batch(self, artist_names: List[str]) -> Dict[str, Any]:
        """
        배치로 여러 아티스트 처리
        """
        results = {
            'successful': [],
            'failed': [],
            'total': len(artist_names)
        }
        
        logger.info(f"📦 배치 처리 시작: {len(artist_names)}명의 아티스트")
        
        for i, name in enumerate(artist_names, 1):
            logger.info(f"🎨 처리 중 [{i}/{len(artist_names)}]: {name}")
            
            try:
                artist_info = self.search_artist(name)
                if artist_info:
                    if self.save_to_database(artist_info):
                        results['successful'].append({
                            'name': name,
                            'info': artist_info
                        })
                    else:
                        results['failed'].append({
                            'name': name,
                            'error': 'Database save failed'
                        })
                else:
                    results['failed'].append({
                        'name': name,
                        'error': 'Artist not found or not valid'
                    })
                    
            except Exception as e:
                results['failed'].append({
                    'name': name,
                    'error': str(e)
                })
            
            # API 율한 제한 고려한 지연
            import time
            time.sleep(1)
        
        logger.info(f"📦 배치 처리 완료: 성공 {len(results['successful'])}, 실패 {len(results['failed'])}")
        return results

def main():
    """메인 실행 함수"""
    parser = argparse.ArgumentParser(description='SAYU Wikipedia 아티스트 정보 수집기')
    parser.add_argument('--artist', '-a', help='단일 아티스트 이름')
    parser.add_argument('--batch', '-b', help='아티스트 목록 파일 경로')
    parser.add_argument('--output', '-o', help='결과 저장 파일 (JSON)', default='artist_results.json')
    
    args = parser.parse_args()
    
    collector = WikipediaArtistCollector()
    
    if args.artist:
        # 단일 아티스트 처리
        artist_info = collector.search_artist(args.artist)
        if artist_info:
            if collector.save_to_database(artist_info):
                print(f"✅ '{args.artist}' 정보 수집 및 저장 완료")
            else:
                print(f"❌ '{args.artist}' DB 저장 실패")
        else:
            print(f"❌ '{args.artist}' 정보 수집 실패")
    
    elif args.batch:
        # 배치 처리
        try:
            with open(args.batch, 'r', encoding='utf-8') as f:
                artist_names = [line.strip() for line in f if line.strip()]
            
            results = collector.process_batch(artist_names)
            
            # 결과 저장
            with open(args.output, 'w', encoding='utf-8') as f:
                # JSON serializable 형태로 변환
                serializable_results = {
                    'successful': [
                        {
                            'name': item['name'],
                            'info': {
                                'name': item['info'].name,
                                'birth_year': item['info'].birth_year,
                                'death_year': item['info'].death_year,
                                'nationality': item['info'].nationality,
                                'biography': item['info'].biography[:200] if item['info'].biography else None
                            }
                        } for item in results['successful']
                    ],
                    'failed': results['failed'],
                    'total': results['total'],
                    'success_rate': f"{len(results['successful'])/results['total']*100:.1f}%"
                }
                json.dump(serializable_results, f, ensure_ascii=False, indent=2)
            
            print(f"📊 결과가 {args.output}에 저장되었습니다")
            print(f"성공: {len(results['successful'])}, 실패: {len(results['failed'])}")
            
        except FileNotFoundError:
            print(f"❌ 파일을 찾을 수 없습니다: {args.batch}")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()