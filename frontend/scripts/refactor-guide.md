# 🏗️ SAYU 리팩토링 가이드

## 📋 단계별 실행 계획

### 🔥 **1주차: 즉시 처리 (High Priority)**

#### Day 1-2: 기본 정리
```bash
# 자동 정리 스크립트 실행
node scripts/analyze-codebase.js
node scripts/cleanup-automation.js

# 결과 확인
git diff --stat
git add .
git commit -m "feat: 기본 코드 정리 - console.log 제거, import 최적화"
```

#### Day 3-4: 컴포넌트 통합
**중복 컴포넌트 정리**
```typescript
// 🔍 찾아볼 패턴들
- Button vs ButtonNew vs CustomButton
- Card vs ArtCard vs ExhibitionCard  
- Modal vs Dialog vs Popup

// ✅ 통합 방법
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button = ({ variant = 'primary', size = 'md', ...props }) => {
  return <button className={cn(buttonVariants({ variant, size }))} {...props} />;
};
```

#### Day 5-7: 폴더 구조 정리
```
📁 정리 전
src/
├── components/
│   ├── Button.tsx
│   ├── CustomButton.tsx
│   ├── ArtCard.tsx
│   ├── ExhibitionCard.tsx
│   └── quiz/QuizCard.tsx

📁 정리 후  
src/
├── components/
│   ├── ui/           # 재사용 UI 컴포넌트
│   │   ├── Button/
│   │   ├── Card/
│   │   └── Modal/
│   ├── features/     # 기능별 컴포넌트
│   │   ├── quiz/
│   │   ├── exhibition/
│   │   └── profile/
│   └── layout/       # 레이아웃 컴포넌트
```

### 📅 **2주차: 구조 개선 (Medium Priority)**

#### 공통 로직 추출
```typescript
// 🔍 중복 코드 패턴
// 여러 컴포넌트에서 반복되는 로직들

// ✅ 개선 방법
// 1. API 호출 통합
export class APIClient {
  static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }
  
  static exhibitions = {
    getAll: () => APIClient.request<Exhibition[]>('/exhibitions'),
    getById: (id: string) => APIClient.request<Exhibition>(`/exhibitions/${id}`)
  };
}

// 2. 공통 훅 추출
export function useAPI<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    APIClient.request<T>(endpoint)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [endpoint]);
  
  return { data, loading, error };
}
```

#### 상태 관리 통합
```typescript
// 🔍 흩어진 상태들
// - 여러 컴포넌트의 useState
// - 중복된 로직

// ✅ Context로 통합
export const AppStateContext = createContext();

export function AppStateProvider({ children }) {
  const [user, setUser] = useState(null);
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const value = {
    user, setUser,
    exhibitions, setExhibitions,
    loading, setLoading
  };
  
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}
```

### ⏰ **3주차: 성능 최적화 (Low Priority)**

#### React 최적화
```typescript
// 1. 컴포넌트 메모이제이션
const ExpensiveComponent = React.memo(({ data, onAction }) => {
  return <div>{/* 렌더링 */}</div>;
});

// 2. 콜백 최적화
const Parent = () => {
  const handleClick = useCallback((id: string) => {
    // 처리 로직
  }, []);
  
  return <Child onClick={handleClick} />;
};

// 3. 코드 스플리팅
const LazyExhibition = lazy(() => import('./Exhibition'));

// 4. 이미지 최적화
const OptimizedImage = ({ src, alt, ...props }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    width={props.width}
    height={props.height}
    {...props}
  />
);
```

## 🛠️ 리팩토링 체크리스트

### ✅ 파일 레벨
- [ ] console.log/warn 제거
- [ ] 사용되지 않는 import 정리  
- [ ] any 타입을 구체적 타입으로 변경
- [ ] 하드코딩된 문자열 → 상수로 추출
- [ ] 100줄 넘는 파일 → 분할 검토

### ✅ 컴포넌트 레벨  
- [ ] 중복 컴포넌트 통합
- [ ] props interface 정의
- [ ] 인라인 함수 → useCallback 적용
- [ ] 큰 컴포넌트 → 작은 컴포넌트로 분할
- [ ] 조건부 렌더링 최적화

### ✅ 아키텍처 레벨
- [ ] 폴더 구조 정리 (ui/features/layout)
- [ ] API 레이어 통합
- [ ] 공통 로직 → custom hook 추출
- [ ] 상태 관리 중앙화
- [ ] 타입 정의 중앙화

## 🚨 주의사항

### ❌ 하지 말아야 할 것들
```typescript
// 1. 한 번에 모든 것을 바꾸려 하지 말기
// 2. 테스트 없이 대규모 리팩토링 하지 말기
// 3. 기능 변경과 리팩토링 동시에 하지 말기

// 잘못된 예시
const BadComponent = ({ data }: { data: any }) => {
  console.log('rendering', data); // ❌ console.log
  
  return (
    <div onClick={() => handleClick(data.id)}> {/* ❌ 인라인 함수 */}
      {data.items?.map(item => ( // ❌ optional chaining 없이
        <div key={Math.random()}> {/* ❌ 잘못된 key */}
          {item.title}
        </div>
      ))}
    </div>
  );
};
```

### ✅ 올바른 접근
```typescript
interface ComponentProps {
  data: ExhibitionData; // ✅ 구체적 타입
}

const GoodComponent = memo(({ data }: ComponentProps) => {
  const handleClick = useCallback((id: string) => {
    // 처리 로직
  }, []); // ✅ useCallback 사용
  
  if (!data?.items) return null; // ✅ 안전한 체크
  
  return (
    <div>
      {data.items.map(item => (
        <ExhibitionItem 
          key={item.id} // ✅ 안정적인 key
          item={item}
          onClick={handleClick}
        />
      ))}
    </div>
  );
});
```

## 📊 진행 상황 추적

### 주간 체크포인트
```bash
# 매주 실행해서 개선 상황 확인
node scripts/analyze-codebase.js

# 번들 크기 체크
npm run build
npm run analyze

# 성능 측정
npm run lighthouse
```

### 성공 지표
- **파일 수**: 불필요한 파일 20% 감소
- **코드 라인**: 중복 제거로 10% 감소  
- **번들 크기**: 최적화로 15% 감소
- **로딩 시간**: 성능 개선으로 20% 향상
- **개발 경험**: 코드 찾기/수정하기 더 쉬워짐

## 🎯 최종 목표

```typescript
// 리팩토링 후 이상적인 코드
export interface ExhibitionCardProps {
  exhibition: Exhibition;
  variant?: 'default' | 'compact' | 'featured';
  onVisit?: (id: string) => void;
}

export const ExhibitionCard = memo<ExhibitionCardProps>(({ 
  exhibition, 
  variant = 'default',
  onVisit 
}) => {
  const { language } = useLanguage();
  const displayTitle = getLocalizedText(exhibition.title, language);
  
  const handleVisit = useCallback(() => {
    onVisit?.(exhibition.id);
  }, [exhibition.id, onVisit]);
  
  return (
    <Card variant={variant} className="exhibition-card">
      <CardImage 
        src={exhibition.image} 
        alt={displayTitle}
        loading="lazy" 
      />
      <CardContent>
        <CardTitle>{displayTitle}</CardTitle>
        <CardDescription>{getLocalizedText(exhibition.description, language)}</CardDescription>
        <CardActions>
          <Button onClick={handleVisit}>
            {language === 'ko' ? '관람하기' : 'Visit'}
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
});

ExhibitionCard.displayName = 'ExhibitionCard';
```

이렇게 **체계적이고 점진적으로** 접근하면 코드 품질을 크게 개선할 수 있어요! 🚀