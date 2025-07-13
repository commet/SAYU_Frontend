# 유명 작가 작품 수집 가이드

## 📋 개요
이 문서는 Artvee에서 유명 작가들의 작품을 수집하는 방법을 안내합니다.
- **총 112명의 작가** (SAYU 타입별로 균등 분배)
- **예상 작품 수**: 약 1,120개 (작가당 10개 기준)
- **모든 작가는 Artvee 존재 확인 완료**
- **저작권 안전성 검증 완료**

## 🚀 빠른 시작

### 1. 테스트 실행 (5명만)
```bash
# PowerShell에서 실행
cd C:\Users\SAMSUNG\Documents\GitHub\SAYU\SAYU\artvee-crawler
node test-batch-collection.js
```

### 2. 전체 수집 실행
```bash
# 모든 112명 작가의 작품 수집 (약 1-2시간 소요)
node collect-famous-artists.js
```

### 3. 특정 작가만 테스트
```bash
# 예: 반 고흐만 테스트
node collect-famous-artists.js test vincent-van-gogh
```

## 📁 결과 파일 위치
수집된 데이터는 `data/` 폴더에 저장됩니다:
- `data/famous-artists-artworks.json` - 전체 작품 정보
- `data/famous-artists-urls.json` - URL 목록만
- `data/famous-artists-artworks.csv` - CSV 형식

## 🔧 커스터마이징

### 작가당 작품 수 조정
`collect-famous-artists.js` 파일의 92번째 줄에서 `limit` 값 수정:
```javascript
async getArtistArtworks(artistSlug, sayuType, limit = 10) {
  // limit = 10을 원하는 숫자로 변경
```

### 특정 SAYU 타입만 수집
`collect-famous-artists.js`의 51번째 줄 수정:
```javascript
// 예: LAEF, LAEC 타입만 수집
for (const [sayuType, artists] of Object.entries(this.famousArtists)) {
  if (!['LAEF', 'LAEC'].includes(sayuType)) continue;
  // ... 
}
```

## 🗄️ 데이터베이스 통합

### 1. 수집 후 DB 저장
```bash
# 수집된 데이터를 데이터베이스에 저장
node import-to-database.js
```

### 2. SAYU 통합 테스트
```bash
# SAYU 플랫폼과의 통합 테스트
node test-sayu-integration.js
```

## ⚠️ 주의사항

1. **API 제한**: 요청 간 2초 지연이 설정되어 있음
2. **네트워크 오류**: 불안정한 연결 시 재시도 필요
3. **중복 방지**: 이미 수집된 작품은 자동으로 건너뜀

## 📊 작가 리스트 요약

### L+A 그룹 (30명)
- **LAEF** (여우 🦊): 반 고흐, 터너, 프리드리히 등 8명
- **LAEC** (고양이 🐱): 모네, 드가, 카사트 등 8명
- **LAMF** (올빼미 🦉): 베르메르, 호퍼, 데 키리코 등 7명
- **LAMC** (거북이 🐢): 세잔, 브라크, 클레 등 7명

### L+R 그룹 (28명)
- **LREF** (카멜레온 🦎): 벨라스케스, 마네, 쿠르베 등 7명
- **LREC** (고슴도치 🦔): 르누아르, 프라고나르 등 7명
- **LRMF** (문어 🐙): 카라바조, 고야, 들라크루아 등 7명
- **LRMC** (비버 🦫): 뒤러, 반 에이크, 앵그르 등 7명

### S+A 그룹 (27명)
- **SAEF** (나비 🦋): 마티스, 샤갈, 뒤피 등 7명
- **SAEC** (펭귄 🐧): 몬드리안, 칸딘스키 등 7명
- **SAMF** (앵무새 🦜): 그랜트 우드, 호퍼 등 6명
- **SAMC** (사슴 🦌): 리히텐슈타인, 재스퍼 존스 등 7명

### S+R 그룹 (27명)
- **SREF** (강아지 🐕): 노먼 록웰, 라이엔데커 등 6명
- **SREC** (오리 🦆): 로세티, 워터하우스, 무하 등 7명
- **SRMF** (코끼리 🐘): 렘브란트, 루벤스, 티치아노 등 7명
- **SRMC** (독수리 🦅): 다 빈치, 미켈란젤로, 라파엘로 등 7명

## 🐛 문제 해결

### "작가를 찾을 수 없음" 오류
- `debug-artist-page.js` 사용하여 정확한 URL 확인
- Artvee 사이트에서 직접 작가 이름 검색

### 수집 중단 시
- `data/` 폴더의 기존 파일은 유지됨
- 다시 실행하면 처음부터 시작 (중복 제거됨)

### 네트워크 오류
- timeout 설정을 늘려보세요 (현재 30초)
- VPN 사용 시 끄고 시도

## 📞 연락처
문제 발생 시 GitHub Issues에 등록해주세요.

---
마지막 업데이트: 2025-01-13