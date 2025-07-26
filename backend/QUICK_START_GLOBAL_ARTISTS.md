# 🎨 SAYU 글로벌 아티스트 컬렉션 빠른 시작 가이드

## 📋 개요
전 세계 A급 아티스트 100명의 정보를 자동으로 수집하여 SAYU 데이터베이스에 저장하는 시스템입니다.

## 🚀 빠른 시작 (5분 완료)

### 1단계: 환경 체크
```bash
cd backend
node check-environment.js
```

### 2단계: 우선순위 아티스트 수집 (20명)
```bash
node global-artists-collector.js priority
```

### 3단계: 실시간 모니터링
```bash
node artist-collection-monitor.js
```

## 🎯 선정된 글로벌 A급 아티스트 (100명)

### 🏛️ 서양 고전/근대 거장 (25명)
- Leonardo da Vinci, Michelangelo, Raphael
- Caravaggio, Rembrandt, Johannes Vermeer
- Francisco Goya, Eugène Delacroix
- Claude Monet, Vincent van Gogh, Paul Cézanne
- Edgar Degas, Pierre-Auguste Renoir
- Gustav Klimt, Egon Schiele
- 기타 서양 미술사 핵심 인물들

### 🎨 현대 서양 거장 (20명)
- Pablo Picasso, Henri Matisse, Wassily Kandinsky
- Salvador Dalí, René Magritte, Marcel Duchamp
- Jackson Pollock, Mark Rothko, Andy Warhol
- Roy Lichtenstein, David Hockney, Gerhard Richter
- 기타 20세기 아트 혁신가들

### 🌏 동양 대표 작가 (15명)
**중국**: Qi Baishi, Zhang Daqian, Ai Weiwei
**일본**: Katsushika Hokusai, Yayoi Kusama, Takashi Murakami
**한국**: Lee Ufan, Park Seo-bo, Kim Whanki, Paik Nam-june, Do Ho Suh

### 🌟 현대 글로벌 스타 (15명)
- Banksy, Damien Hirst, Jeff Koons, Kaws
- Kehinde Wiley, Kerry James Marshall
- Olafur Eliasson, Marina Abramović
- 기타 21세기 아트 스타들

### 👩‍🎨 여성 아티스트 강화 (15명)
- Frida Kahlo, Georgia O'Keeffe, Louise Bourgeois
- Artemisia Gentileschi, Mary Cassatt
- Agnes Martin, Helen Frankenthaler
- Cindy Sherman, Marlene Dumas
- 기타 여성 아티스트 거장들

### 🗿 조각/설치 전문가 (10명)
- Auguste Rodin, Constantin Brâncuși, Henry Moore
- Alberto Giacometti, Alexander Calder
- Richard Serra, Anish Kapoor, Antony Gormley

## 💻 상세 명령어

### 전체 수집 옵션
```bash
# 우선순위 아티스트만 (20명) - 추천
node global-artists-collector.js priority

# 특정 카테고리만
node global-artists-collector.js category classical
node global-artists-collector.js category asian_masters
node global-artists-collector.js category contemporary_global

# 전체 아티스트 (100명) - 시간 오래 걸림
node global-artists-collector.js all
```

### 모니터링 명령어
```bash
# 대화형 실시간 모니터링
node artist-collection-monitor.js

# 모니터링 대시보드 명령어
# [Enter] - 새로고침
# [s] - 상세 통계
# [c] - 수집 시작
# [q] - 종료
```

## 📊 수집되는 정보

### 기본 정보
- ✅ 아티스트 이름 (영문/한글)
- ✅ 출생/사망 연도
- ✅ 국적
- ✅ 시대 분류 (Renaissance, Modern, Contemporary 등)
- ✅ 예술 사조 (Impressionism, Cubism 등)

### 상세 정보
- ✅ 전기/약력 (Wikipedia)
- ✅ 대표 작품 목록 (Met Museum, Cleveland Museum)
- ✅ 초상화 이미지
- ✅ 공식 링크 (Wikipedia, 미술관)
- ✅ 저작권 상태 (퍼블릭 도메인/라이선스 필요)

### SAYU 특화 분석 (AI 기반)
- 🤖 **감정 시그니처** (512차원 벡터)
- 🦊 **16가지 성격 유형별 친화도**
  - wolf, fox, owl, dolphin, lion, elephant
  - rabbit, eagle, bear, cat, dog, horse
  - tiger, penguin, butterfly, turtle

## 🛠️ 기술 스택

### 데이터 소스
- **Wikipedia API** - 기본 정보, 전기
- **Wikidata SPARQL** - 구조화된 메타데이터
- **DBpedia** - 추가 관계형 정보
- **Met Museum API** - 대표 작품, 이미지
- **Cleveland Museum API** - 추가 작품 정보

### AI 분석
- **OpenAI GPT-4** - 감정 분석, 성격 매칭
- **감정 차원 분석** - 16개 기본 감정으로 시작하여 512차원으로 확장
- **성격 유형 매핑** - 작가 스타일과 SAYU 동물 캐릭터 연결

### 데이터 품질 관리
- ✅ 자동 중복 제거
- ✅ 누락 데이터 보완
- ✅ 저작권 상태 자동 판단
- ✅ 다중 소스 교차 검증

## 📈 예상 성과

### 수집 목표
- **총 아티스트**: 100명
- **성공률**: 90% 이상
- **평균 처리 시간**: 2-3초/아티스트
- **데이터 품질**: 80% 이상 완전한 프로필

### 지역별 분포 목표
- 🇺🇸 **미국**: 25%
- 🇫🇷 **프랑스**: 20%
- 🇩🇪 **독일**: 8%
- 🇬🇧 **영국**: 7%
- 🇯🇵 **일본**: 6%
- 🇰🇷 **한국**: 5%
- 🇨🇳 **중국**: 5%
- 🌍 **기타**: 24%

### 시대별 분포 목표
- **Renaissance** (14-16세기): 8%
- **Baroque** (17-18세기): 10%
- **Impressionism** (19세기): 15%
- **Modern** (1900-1945): 25%
- **Postmodern** (1945-1980): 20%
- **Contemporary** (1980-현재): 22%

## ⚠️ 주의사항

### API 율한 제한
- **Wikipedia**: 무제한 (단, 예의상 2초 간격)
- **Met Museum**: 무제한 (단, 안정성을 위해 1초 간격)
- **Cleveland Museum**: 무제한
- **OpenAI**: 사용량에 따른 과금

### 데이터 저작권
- ✅ **퍼블릭 도메인**: 자유 사용 가능
- ⚖️ **라이선스 필요**: 상업적 사용 시 확인 필요
- 🎨 **현대 작가**: 저작권 존재, 교육/연구 목적 사용

### 시스템 요구사항
- **메모리**: 최소 2GB 사용 가능
- **네트워크**: 안정적인 인터넷 연결
- **시간**: 전체 수집 시 1-2시간 소요

## 🆘 문제 해결

### 일반적인 오류
```bash
# 환경 변수 누락
echo "DATABASE_URL이 설정되지 않았습니다."
# 해결: .env 파일에 DATABASE_URL 추가

# 네트워크 연결 오류
echo "Wikipedia API 접근 실패"
# 해결: 인터넷 연결 확인, 방화벽 설정 확인

# OpenAI API 키 오류
echo "OpenAI API 키가 유효하지 않습니다."
# 해결: OPENAI_API_KEY 환경 변수 확인
```

### 로그 확인
```bash
# 실시간 로그 확인
tail -f logs/artist-collection.log

# 오류 로그만 확인
grep "ERROR" logs/artist-collection.log
```

## 📞 지원

### 즉시 도움말
```bash
# 환경 체크
node check-environment.js

# 현재 DB 상태 확인
node artist-collection-monitor.js

# 특정 아티스트 수집 테스트
node -e "
const service = require('./src/services/enhancedArtistCollectorService');
service.collectArtistInfo('Pablo Picasso').then(console.log);
"
```

### 고급 설정
```bash
# 수집 속도 조절 (기본 2초 → 5초)
node global-artists-collector.js all --delay=5000

# 기존 데이터 강제 업데이트
node global-artists-collector.js priority --force-update

# 특정 카테고리만 업데이트
node global-artists-collector.js category female_artists --force-update
```

---

🎨 **SAYU와 함께 전 세계 예술의 보고를 만들어나가세요!**

각 아티스트는 단순한 데이터가 아닌, 사용자와 예술을 연결하는 다리가 됩니다.
16가지 성격 유형과 감정 분석을 통해 각 사용자에게 가장 공명하는 아티스트를 찾아드립니다.