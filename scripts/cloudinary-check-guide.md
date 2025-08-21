# Cloudinary에서 전체 작품 수 확인 방법

## 방법 1: 웹 대시보드 (가장 쉬운 방법)

1. **Cloudinary 콘솔 접속**
   - https://cloudinary.com/console 로그인
   - 계정: dkdzgpj3n

2. **Media Library에서 확인**
   - 좌측 메뉴 → "Media Library" 클릭
   - 검색창에 `sayu/artvee` 입력
   - 우측 상단에 총 파일 수 표시됨

3. **폴더별 확인**
   - `sayu/artvee/full/` 폴더 → 원본 이미지들
   - `sayu/artvee/thumbnails/` 폴더 → 썸네일들
   - `sayu/artvee/enhanced/` 폴더 → 고화질 이미지들
   - `sayu/artvee/masters/` 폴더 → 거장 작품들

## 방법 2: Search API 활용 (무료 제한 있음)

```bash
# GET 요청으로 확인 가능 (API 키 필요)
curl -X GET \
  "https://api.cloudinary.com/v1_1/dkdzgpj3n/resources/search" \
  -H "Authorization: Basic [BASE64_ENCODED_API_KEY:API_SECRET]" \
  -d "expression=folder:sayu/artvee/*"
```

## 방법 3: 브라우저 개발자 도구 활용

1. Media Library 페이지에서 F12 (개발자 도구)
2. Network 탭에서 API 호출 확인
3. search API 응답에서 `total_count` 필드 확인

## 방법 4: Management API (가장 정확)

```javascript
// 전체 리소스 카운트 (관리용 API)
const adminAPI = cloudinary.v2.api;
adminAPI.resources_by_tag('sayu-artwork', { max_results: 500 })
  .then(result => console.log('Total:', result.resources.length));
```