# 🎨 Artvee 유명 작가 작품 수집기

## 한 줄 요약
112명의 유명 작가들의 작품을 Artvee에서 수집하여 SAYU 성격 유형과 매칭하는 시스템

## 🚀 가장 빠른 실행 방법

### Windows (더블클릭)
1. `RUN_COLLECTION.bat` 더블클릭
2. 메뉴에서 원하는 옵션 선택

### PowerShell (명령어)
```powershell
# 전체 수집
node collect-famous-artists.js

# 테스트 (5명만)  
node test-batch-collection.js

# 특정 작가
node collect-famous-artists.js test vincent-van-gogh
```

## 📊 수집 규모
- **작가 수**: 112명
- **예상 작품**: 약 1,120개
- **소요 시간**: 1-2시간
- **SAYU 타입**: 16개 (타입당 평균 7명)

## 📁 결과물
```
data/
├── famous-artists-artworks.json  # 전체 데이터
├── famous-artists-urls.json      # URL만
└── famous-artists-artworks.csv   # 엑셀용
```

## ✅ 특징
- 모든 작가 Artvee 존재 확인 완료
- 저작권 안전 (퍼블릭 도메인만)
- SAYU 성격 유형별 균등 분배
- 르네상스부터 20세기 초까지

## 🔧 설정 변경
`collect-famous-artists.js` 파일에서:
- 92번 줄: 작가당 작품 수 (기본 10개)
- 69번 줄: 요청 간 지연 시간 (기본 2초)

## ⚠️ 주의
- 네트워크 연결 필요
- 중간에 끊어져도 다시 실행 가능
- `data` 폴더가 자동 생성됨

---
자세한 내용은 `FAMOUS_ARTISTS_COLLECTION_GUIDE.md` 참조