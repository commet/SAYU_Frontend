# 🚀 Supabase 마이그레이션 가이드

## 방법 1: Supabase 대시보드에서 직접 실행 (권장)

1. [Supabase 대시보드](https://app.supabase.com) 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. 새 쿼리 생성
5. `migrations/art-profiles.sql` 파일 내용 복사
6. SQL Editor에 붙여넣기
7. **Run** 버튼 클릭

## 방법 2: 정확한 DATABASE_URL 확인

1. Supabase 대시보드 → Settings → Database
2. **Connection string** 섹션에서 URI 복사
3. 다음과 같은 형식이어야 함:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## 방법 3: Supabase CLI 사용

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref [PROJECT-REF]

# 마이그레이션 실행
supabase db push
```

## 현재 문제 해결

제공하신 URL에서 호스트명이 올바르지 않은 것 같습니다:
- ❌ `db.dvbsopkjedkrjvhmwdpn.supabase.co`
- ✅ 정확한 형식: `db.[20자리-프로젝트-참조].supabase.co`

Supabase 대시보드에서:
1. Settings → Database
2. Connection string 복사
3. 또는 프로젝트 홈에서 "Connect" 버튼 클릭

정확한 DATABASE_URL을 확인해주세요!