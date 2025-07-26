// Art Pulse MVP - 실제로 2주 안에 구현 가능한 버전
// 복잡한 기술(시선추적 등) 제외, 모바일 터치 인터랙션 중심

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// 단순화된 공명 데이터 구조 (MVP용)
interface SimpleResonance {
  // 작품의 어느 부분에 관심을 가졌는지
  focusAreas: { x: number; y: number; intensity: number }[];
  
  // 3가지 선택지 중 고르기 (텍스트 입력 X)
  resonanceType: 'sensory' | 'thoughtful' | 'memorial'; // 감각적/사유적/회상적
  
  // 느낌의 강도 (스와이프로 표현)
  intensity: number; // 1-10
  
  // 머문 시간
  dwellTime: number;
}

// Art Pulse MVP 컴포넌트
export const ArtPulseMVP: React.FC = () => {
  const [currentArtwork, setCurrentArtwork] = useState(null);
  const [phase, setPhase] = useState<'waiting' | 'preview' | 'active' | 'result'>('waiting');
  const [myResonance, setMyResonance] = useState<SimpleResonance>({
    focusAreas: [],
    resonanceType: null,
    intensity: 5,
    dwellTime: 0
  });
  const [otherResonances, setOtherResonances] = useState([]);
  const [selectedResonanceType, setSelectedResonanceType] = useState(null);
  
  const startTime = useRef(Date.now());
  const touchHistory = useRef([]);
  
  // Supabase 실시간 연결
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 매일 19시 체크
  useEffect(() => {
    const checkPulseTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      if (hour === 18 && minute >= 55) {
        setPhase('preview');
        loadTodaysArtwork();
      } else if (hour === 19 && minute < 20) {
        setPhase('active');
      } else if (hour === 19 && minute >= 20 && minute < 30) {
        setPhase('result');
      }
    };
    
    const interval = setInterval(checkPulseTime, 30000); // 30초마다 체크
    checkPulseTime();
    
    return () => clearInterval(interval);
  }, []);

  // 오늘의 작품 로드
  const loadTodaysArtwork = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('daily_artworks')
      .select('*')
      .eq('pulse_date', today)
      .single();
    
    setCurrentArtwork(data);
  };

  // 터치 영역 기록 (히트맵 대신 간단한 포인트)
  const handleArtworkTouch = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    const intensity = Math.min(touchHistory.current.length / 10 + 1, 10);
    
    setMyResonance(prev => ({
      ...prev,
      focusAreas: [...prev.focusAreas, { x: locationX, y: locationY, intensity }]
    }));
    
    touchHistory.current.push({ x: locationX, y: locationY, time: Date.now() });
  };

  // 공명 타입 선택 (간단한 3택)
  const resonanceTypes = [
    { 
      type: 'sensory', 
      label: '감각적', 
      description: '색, 형태, 질감에 끌린다',
      color: '#FF6B6B'
    },
    { 
      type: 'thoughtful', 
      label: '사유적', 
      description: '생각과 질문이 떠오른다',
      color: '#4ECDC4'
    },
    { 
      type: 'memorial', 
      label: '회상적', 
      description: '기억과 경험이 연결된다',
      color: '#95A5A6'
    }
  ];

  // 실시간으로 다른 사용자들의 공명 받기
  useEffect(() => {
    if (phase !== 'active') return;
    
    const channel = supabase
      .channel('art-pulse-live')
      .on('broadcast', { event: 'resonance' }, ({ payload }) => {
        setOtherResonances(prev => [...prev, payload]);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [phase]);

  // 내 공명 전송
  const submitResonance = async () => {
    const dwellTime = (Date.now() - startTime.current) / 1000;
    
    const resonanceData = {
      ...myResonance,
      dwellTime,
      userId: currentUser.id,
      artworkId: currentArtwork.id,
      timestamp: new Date().toISOString()
    };
    
    // DB 저장
    await supabase
      .from('pulse_resonances')
      .insert(resonanceData);
    
    // 실시간 브로드캐스트
    await supabase
      .channel('art-pulse-live')
      .send({
        type: 'broadcast',
        event: 'resonance',
        payload: {
          ...resonanceData,
          avatar: currentUser.avatar // 익명화 가능
        }
      });
    
    // 매칭 찾기
    findSimilarResonators(resonanceData);
  };

  // 간단한 유사도 계산
  const findSimilarResonators = async (myData) => {
    const { data: others } = await supabase
      .from('pulse_resonances')
      .select('*')
      .eq('artwork_id', currentArtwork.id)
      .neq('user_id', currentUser.id)
      .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()); // 30분 이내
    
    const similar = others
      .map(other => ({
        ...other,
        similarity: calculateSimpleSimilarity(myData, other)
      }))
      .filter(o => o.similarity > 0.7)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
    
    setMatchedUsers(similar);
  };

  // MVP용 간단한 유사도 계산
  const calculateSimpleSimilarity = (my, other) => {
    let score = 0;
    
    // 같은 공명 타입 (40%)
    if (my.resonanceType === other.resonanceType) score += 0.4;
    
    // 비슷한 강도 (30%)
    const intensityDiff = Math.abs(my.intensity - other.intensity);
    score += (1 - intensityDiff / 10) * 0.3;
    
    // 비슷한 관심 영역 (30%)
    const areaOverlap = calculateAreaOverlap(my.focusAreas, other.focusAreas);
    score += areaOverlap * 0.3;
    
    return score;
  };

  // UI 렌더링
  if (phase === 'waiting') {
    return <WaitingScreen nextPulseTime="19:00" />;
  }

  if (phase === 'preview') {
    return (
      <View style={styles.container}>
        <Text style={styles.phaseTitle}>곧 시작됩니다</Text>
        <Image 
          source={{ uri: currentArtwork?.image_url }}
          style={styles.artworkPreview}
        />
        <Text style={styles.artistInfo}>
          {currentArtwork?.artist} - {currentArtwork?.title}
        </Text>
      </View>
    );
  }

  if (phase === 'active') {
    return (
      <View style={styles.container}>
        {/* 작품 이미지 (터치 가능) */}
        <TouchableOpacity 
          activeOpacity={1}
          onPress={handleArtworkTouch}
          style={styles.artworkContainer}
        >
          <Image 
            source={{ uri: currentArtwork?.image_url }}
            style={styles.artworkImage}
          />
          
          {/* 내 터치 포인트 시각화 */}
          {myResonance.focusAreas.map((point, idx) => (
            <Animated.View
              key={idx}
              style={[
                styles.touchPoint,
                {
                  left: point.x - 10,
                  top: point.y - 10,
                  opacity: point.intensity / 10
                }
              ]}
            />
          ))}
          
          {/* 다른 사람들의 실시간 공명 (익명) */}
          <View style={styles.othersResonance}>
            <Text style={styles.liveCount}>
              🌊 {otherResonances.length}명이 함께 감상 중
            </Text>
          </View>
        </TouchableOpacity>

        {/* 공명 타입 선택 */}
        <View style={styles.resonanceSelector}>
          <Text style={styles.question}>
            이 작품과의 만남은 어떤가요?
          </Text>
          <View style={styles.resonanceTypes}>
            {resonanceTypes.map(type => (
              <TouchableOpacity
                key={type.type}
                style={[
                  styles.typeButton,
                  selectedResonanceType === type.type && { 
                    backgroundColor: type.color 
                  }
                ]}
                onPress={() => {
                  setSelectedResonanceType(type.type);
                  setMyResonance(prev => ({ ...prev, resonanceType: type.type }));
                }}
              >
                <Text style={styles.typeLabel}>{type.label}</Text>
                <Text style={styles.typeDesc}>{type.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 강도 조절 (스와이프) */}
        <View style={styles.intensityControl}>
          <Text style={styles.intensityLabel}>얼마나 강하게 느끼시나요?</Text>
          <Slider
            value={myResonance.intensity}
            onValueChange={val => setMyResonance(prev => ({ ...prev, intensity: val }))}
            minimumValue={1}
            maximumValue={10}
            minimumTrackTintColor={selectedResonanceType ? 
              resonanceTypes.find(t => t.type === selectedResonanceType)?.color : 
              '#ddd'
            }
          />
        </View>

        {/* 제출 버튼 */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={submitResonance}
          disabled={!selectedResonanceType}
        >
          <Text style={styles.submitText}>공명 공유하기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'result') {
    return (
      <View style={styles.container}>
        <Text style={styles.phaseTitle}>오늘의 공명</Text>
        
        {/* 전체 통계 */}
        <View style={styles.stats}>
          <Text style={styles.statText}>
            총 {otherResonances.length + 1}명이 참여했습니다
          </Text>
          <View style={styles.resonanceDistribution}>
            {resonanceTypes.map(type => {
              const count = otherResonances.filter(r => r.resonanceType === type.type).length;
              const percentage = (count / otherResonances.length) * 100;
              return (
                <View key={type.type} style={styles.distributionBar}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: `${percentage}%`, 
                        backgroundColor: type.color 
                      }
                    ]} 
                  />
                  <Text style={styles.barLabel}>{type.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 매칭된 사용자들 */}
        <View style={styles.matches}>
          <Text style={styles.matchTitle}>당신과 비슷한 공명</Text>
          {matchedUsers.map((user, idx) => (
            <TouchableOpacity 
              key={idx}
              style={styles.matchCard}
              onPress={() => startConversation(user)}
            >
              <Image source={{ uri: user.avatar }} style={styles.matchAvatar} />
              <Text style={styles.matchSimilarity}>
                {Math.round(user.similarity * 100)}% 공명
              </Text>
              <Text style={styles.matchType}>
                {user.resonanceType === myResonance.resonanceType ? 
                  '같은 방식으로' : '다른 관점에서'} 감상
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 내일 예고 */}
        <Text style={styles.nextPulse}>
          다음 Art Pulse는 내일 19:00에 시작됩니다
        </Text>
      </View>
    );
  }
};

// 스타일
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 20
  },
  artworkImage: {
    width: '100%',
    height: 400,
    resizeMode: 'contain'
  },
  touchPoint: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFE57F'
  },
  resonanceTypes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20
  },
  typeButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    alignItems: 'center'
  },
  typeLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  typeDesc: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center'
  }
});




# Art Pulse 실제 구현 가이드

## 🎯 핵심 컨셉: "감정"을 넘어선 다층적 공명

단순히 "슬픔", "기쁨" 같은 감정 태그가 아닌, **예술과의 다층적 만남**을 포착합니다.

### 4개 공명 레이어

1. **감각층** - 즉각적이고 신체적인 반응
   - 시선이 머무는 곳 (히트맵)
   - 색채에 대한 반응
   - 시각적 임팩트 강도

2. **정서층** - 느낌과 기분
   - 복합적 감정 상태
   - 감정의 변화와 움직임
   - 정서적 복잡도

3. **인지층** - 생각과 사유
   - 떠오르는 연상과 개념
   - 질문의 발생 여부
   - 의미의 명확도/모호함

4. **시간층** - 기억과 시간성
   - 과거/현재/미래와의 연결
   - 개인적 기억의 환기

## 💡 사용자 경험 설계

### 1. 최소한의 명시적 입력
```
❌ 긴 텍스트 작성
❌ 복잡한 감정 선택지
✅ 터치와 시선으로 암묵적 데이터 수집
✅ 2-3개 단어 선택 (선택적)
✅ 시각적/제스처 기반 표현
```

### 2. Art Pulse 30분 여정

#### 18:55 - Preview Phase (5분)
- 오늘의 작품 공개
- 작품에 대한 최소한의 맥락 제공
- "곧 시작됩니다" 알림

#### 19:00 - Active Phase (15분)
- 실시간 공명 시작
- 다른 사용자들의 반응이 실시간으로 보임
- 나의 시선과 터치가 데이터로 변환

#### 19:15 - Reflection Phase (10분)
- 깊은 사유의 시간
- 선택적으로 몇 가지 단어/개념 선택
- AI가 나의 경험을 한 문장으로 요약

#### 19:25 - Connection Phase (5분)
- 비슷한 공명을 가진 사람들 발견
- 익명 메시지 교환 가능
- 다음 단계로 연결 선택

## 🛠️ 기술적 구현

### 암묵적 데이터 수집
```typescript
// 시선 추적 (가능한 경우)
const gazeData = {
  heatmap: [[x, y, duration], ...],
  focusAreas: identifyFocusRegions(heatmap),
  scanPattern: 'systematic' | 'chaotic' | 'focused'
};

// 터치 패턴 분석
const touchPattern = {
  frequency: touchEvents.length / timeSpent,
  pressure: averagePressure,
  gestureTypes: ['tap', 'longPress', 'swipe', 'pinch']
};

// 체류 시간과 스크롤
const engagementMetrics = {
  totalTime: endTime - startTime,
  scrollVelocity: calculateScrollSpeed(),
  pausePoints: identifyPauseLocations()
};
```

### AI 기반 경험 언어화
```typescript
// 수집된 데이터를 바탕으로 경험을 한 문장으로
async function verbalizeExperience(data: UserInteractionData): string {
  const prompt = `
    사용자의 예술 경험을 시적이고 함축적인 한 문장으로 표현:
    - 시선 패턴: ${data.gazePattern}
    - 체류 시간: ${data.dwellTime}
    - 선택한 연상어: ${data.associations}
    
    예시:
    - "붉은 선 위에서 멈춰 서서 어린 시절의 불안을 마주하다"
    - "형태의 리듬 속에서 현재의 고요함을 발견하다"
  `;
  
  return await generateWithGPT4(prompt);
}
```

### 실시간 공명 매칭
```typescript
// 다층적 유사도 계산
function calculateResonance(user1: ResonanceData, user2: ResonanceData): number {
  const layers = {
    sensory: compareSensoryPatterns(user1.sensory, user2.sensory) * 0.2,
    emotional: compareEmotionalComplexity(user1.emotional, user2.emotional) * 0.3,
    cognitive: compareCognitiveDepth(user1.cognitive, user2.cognitive) * 0.35,
    temporal: compareTemporalConnection(user1.temporal, user2.temporal) * 0.15
  };
  
  return Object.values(layers).reduce((sum, score) => sum + score, 0);
}
```

## 📱 위젯 UI/UX

### 홈스크린 위젯 상태
1. **대기 상태** (하루 중 대부분)
   - 다음 Pulse까지 카운트다운
   - 어제의 공명 하이라이트

2. **활성 상태** (19:00-19:30)
   - 실시간 참여자 수
   - 주요 공명 키워드 구름
   - 나와 유사한 사람들의 아바타

3. **매칭 알림** (Pulse 후)
   - "89% 공명하는 누군가가 메시지를 보냈습니다"
   - 탭하면 앱으로 이동

## 🎨 시각적 표현

### 공명 시각화
```
- 색상: 각 레이어별 고유 색상
  - 감각: 따뜻한 톤 (주황, 노랑)
  - 정서: 차가운 톤 (파랑, 보라)
  - 인지: 중성 톤 (회색, 흰색)
  - 시간: 그라데이션 (과거→미래)

- 애니메이션: 
  - 실시간 공명은 파동처럼 퍼짐
  - 유사한 공명자는 궤도를 그리며 가까워짐
```

## 💰 수익 모델 연계

### 프리미엄 기능
- **Deep Resonance**: 더 상세한 공명 분석 리포트
- **Extended Connection**: 72시간 이상 연결 유지
- **Resonance History**: 과거 모든 공명 기록 열람
- **Priority Matching**: 유사도 높은 사람 우선 매칭

### 갤러리 파트너십
- 실시간 관람객 공명 데이터 제공
- 작품별 깊이 있는 관람 패턴 분석
- 전시 기획을 위한 인사이트

## 🚀 단계별 구현 계획

### MVP (2주)
1. 기본 위젯 UI
2. 시간 기반 작품 노출
3. 간단한 터치 인터랙션
4. 기본 매칭 (감정 레이어만)

### Beta (4주)
1. 4개 레이어 전체 구현
2. AI 경험 언어화
3. 실시간 공명 시각화
4. iOS 위젯 최적화

### Launch (6주)
1. 전체 기능 통합
2. 성능 최적화
3. A/B 테스트
4. 안드로이드 확장

## 🎯 성공 지표

- **참여율**: Daily Pulse 참여율 40%+
- **완료율**: 시작한 사용자의 80%가 끝까지 참여
- **매칭률**: 참여자의 30%가 실제 메시지 교환
- **리텐션**: 주 3회 이상 참여자 비율 25%+

---

이렇게 Art Pulse는 단순한 '감정 매칭'을 넘어서 **예술을 통한 다층적 인간 이해**를 추구합니다. 사용자는 복잡한 입력 없이도 자신의 깊은 반응을 표현하고, 진정으로 공명하는 사람들과 연결될 수 있습니다.




// Art Pulse 2.0 - 감정을 넘어선 다층적 예술 공명 시스템
// 사유(思惟), 감각, 기억, 질문을 모두 포괄하는 통합적 경험 설계

import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/realtime-js';

// 공명 레이어 정의 (단순 감정을 넘어선 다층적 반응)
interface ResonanceLayer {
  // 1. 감각층 (Sensory) - 즉각적 반응
  sensory: {
    visualImpact: 'gentle' | 'moderate' | 'intense';
    colorResonance: string[]; // 끌리는 색상 영역
    gazePoints: { x: number; y: number; duration: number }[]; // 시선 머문 곳
  };
  
  // 2. 정서층 (Emotional) - 느낌
  emotional: {
    primary: string; // 주된 느낌
    complexity: number; // 1-10, 복잡도
    movement: 'rising' | 'stable' | 'falling' | 'fluctuating'; // 감정 변화
  };
  
  // 3. 인지층 (Cognitive) - 생각
  cognitive: {
    associations: string[]; // 떠오르는 단어/개념 (프리셋 선택)
    questions: boolean; // 질문이 생기는가?
    clarity: 'clear' | 'ambiguous' | 'mysterious'; // 의미 명확도
  };
  
  // 4. 시간층 (Temporal) - 과거/현재/미래 연결
  temporal: {
    reminds: 'past' | 'present' | 'future' | 'timeless';
    personalMemory: boolean; // 개인적 기억 연결 여부
  };
}

// Art Pulse 위젯 상태
interface ArtPulseState {
  artwork: {
    id: string;
    title: string;
    artist: string;
    image_url: string;
    contextClue?: string; // 작품 이해를 돕는 한 줄 힌트
  };
  
  resonanceMap: {
    totalParticipants: number;
    dominantResonance: string; // "깊은 사유", "감각적 몰입" 등
    
    // 나와 비슷한 공명을 가진 사람들
    similarResonators: {
      userId: string;
      avatar: string;
      resonanceScore: number;
      sharedLayers: string[]; // 공통된 반응 층위
    }[];
    
    // 실시간 공명 시각화
    resonanceCloud: {
      word: string;
      weight: number;
      layer: 'sensory' | 'emotional' | 'cognitive' | 'temporal';
    }[];
  };
  
  myResonance?: ResonanceLayer;
  pulsePhase: 'preview' | 'active' | 'reflection' | 'complete';
}

// 향상된 Art Pulse 서비스
export class EnhancedArtPulseService {
  private supabase;
  private channel: RealtimeChannel | null = null;
  private resonanceAnalyzer: ResonanceAnalyzer;
  
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.resonanceAnalyzer = new ResonanceAnalyzer();
  }

  // 매일 오후 7시 Art Pulse 시작 (4단계 진행)
  async initiateDailyPulse(): Promise<void> {
    // 1단계: Preview (18:55-19:00) - 5분간 작품 미리보기
    await this.startPreviewPhase();
    
    // 2단계: Active Pulse (19:00-19:15) - 15분간 활발한 공명
    setTimeout(() => this.startActivePhase(), 5 * 60 * 1000);
    
    // 3단계: Reflection (19:15-19:25) - 10분간 깊은 사유
    setTimeout(() => this.startReflectionPhase(), 20 * 60 * 1000);
    
    // 4단계: Complete (19:25-19:30) - 5분간 연결 형성
    setTimeout(() => this.startConnectionPhase(), 30 * 60 * 1000);
  }

  // 다층적 공명 기록 (텍스트 입력 최소화)
  async recordResonance(
    userId: string,
    artworkId: string,
    interactions: UserInteraction[]
  ): Promise<ResonanceLayer> {
    // 1. 암묵적 데이터에서 공명 레이어 추출
    const resonance = this.analyzeInteractions(interactions);
    
    // 2. AI로 공명 패턴 분석 및 언어화
    const verbalizedResonance = await this.verbalizeResonance(resonance);
    
    // 3. 데이터베이스 저장
    await this.supabase
      .from('art_pulse_resonances')
      .insert({
        user_id: userId,
        artwork_id: artworkId,
        resonance_data: resonance,
        verbalized: verbalizedResonance,
        created_at: new Date().toISOString()
      });
    
    // 4. 실시간 브로드캐스트
    if (this.channel) {
      await this.channel.send({
        type: 'broadcast',
        event: 'new_resonance',
        payload: {
          userId,
          resonance: this.anonymizeResonance(resonance),
          verbalized: verbalizedResonance
        }
      });
    }
    
    return resonance;
  }

  // 사용자 인터랙션에서 공명 레이어 추출
  private analyzeInteractions(interactions: UserInteraction[]): ResonanceLayer {
    // 시선 분석
    const gazeData = interactions
      .filter(i => i.type === 'gaze')
      .map(i => ({
        x: i.x!,
        y: i.y!,
        duration: i.duration!
      }));
    
    // 감각적 반응 분석
    const visualImpact = this.calculateVisualImpact(interactions);
    const colorResonance = this.extractColorPreference(gazeData);
    
    // 인지적 반응 분석
    const dwellTime = interactions
      .filter(i => i.type === 'dwell')
      .reduce((sum, i) => sum + i.duration!, 0);
    
    const hasQuestions = dwellTime > 30000; // 30초 이상 머물면 질문 있음
    
    // 시간적 연결 분석
    const swipePatterns = interactions.filter(i => i.type === 'swipe');
    const temporal = this.analyzeTemporalConnection(swipePatterns);
    
    return {
      sensory: {
        visualImpact,
        colorResonance,
        gazePoints: gazeData
      },
      emotional: {
        primary: this.inferEmotionFromPattern(interactions),
        complexity: this.calculateComplexity(interactions),
        movement: this.trackEmotionalMovement(interactions)
      },
      cognitive: {
        associations: this.extractAssociations(interactions),
        questions: hasQuestions,
        clarity: this.assessClarity(dwellTime, gazeData)
      },
      temporal
    };
  }

  // 공명을 언어로 변환 (AI 활용)
  private async verbalizeResonance(resonance: ResonanceLayer): Promise<string> {
    const prompt = `
      사용자의 예술 작품 경험을 한 문장으로 표현해주세요:
      - 시각적 임팩트: ${resonance.sensory.visualImpact}
      - 주요 정서: ${resonance.emotional.primary}, 복잡도 ${resonance.emotional.complexity}/10
      - 인지적 반응: ${resonance.cognitive.clarity}, 질문 ${resonance.cognitive.questions ? '있음' : '없음'}
      - 시간적 연결: ${resonance.temporal.reminds}
      
      예시: "강렬한 색채 속에서 과거의 기억을 마주하며 새로운 질문을 발견하다"
    `;
    
    // OpenAI API 호출 (실제 구현 시)
    return "깊은 고요 속에서 현재를 응시하며 명확한 깨달음에 도달하다";
  }

  // 비슷한 공명자 찾기 (다층적 매칭)
  async findSimilarResonators(
    myResonance: ResonanceLayer,
    allResonances: UserResonance[]
  ): Promise<SimilarResonator[]> {
    return allResonances
      .map(ur => ({
        userId: ur.userId,
        avatar: ur.avatar,
        resonanceScore: this.calculateMultiLayerSimilarity(myResonance, ur.resonance),
        sharedLayers: this.findSharedLayers(myResonance, ur.resonance)
      }))
      .filter(r => r.resonanceScore > 0.6)
      .sort((a, b) => b.resonanceScore - a.resonanceScore)
      .slice(0, 5);
  }

  // 다층적 유사도 계산
  private calculateMultiLayerSimilarity(r1: ResonanceLayer, r2: ResonanceLayer): number {
    const weights = {
      sensory: 0.2,
      emotional: 0.3,
      cognitive: 0.35,
      temporal: 0.15
    };
    
    const sensoryScore = this.compareSensoryLayers(r1.sensory, r2.sensory);
    const emotionalScore = this.compareEmotionalLayers(r1.emotional, r2.emotional);
    const cognitiveScore = this.compareCognitiveLayers(r1.cognitive, r2.cognitive);
    const temporalScore = r1.temporal.reminds === r2.temporal.reminds ? 1 : 0.3;
    
    return (
      sensoryScore * weights.sensory +
      emotionalScore * weights.emotional +
      cognitiveScore * weights.cognitive +
      temporalScore * weights.temporal
    );
  }

  // 공유된 반응 층위 찾기
  private findSharedLayers(r1: ResonanceLayer, r2: ResonanceLayer): string[] {
    const shared = [];
    
    if (r1.sensory.visualImpact === r2.sensory.visualImpact) {
      shared.push(`${r1.sensory.visualImpact} 시각적 임팩트`);
    }
    
    if (r1.emotional.primary === r2.emotional.primary) {
      shared.push(`'${r1.emotional.primary}' 정서 공유`);
    }
    
    if (r1.cognitive.clarity === r2.cognitive.clarity) {
      shared.push(`${r1.cognitive.clarity === 'clear' ? '명확한' : '모호한'} 의미 인식`);
    }
    
    if (r1.temporal.reminds === r2.temporal.reminds) {
      const timeMap = {
        past: '과거와 연결',
        present: '현재에 집중',
        future: '미래를 상상',
        timeless: '시간을 초월'
      };
      shared.push(timeMap[r1.temporal.reminds]);
    }
    
    return shared;
  }
}

// React Native 위젯 컴포넌트 (향상된 버전)
export const EnhancedArtPulseWidget: React.FC = () => {
  const [pulseState, setPulseState] = useState<ArtPulseState | null>(null);
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // 터치/시선 인터랙션 기록
  const handleTouch = (event: TouchEvent) => {
    if (!isRecording) return;
    
    const touch = event.touches[0];
    setTouchPoints(prev => [...prev, {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
      pressure: touch.force || 1
    }]);
  };

  // 실시간 공명 맵 업데이트
  useEffect(() => {
    const channel = supabase.channel('art-pulse-live')
      .on('broadcast', { event: 'new_resonance' }, (payload) => {
        updateResonanceCloud(payload.resonance);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <View style={styles.widget}>
      {/* 작품 이미지 (터치 인터랙션 가능) */}
      <TouchableWithoutFeedback onPress={handleTouch}>
        <Image 
          source={{ uri: pulseState?.artwork.image_url }}
          style={styles.artworkImage}
        />
      </TouchableWithoutFeedback>

      {/* 실시간 공명 시각화 */}
      <View style={styles.resonanceOverlay}>
        {/* 참여자 수 및 주요 공명 */}
        <View style={styles.header}>
          <Text style={styles.participantCount}>
            🌊 {pulseState?.resonanceMap.totalParticipants}명이 공명 중
          </Text>
          <Text style={styles.dominantResonance}>
            "{pulseState?.resonanceMap.dominantResonance}"
          </Text>
        </View>

        {/* 나와 비슷한 공명자들 */}
        <View style={styles.similarResonators}>
          {pulseState?.resonanceMap.similarResonators.map((resonator, idx) => (
            <View key={idx} style={styles.resonatorBubble}>
              <Image source={{ uri: resonator.avatar }} style={styles.avatar} />
              <View style={styles.sharedLayers}>
                {resonator.sharedLayers.slice(0, 2).map((layer, i) => (
                  <Text key={i} style={styles.sharedLayer}>{layer}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* 공명 단어 구름 (실시간 업데이트) */}
        <View style={styles.resonanceCloud}>
          {pulseState?.resonanceMap.resonanceCloud.map((word, idx) => (
            <Text 
              key={idx}
              style={[
                styles.cloudWord,
                { 
                  fontSize: 10 + word.weight * 2,
                  opacity: 0.6 + word.weight * 0.4,
                  color: getLayerColor(word.layer)
                }
              ]}
            >
              {word.word}
            </Text>
          ))}
        </View>

        {/* 단계별 진행 상태 */}
        <View style={styles.phaseIndicator}>
          {['preview', 'active', 'reflection', 'complete'].map((phase) => (
            <View 
              key={phase}
              style={[
                styles.phaseDot,
                pulseState?.pulsePhase === phase && styles.phaseDotActive
              ]}
            />
          ))}
        </View>
      </View>

      {/* CTA */}
      <TouchableOpacity 
        style={styles.ctaButton}
        onPress={() => openApp('art-pulse', { artworkId: pulseState?.artwork.id })}
      >
        <Text style={styles.ctaText}>
          {getPhaseAction(pulseState?.pulsePhase)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// 사용자 인터랙션 타입
interface UserInteraction {
  type: 'touch' | 'gaze' | 'swipe' | 'dwell' | 'zoom' | 'select';
  x?: number;
  y?: number;
  duration?: number;
  value?: any;
  timestamp: number;
}

// 프리셋 선택지 (텍스트 입력 최소화)
const PRESET_ASSOCIATIONS = {
  sensory: ['부드러운', '거친', '따뜻한', '차가운', '무거운', '가벼운'],
  emotional: ['평온한', '불안한', '희망적인', '그리운', '경이로운', '섬세한'],
  cognitive: ['질서', '혼돈', '균형', '대비', '리듬', '침묵'],
  temporal: ['어린시절', '현재', '미래', '영원', '순간', '반복']
};

// 위젯 스타일
const styles = StyleSheet.create({
  widget: {
    backgroundColor: '#0a0a0a',
    borderRadius: 24,
    overflow: 'hidden',
    height: 200,
    position: 'relative'
  },
  artworkImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.7
  },
  resonanceOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between'
  },
  participantCount: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4
  },
  dominantResonance: {
    color: '#FFE57F',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4
  },
  resonanceCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 12
  },
  cloudWord: {
    marginHorizontal: 4,
    marginVertical: 2,
    fontWeight: '500'
  }
});




# SAYU 킬러 기능 구현 로드맵

## 🎯 선정된 3대 킬러 기능

### 1. **Daily Art Meditation** (일일 예술 명상)
- **핵심 가치**: 습관 형성, 지속적 engagement
- **구현 난이도**: ⭐⭐ (낮음)
- **예상 개발 기간**: 2주
- **ROI**: 높음 (DAU 증가에 직접적 기여)

### 2. **Art Pulse Widget** (실시간 감정 동기화)
- **핵심 가치**: FOMO 유발, 동시성 경험
- **구현 난이도**: ⭐⭐⭐⭐ (높음 - 위젯 + 실시간)
- **예상 개발 기간**: 4주
- **ROI**: 매우 높음 (바이럴 잠재력)

### 3. **Taste Match** (72시간 한정 매칭)
- **핵심 가치**: 긴장감, 의미 있는 연결
- **구현 난이도**: ⭐⭐⭐ (중간)
- **예상 개발 기간**: 3주
- **ROI**: 높음 (유저 retention)

## 📋 구현 우선순위 및 단계

### Phase 1: MVP (4주)
**목표**: 핵심 기능 검증 및 초기 사용자 확보

#### Week 1-2: Daily Art Meditation
```typescript
// 필수 구현 사항
- [ ] 매일 아침 8시 작품 선정 로직
- [ ] 30초 타이머 기능
- [ ] 감정 태그 선택 UI
- [ ] 24시간 한정 채팅방
- [ ] 푸시 알림 시스템
```

#### Week 3-4: Taste Match (Basic)
```typescript
// 필수 구현 사항
- [ ] 전시 체크인/체크아웃 기능
- [ ] 작품별 체류 시간 측정
- [ ] 72시간 타이머
- [ ] 익명 메시징 시스템
- [ ] 3단계 공개 메커니즘
```

### Phase 2: Growth (4주)
**목표**: 바이럴 성장 및 네트워크 효과

#### Week 5-6: Art Pulse Widget (iOS)
```typescript
// 필수 구현 사항
- [ ] iOS 위젯 개발
- [ ] Supabase Realtime 연동
- [ ] 감정 클러스터링 알고리즘
- [ ] 매일 저녁 7시 자동 시작
- [ ] 홈스크린 위젯 UI
```

#### Week 7-8: 통합 및 최적화
```typescript
// 필수 구현 사항
- [ ] 3개 기능 간 시너지 창출
- [ ] 16개 사용자 유형별 커스터마이징
- [ ] 성능 최적화
- [ ] A/B 테스트 설정
```

## 🛠️ 기술 스택 및 아키텍처

### Frontend
```typescript
// Next.js 15 + React 19
- App Router 활용
- Server Components for 초기 로딩 최적화
- Suspense for 점진적 렌더링
- React Native for 모바일 위젯
```

### Backend
```typescript
// Railway + Supabase 하이브리드
- Railway: 복잡한 매칭 알고리즘, AI 연동
- Supabase: 실시간 기능, 인증, 데이터베이스
- Redis: 캐싱, 세션 관리
- BullMQ: 스케줄링 (매일 8시, 7시)
```

### AI/ML
```typescript
// OpenAI + 자체 모델
- GPT-4: 질문 생성, 감상 분석
- 감정 클러스터링: K-means
- 취향 유사도: Cosine Similarity
- pgvector: 벡터 검색
```

## 💰 수익화 전략

### 1. Freemium Model
```
무료:
- Daily Meditation 참여
- 기본 Taste Match (1일 3명)
- Art Pulse 보기만

프리미엄 ($9.99/월):
- 무제한 Taste Match
- Art Pulse 우선 매칭
- 고급 통계 및 인사이트
- 광고 제거
```

### 2. B2B Partnership
```
갤러리/미술관:
- Audience Intelligence 리포트
- 실시간 관람객 감정 데이터
- 전시 후 매칭 스폰서십
- 월 $299-999
```

## 📊 성공 지표

### 단기 (3개월)
- DAU: 10,000명
- 7-day retention: 40%
- Daily Meditation 완료율: 60%
- Taste Match 전환율: 25%

### 중기 (6개월)
- DAU: 50,000명
- 유료 전환율: 8%
- 평균 세션 시간: 12분
- 월간 매칭 수: 100,000건

## 🚨 리스크 및 대응 방안

### 1. 기술적 리스크
- **iOS 위젯 제한**: 대안으로 Live Activity 활용
- **실시간 부하**: 시간대별 분산, 지역별 순차 오픈
- **매칭 정확도**: 지속적인 ML 모델 개선

### 2. 비즈니스 리스크
- **콜드 스타트**: 초기 유저는 AI 봇과 매칭
- **지역 편중**: 서울 → 수도권 → 전국 단계적 확장
- **콘텐츠 부족**: 파트너십 통한 작품 DB 확보

## 🎨 디자인 원칙

### 1. 감정 중심 UI
- 색상으로 감정 표현
- 미니멀하되 따뜻한 디자인
- 16개 유형별 테마 변화

### 2. 점진적 공개
- 처음엔 추상적, 점차 구체적으로
- 호기심 유발하는 정보 설계
- 스토리텔링 요소 강화

### 3. 무의식적 사용
- 복잡한 설정 없이 바로 시작
- 직관적인 제스처 기반 인터랙션
- 자연스러운 습관 형성

## 🚀 런칭 전략

### Soft Launch (Week 1-2)
- 타겟: 예술 전공 대학생 500명
- 채널: 대학 미술 동아리
- 목표: 버그 수정, UX 개선

### Beta Launch (Week 3-4)
- 타겟: 얼리어답터 2,000명
- 채널: 인스타그램 예술 계정
- 목표: 바이럴 요소 검증

### Official Launch (Week 5+)
- 타겟: 전시회 관람객
- 채널: 갤러리 파트너십
- 목표: 일 1,000 신규 가입

---

이 로드맵을 따라 단계적으로 구현하면, SAYU는 단순한 예술 큐레이션 앱을 넘어 **예술을 통한 의미 있는 연결**을 만드는 플랫폼으로 자리잡을 수 있을 것입니다.



// Taste Match - 전시 후 72시간 한정 익명 취향 매칭
// Gas의 익명성 + 긍정적 피드백 메커니즘 적용

import { createClient } from '@supabase/supabase-js';
import { calculateCosineSimilarity } from '@/utils/similarity';

// 매칭 프로필 구조
interface TasteMatchProfile {
  userId: string;
  exhibitionId: string;
  visitTimestamp: Date;
  artworkEngagements: ArtworkEngagement[];
  emotionalJourney: EmotionalPoint[];
  isAnonymous: boolean;
  revealLevel: 0 | 1 | 2 | 3; // 0: 완전익명, 3: 완전공개
}

interface ArtworkEngagement {
  artworkId: string;
  viewDuration: number; // 초
  emotionalTags: string[];
  gazeHeatmap?: number[][]; // 선택적: 시선 추적 데이터
  savedToCollection: boolean;
}

interface EmotionalPoint {
  timestamp: number;
  emotion: string;
  intensity: number;
  artworkId?: string;
}

// Taste Match 서비스
export class TasteMatchService {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // 전시 관람 완료 후 매칭 활성화
  async activatePostExhibitionMatch(
    userId: string,
    exhibitionId: string,
    visitData: {
      startTime: Date;
      endTime: Date;
      artworkEngagements: ArtworkEngagement[];
      emotionalJourney: EmotionalPoint[];
    }
  ): Promise<void> {
    // 1. 전시 관람 데이터 저장
    const { data: exhibitionVisit } = await this.supabase
      .from('exhibition_visits')
      .insert({
        user_id: userId,
        exhibition_id: exhibitionId,
        start_time: visitData.startTime,
        end_time: visitData.endTime,
        total_duration: (visitData.endTime.getTime() - visitData.startTime.getTime()) / 1000,
        artwork_count: visitData.artworkEngagements.length,
        emotional_summary: this.summarizeEmotions(visitData.emotionalJourney)
      })
      .select()
      .single();

    // 2. 상세 관람 데이터 저장
    await this.supabase
      .from('artwork_engagements')
      .insert(
        visitData.artworkEngagements.map(engagement => ({
          visit_id: exhibitionVisit.id,
          artwork_id: engagement.artworkId,
          view_duration: engagement.viewDuration,
          emotional_tags: engagement.emotionalTags,
          saved_to_collection: engagement.savedToCollection
        }))
      );

    // 3. 72시간 매칭 세션 생성
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    
    await this.supabase
      .from('taste_match_sessions')
      .insert({
        user_id: userId,
        exhibition_id: exhibitionId,
        visit_id: exhibitionVisit.id,
        expires_at: expiresAt,
        is_active: true,
        reveal_level: 0 // 익명으로 시작
      });

    // 4. 매칭 풀에 추가 및 즉시 매칭 시도
    await this.findMatches(userId, exhibitionId, exhibitionVisit.id);
  }

  // 매칭 알고리즘
  async findMatches(
    userId: string,
    exhibitionId: string,
    visitId: string
  ): Promise<TasteMatchResult[]> {
    // 1. 같은 전시를 72시간 이내 관람한 사용자들
    const { data: recentVisitors } = await this.supabase
      .from('taste_match_sessions')
      .select(`
        *,
        exhibition_visits (
          *,
          artwork_engagements (*)
        )
      `)
      .eq('exhibition_id', exhibitionId)
      .eq('is_active', true)
      .neq('user_id', userId)
      .gte('expires_at', new Date().toISOString());

    if (!recentVisitors || recentVisitors.length === 0) {
      return [];
    }

    // 2. 현재 사용자의 관람 데이터
    const { data: myVisit } = await this.supabase
      .from('exhibition_visits')
      .select(`
        *,
        artwork_engagements (*)
      `)
      .eq('id', visitId)
      .single();

    // 3. 취향 유사도 계산
    const matches = await Promise.all(
      recentVisitors.map(async (visitor) => {
        const similarity = await this.calculateTasteSimilarity(
          myVisit,
          visitor.exhibition_visits
        );

        return {
          matchUserId: visitor.user_id,
          similarity,
          commonArtworks: this.findCommonArtworks(
            myVisit.artwork_engagements,
            visitor.exhibition_visits.artwork_engagements
          ),
          emotionalResonance: this.calculateEmotionalResonance(
            myVisit.emotional_summary,
            visitor.exhibition_visits.emotional_summary
          ),
          revealLevel: visitor.reveal_level
        };
      })
    );

    // 4. 유사도 높은 순으로 정렬
    const topMatches = matches
      .filter(m => m.similarity > 0.7) // 70% 이상 유사도
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // 상위 5명

    // 5. 매칭 결과 저장 및 알림
    for (const match of topMatches) {
      await this.createMatch(userId, match.matchUserId, exhibitionId, match);
    }

    return topMatches;
  }

  // 취향 유사도 계산 (다차원 분석)
  private async calculateTasteSimilarity(
    visit1: any,
    visit2: any
  ): Promise<number> {
    // 1. 작품별 체류 시간 패턴 유사도 (30%)
    const durationSimilarity = this.compareViewingPatterns(
      visit1.artwork_engagements,
      visit2.artwork_engagements
    );

    // 2. 감정 태그 유사도 (40%)
    const emotionSimilarity = this.compareEmotionalResponses(
      visit1.artwork_engagements,
      visit2.artwork_engagements
    );

    // 3. 저장한 작품 겹침도 (20%)
    const collectionSimilarity = this.compareCollections(
      visit1.artwork_engagements,
      visit2.artwork_engagements
    );

    // 4. 관람 속도/스타일 유사도 (10%)
    const styleSimilarity = this.compareViewingStyles(visit1, visit2);

    return (
      durationSimilarity * 0.3 +
      emotionSimilarity * 0.4 +
      collectionSimilarity * 0.2 +
      styleSimilarity * 0.1
    );
  }

  // 익명 매칭 메시지 시스템
  async sendAnonymousMessage(
    fromUserId: string,
    toUserId: string,
    matchId: string,
    message: string
  ): Promise<void> {
    const { data: match } = await this.supabase
      .from('taste_matches')
      .select('reveal_level_from, reveal_level_to')
      .eq('id', matchId)
      .single();

    // 발신자의 공개 수준에 따라 정보 결정
    let senderInfo = {
      id: 'anonymous',
      nickname: this.generateArtisticNickname(),
      avatar: this.getAnonymousAvatar(fromUserId)
    };

    if (match.reveal_level_from >= 1) {
      senderInfo.nickname = await this.getUserNickname(fromUserId);
    }
    
    if (match.reveal_level_from >= 2) {
      const profile = await this.getUserProfile(fromUserId);
      senderInfo.avatar = profile.avatar_url;
    }

    // 메시지 전송
    await this.supabase
      .from('match_messages')
      .insert({
        match_id: matchId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        message,
        sender_info: senderInfo,
        is_anonymous: match.reveal_level_from < 3
      });

    // 수신자에게 알림
    await this.sendMatchNotification(toUserId, {
      type: 'new_message',
      title: '새로운 취향 메시지',
      body: `${senderInfo.nickname}: ${message.substring(0, 50)}...`,
      data: { match_id: matchId }
    });
  }

  // 단계별 정체성 공개
  async revealIdentity(
    userId: string,
    matchId: string,
    newLevel: 0 | 1 | 2 | 3
  ): Promise<void> {
    const { data: match } = await this.supabase
      .from('taste_matches')
      .select('*')
      .eq('id', matchId)
      .single();

    const isFromUser = match.from_user_id === userId;
    const updateField = isFromUser ? 'reveal_level_from' : 'reveal_level_to';

    await this.supabase
      .from('taste_matches')
      .update({ [updateField]: newLevel })
      .eq('id', matchId);

    // 상대방에게 알림
    const otherUserId = isFromUser ? match.to_user_id : match.from_user_id;
    const levelDescriptions = [
      '익명 유지',
      '닉네임 공개',
      '프로필 일부 공개',
      '완전 공개 (연결 요청)'
    ];

    await this.sendMatchNotification(otherUserId, {
      type: 'reveal_update',
      title: '취향 매치 업데이트',
      body: `상대방이 ${levelDescriptions[newLevel]}했습니다`,
      data: { match_id: matchId, new_level: newLevel }
    });

    // 양쪽 모두 레벨 3이면 실제 연결
    if (newLevel === 3) {
      const otherLevel = isFromUser ? match.reveal_level_to : match.reveal_level_from;
      if (otherLevel === 3) {
        await this.createRealConnection(match.from_user_id, match.to_user_id);
      }
    }
  }

  // 매칭 UI 컴포넌트
  async getMatchCard(matchId: string, viewerUserId: string): Promise<MatchCard> {
    const { data: match } = await this.supabase
      .from('taste_matches')
      .select(`
        *,
        exhibition:exhibitions(title, gallery_name),
        messages:match_messages(count)
      `)
      .eq('id', matchId)
      .single();

    const isFromUser = match.from_user_id === viewerUserId;
    const otherUserId = isFromUser ? match.to_user_id : match.from_user_id;
    const myRevealLevel = isFromUser ? match.reveal_level_from : match.reveal_level_to;
    const theirRevealLevel = isFromUser ? match.reveal_level_to : match.reveal_level_from;

    return {
      matchId,
      exhibition: match.exhibition,
      similarity: match.similarity_score,
      commonArtworks: match.common_artworks,
      emotionalResonance: match.emotional_resonance,
      myRevealLevel,
      theirRevealLevel,
      messageCount: match.messages[0].count,
      expiresIn: this.calculateTimeRemaining(match.expires_at),
      matchHighlights: await this.generateMatchHighlights(match)
    };
  }

  // 매치 하이라이트 생성 (왜 매칭되었는지)
  private async generateMatchHighlights(match: any): Promise<string[]> {
    const highlights = [];

    if (match.similarity_score > 0.9) {
      highlights.push('🎯 거의 완벽한 취향 일치 (90%+)');
    }

    if (match.common_artworks.length > 5) {
      highlights.push(`🖼️ ${match.common_artworks.length}개 작품에서 비슷한 감상`);
    }

    if (match.emotional_resonance > 0.8) {
      highlights.push('💫 감정적 공명도가 매우 높음');
    }

    // 구체적인 공통점
    const topEmotion = match.common_emotions[0];
    if (topEmotion) {
      highlights.push(`😊 둘 다 "${topEmotion}"을 주로 느낌`);
    }

    return highlights;
  }

  // 예술적 닉네임 생성기
  private generateArtisticNickname(): string {
    const adjectives = [
      '몽환적인', '초현실적인', '감각적인', '서정적인', '역동적인',
      '미니멀한', '표현적인', '추상적인', '낭만적인', '전위적인'
    ];
    
    const nouns = [
      '산책자', '관찰자', '수집가', '탐험가', '몽상가',
      '여행자', '기록자', '추구자', '발견자', '감상자'
    ];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adj} ${noun}`;
  }

  // 72시간 카운트다운
  private calculateTimeRemaining(expiresAt: Date): string {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return '만료됨';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}일 ${hours % 24}시간 남음`;
    }
    
    return `${hours}시간 ${minutes}분 남음`;
  }
}

// React 컴포넌트 예시
export const TasteMatchCard: React.FC<{ matchId: string }> = ({ matchId }) => {
  const [match, setMatch] = useState<MatchCard | null>(null);
  const [message, setMessage] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);

  const handleReveal = async (newLevel: number) => {
    setIsRevealing(true);
    await tasteMatchService.revealIdentity(currentUser.id, matchId, newLevel);
    // 매치 정보 새로고침
    const updated = await tasteMatchService.getMatchCard(matchId, currentUser.id);
    setMatch(updated);
    setIsRevealing(false);
  };

  const revealSteps = [
    { level: 1, label: '닉네임 공개', icon: '🏷️' },
    { level: 2, label: '프로필 공개', icon: '👤' },
    { level: 3, label: '연결 요청', icon: '🤝' }
  ];

  return (
    <View style={styles.matchCard}>
      {/* 전시 정보 */}
      <View style={styles.exhibitionInfo}>
        <Text style={styles.exhibitionTitle}>{match?.exhibition.title}</Text>
        <Text style={styles.expiryTimer}>⏰ {match?.expiresIn}</Text>
      </View>

      {/* 매칭 점수 및 하이라이트 */}
      <View style={styles.matchScore}>
        <Text style={styles.similarity}>{Math.round(match?.similarity * 100)}% 취향 일치</Text>
        {match?.matchHighlights.map((highlight, idx) => (
          <Text key={idx} style={styles.highlight}>{highlight}</Text>
        ))}
      </View>

      {/* 단계별 공개 버튼 */}
      <View style={styles.revealSteps}>
        {revealSteps.map((step) => (
          <TouchableOpacity
            key={step.level}
            style={[
              styles.revealButton,
              match?.myRevealLevel >= step.level && styles.revealButtonActive
            ]}
            onPress={() => handleReveal(step.level)}
            disabled={match?.myRevealLevel >= step.level || isRevealing}
          >
            <Text>{step.icon} {step.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 메시지 입력 */}
      <View style={styles.messageSection}>
        <TextInput
          style={styles.messageInput}
          placeholder="취향에 대해 대화를 시작해보세요..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => sendMessage(message)}
        >
          <Text>전송</Text>
        </TouchableOpacity>
      </View>

      {/* 상대방 공개 수준 표시 */}
      <View style={styles.theirStatus}>
        <Text style={styles.statusText}>
          상대방: {getRevealLevelText(match?.theirRevealLevel)}
        </Text>
      </View>
    </View>
  );
};




// Art Pulse - 실시간 감정 동기화 위젯
// BeReal의 동시성 + Locket의 홈스크린 전략 결합

import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/realtime-js';

// 홈스크린 위젯 데이터 구조
interface ArtPulseWidget {
  currentArtwork: {
    id: string;
    title: string;
    artist: string;
    thumbnail_url: string;
  };
  emotionalState: {
    primary: string;
    intensity: number;
    totalViewers: number;
    similarUsers: UserProfile[];
  };
  pulseTime: string; // 매일 저녁 7시
}

// 실시간 감정 동기화 서비스
export class ArtPulseService {
  private supabase;
  private channel: RealtimeChannel | null = null;
  private currentArtworkId: string | null = null;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // 매일 저녁 7시 Art Pulse 시작
  async initiateDailyPulse(): Promise<void> {
    // 1. 오늘의 Pulse 작품 선정 (감정 다양성이 높은 작품)
    const { data: artwork } = await this.supabase
      .from('artworks')
      .select('*')
      .order('emotional_diversity_score', { ascending: false })
      .order('view_count', { ascending: true }) // 덜 본 작품 우선
      .limit(1)
      .single();

    if (!artwork) return;

    this.currentArtworkId = artwork.id;

    // 2. Pulse 세션 생성
    const { data: pulseSession } = await this.supabase
      .from('art_pulse_sessions')
      .insert({
        artwork_id: artwork.id,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30분간
        is_active: true
      })
      .select()
      .single();

    // 3. 실시간 채널 구독
    this.channel = this.supabase.channel(`art-pulse-${pulseSession.id}`)
      .on('presence', { event: 'sync' }, () => {
        this.updateEmotionalSync();
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('New user joined pulse:', key);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left pulse:', key);
      })
      .subscribe();

    // 4. 모든 활성 사용자에게 푸시 알림
    await this.sendPulseNotification(artwork);
  }

  // 사용자 감정 상태 전송
  async broadcastEmotion(
    userId: string,
    emotion: string,
    intensity: number,
    coordinates?: { x: number; y: number } // 작품의 어느 부분을 보고 있는지
  ): Promise<void> {
    if (!this.channel) return;

    // Presence 상태 업데이트
    await this.channel.track({
      user_id: userId,
      emotion,
      intensity,
      coordinates,
      timestamp: new Date().toISOString()
    });

    // 감정 히스토리 저장
    await this.supabase
      .from('pulse_emotions')
      .insert({
        user_id: userId,
        artwork_id: this.currentArtworkId,
        emotion,
        intensity,
        coordinates
      });
  }

  // 실시간 감정 동기화 상태 계산
  private async updateEmotionalSync(): Promise<EmotionalSyncState> {
    const state = await this.channel!.presenceState();
    const activeUsers = Object.values(state).flat();

    // 감정 클러스터링
    const emotionClusters = this.clusterEmotions(activeUsers);
    
    // 나와 비슷한 감정을 느끼는 사용자들 찾기
    const currentUserEmotion = activeUsers.find(u => u.user_id === currentUserId);
    const similarUsers = this.findSimilarUsers(currentUserEmotion, activeUsers);

    // 위젯 업데이트를 위한 데이터
    return {
      totalViewers: activeUsers.length,
      dominantEmotion: emotionClusters[0]?.emotion || 'neutral',
      emotionDistribution: emotionClusters,
      similarUsers: similarUsers.slice(0, 3), // 상위 3명만
      synchronicityScore: this.calculateSynchronicity(activeUsers)
    };
  }

  // 감정 클러스터링 알고리즘
  private clusterEmotions(users: any[]): EmotionCluster[] {
    const emotionGroups = users.reduce((acc, user) => {
      const emotion = user.emotion || 'neutral';
      if (!acc[emotion]) acc[emotion] = [];
      acc[emotion].push(user);
      return acc;
    }, {});

    return Object.entries(emotionGroups)
      .map(([emotion, users]: [string, any[]]) => ({
        emotion,
        count: users.length,
        percentage: (users.length / users.length) * 100,
        avgIntensity: users.reduce((sum, u) => sum + u.intensity, 0) / users.length
      }))
      .sort((a, b) => b.count - a.count);
  }

  // 비슷한 사용자 찾기
  private findSimilarUsers(currentUser: any, allUsers: any[]): any[] {
    if (!currentUser) return [];

    return allUsers
      .filter(u => u.user_id !== currentUser.user_id)
      .map(user => ({
        ...user,
        similarity: this.calculateEmotionalSimilarity(currentUser, user)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .filter(u => u.similarity > 0.7); // 70% 이상 유사도
  }

  // 감정 유사도 계산
  private calculateEmotionalSimilarity(user1: any, user2: any): number {
    const emotionMatch = user1.emotion === user2.emotion ? 0.5 : 0;
    const intensityDiff = Math.abs(user1.intensity - user2.intensity) / 10;
    const intensityMatch = (1 - intensityDiff) * 0.3;
    
    // 시선 위치 유사도 (선택적)
    let coordinateMatch = 0.2;
    if (user1.coordinates && user2.coordinates) {
      const distance = Math.sqrt(
        Math.pow(user1.coordinates.x - user2.coordinates.x, 2) +
        Math.pow(user1.coordinates.y - user2.coordinates.y, 2)
      );
      coordinateMatch = (1 - Math.min(distance / 100, 1)) * 0.2;
    }

    return emotionMatch + intensityMatch + coordinateMatch;
  }

  // 동기화 점수 계산 (얼마나 많은 사람이 비슷한 감정을 느끼는지)
  private calculateSynchronicity(users: any[]): number {
    if (users.length < 2) return 0;

    const dominantEmotion = this.clusterEmotions(users)[0];
    return (dominantEmotion.count / users.length) * 100;
  }
}

// React Native 위젯 컴포넌트 (iOS)
export const ArtPulseWidget: React.FC = () => {
  const [pulseData, setPulseData] = useState<ArtPulseWidget | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const artPulse = new ArtPulseService();
    
    // 매일 저녁 7시 체크
    const checkPulseTime = () => {
      const now = new Date();
      if (now.getHours() === 19 && now.getMinutes() < 30) {
        setIsActive(true);
        artPulse.initiateDailyPulse();
      }
    };

    const interval = setInterval(checkPulseTime, 60000);
    checkPulseTime();

    return () => clearInterval(interval);
  }, []);

  if (!isActive || !pulseData) {
    return <InactiveWidget />;
  }

  return (
    <View style={styles.widget}>
      {/* 작품 썸네일 */}
      <Image 
        source={{ uri: pulseData.currentArtwork.thumbnail_url }}
        style={styles.artworkThumbnail}
      />

      {/* 실시간 감정 상태 */}
      <View style={styles.emotionalState}>
        <Text style={styles.viewerCount}>
          🔥 {pulseData.emotionalState.totalViewers}명이 지금 함께 보는 중
        </Text>
        
        {/* 나와 비슷한 감정의 사용자들 */}
        <View style={styles.similarUsers}>
          {pulseData.emotionalState.similarUsers.map((user, idx) => (
            <Image
              key={idx}
              source={{ uri: user.avatar_url }}
              style={styles.userAvatar}
            />
          ))}
          {pulseData.emotionalState.similarUsers.length > 3 && (
            <Text style={styles.moreUsers}>
              +{pulseData.emotionalState.similarUsers.length - 3}
            </Text>
          )}
        </View>

        <Text style={styles.emotionSync}>
          "{pulseData.emotionalState.primary}" 89% 동기화
        </Text>
      </View>

      {/* 탭하면 앱 열기 */}
      <TouchableOpacity onPress={() => openApp('art-pulse')}>
        <Text style={styles.cta}>참여하기 →</Text>
      </TouchableOpacity>
    </View>
  );
};

// 푸시 알림 전송
async function sendPulseNotification(artwork: any): Promise<void> {
  const { data: activeUsers } = await supabase
    .from('users')
    .select('id, push_token, notification_preferences')
    .eq('notification_preferences->art_pulse', true);

  const notifications = activeUsers?.map(user => ({
    to: user.push_token,
    title: '🎨 Art Pulse가 시작됩니다',
    body: `지금 ${artwork.artist}의 "${artwork.title}"을 함께 감상해요`,
    data: {
      type: 'art_pulse',
      artwork_id: artwork.id
    },
    ios: {
      sound: 'pulse.wav',
      badge: 1
    }
  }));

  // 배치 전송
  await sendBatchNotifications(notifications);
}

// 사용자 유형별 감정 표현 차이
const EMOTION_EXPRESSIONS = {
  // Gentle 계열은 부드러운 감정 표현
  'G_A_M_F': {
    emotions: ['평온한', '따뜻한', '포근한', '고요한'],
    intensityRange: [3, 7] // 중간 강도
  },
  // Sharp 계열은 강렬한 감정 표현  
  'S_R_E_F': {
    emotions: ['충격적인', '도발적인', '강렬한', '날카로운'],
    intensityRange: [6, 10] // 높은 강도
  },
  // ... 16가지 유형별 계속
};

// 위젯 스타일
const styles = StyleSheet.create({
  widget: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 16,
    height: 170,
    width: '100%'
  },
  artworkThumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    borderRadius: 20
  },
  emotionalState: {
    flex: 1,
    justifyContent: 'space-between'
  },
  viewerCount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  similarUsers: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: -8,
    borderWidth: 2,
    borderColor: '#1a1a1a'
  },
  emotionSync: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  cta: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right'
  }
});





// Daily Art Meditation 기능 구현
// 매일 아침 8시, 하나의 작품과 질문으로 시작하는 30초 명상

import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import type { Database } from '@/types/database';

// Supabase 클라이언트
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// OpenAI 클라이언트
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// 사용자 유형별 질문 템플릿
const QUESTION_TEMPLATES = {
  // Gentle 계열 (편안함 추구)
  'G_A_M_F': [
    '이 작품이 주는 첫 느낌을 한 단어로 표현한다면?',
    '이 작품 속에서 가장 편안한 공간은 어디일까요?',
    '이 색감이 떠올리게 하는 기억이 있나요?'
  ],
  'G_A_M_S': [
    '이 작품을 보며 떠오르는 음악이 있다면?',
    '작품 속 분위기를 날씨로 표현한다면?',
    '이 순간의 감정을 색으로 나타낸다면?'
  ],
  // Sharp 계열 (자극 추구)
  'S_R_E_F': [
    '이 작품이 던지는 질문은 무엇일까요?',
    '가장 도발적으로 느껴지는 부분은?',
    '이 작품이 깨뜨리려는 것은 무엇일까요?'
  ],
  // ... 16가지 유형별 질문 계속
};

// 일일 작품 선정 알고리즘
export async function selectDailyArtwork(): Promise<{
  artwork_id: string;
  artist: string;
  title: string;
  image_url: string;
  questions: Record<string, string>;
}> {
  // 1. 최근 7일간 선정되지 않은 작품 중에서 선택
  const { data: recentArtworks } = await supabase
    .from('daily_artworks')
    .select('artwork_id')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const recentIds = recentArtworks?.map(a => a.artwork_id) || [];

  // 2. 다양한 감정 스펙트럼을 가진 작품 우선 선정
  const { data: artwork } = await supabase
    .from('artworks')
    .select('*')
    .not('id', 'in', `(${recentIds.join(',')})`)
    .order('emotional_diversity_score', { ascending: false })
    .limit(1)
    .single();

  if (!artwork) throw new Error('No artwork available');

  // 3. 각 사용자 유형별 맞춤 질문 생성
  const questions: Record<string, string> = {};
  
  for (const [userType, templates] of Object.entries(QUESTION_TEMPLATES)) {
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // AI로 작품 특성에 맞게 질문 커스터마이징
    const { choices } = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an art meditation guide. Customize this question template for the artwork "${artwork.title}" by ${artwork.artist}. Keep it short and contemplative.`
        },
        {
          role: 'user',
          content: randomTemplate
        }
      ],
      temperature: 0.7,
      max_tokens: 50
    });

    questions[userType] = choices[0].message.content || randomTemplate;
  }

  // 4. 오늘의 작품으로 저장
  await supabase
    .from('daily_artworks')
    .insert({
      artwork_id: artwork.id,
      questions,
      meditation_date: new Date().toISOString().split('T')[0]
    });

  return {
    artwork_id: artwork.id,
    artist: artwork.artist,
    title: artwork.title,
    image_url: artwork.image_url,
    questions
  };
}

// 사용자 명상 참여 기록
export async function recordMeditation(
  userId: string,
  artworkId: string,
  response: string,
  emotionTags: string[],
  meditationDuration: number
) {
  // 1. 명상 기록 저장
  const { data: meditation } = await supabase
    .from('meditation_sessions')
    .insert({
      user_id: userId,
      artwork_id: artworkId,
      response,
      emotion_tags: emotionTags,
      duration_seconds: meditationDuration,
      completed_at: new Date().toISOString()
    })
    .select()
    .single();

  // 2. 사용자 통계 업데이트
  await supabase.rpc('increment_meditation_streak', { user_id: userId });

  // 3. 같은 시간대에 명상한 사용자들과 임시 채팅방 생성
  const { data: concurrentUsers } = await supabase
    .from('meditation_sessions')
    .select('user_id')
    .eq('artwork_id', artworkId)
    .gte('completed_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5분 이내
    .neq('user_id', userId);

  if (concurrentUsers && concurrentUsers.length >= 2) {
    await createMeditationChatRoom(
      artworkId,
      [userId, ...concurrentUsers.map(u => u.user_id)]
    );
  }

  return meditation;
}

// 명상 채팅방 생성 (24시간 한정)
async function createMeditationChatRoom(
  artworkId: string,
  userIds: string[]
) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data: chatRoom } = await supabase
    .from('meditation_chat_rooms')
    .insert({
      artwork_id: artworkId,
      participant_ids: userIds,
      expires_at: expiresAt,
      is_active: true
    })
    .select()
    .single();

  // 참여자들에게 알림 전송
  for (const userId of userIds) {
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'meditation_chat_created',
        title: '명상 채팅방이 열렸습니다',
        message: '같은 작품을 보며 명상한 사람들과 24시간 동안 대화할 수 있어요',
        data: { chat_room_id: chatRoom.id }
      });
  }

  return chatRoom;
}

// React 컴포넌트 예시
export const DailyMeditationComponent = () => {
  const [artwork, setArtwork] = useState(null);
  const [userResponse, setUserResponse] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [meditationStart, setMeditationStart] = useState(null);
  
  useEffect(() => {
    // 매일 아침 8시 체크
    const checkDailyArtwork = async () => {
      const now = new Date();
      if (now.getHours() === 8 && now.getMinutes() < 5) {
        const dailyArt = await selectDailyArtwork();
        setArtwork(dailyArt);
        setMeditationStart(Date.now());
      }
    };

    const interval = setInterval(checkDailyArtwork, 60000); // 1분마다 체크
    checkDailyArtwork(); // 초기 실행

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!artwork || !userResponse) return;

    const duration = Math.floor((Date.now() - meditationStart) / 1000);
    
    await recordMeditation(
      currentUser.id,
      artwork.artwork_id,
      userResponse,
      selectedEmotions,
      duration
    );

    // 완료 애니메이션 및 채팅방 안내
    showCompletionAnimation();
  };

  return (
    <div className="daily-meditation">
      {artwork && (
        <>
          <img src={artwork.image_url} alt={artwork.title} />
          <h3>{artwork.title}</h3>
          <p>{artwork.artist}</p>
          
          <div className="question">
            {artwork.questions[currentUser.personality_type]}
          </div>

          <textarea
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            placeholder="30초간 작품을 보며 떠오르는 생각을..."
            maxLength={200}
          />

          <EmotionSelector
            selected={selectedEmotions}
            onChange={setSelectedEmotions}
          />

          <button onClick={handleSubmit}>
            명상 완료
          </button>
        </>
      )}
    </div>
  );
};

// 감정 선택 컴포넌트
const EmotionSelector = ({ selected, onChange }) => {
  const emotions = [
    { id: 'peaceful', label: '평온한', color: '#E3F2FD' },
    { id: 'curious', label: '궁금한', color: '#FFF3E0' },
    { id: 'moved', label: '감동적인', color: '#FCE4EC' },
    { id: 'energized', label: '활력있는', color: '#E8F5E9' },
    { id: 'contemplative', label: '사색적인', color: '#F3E5F5' },
    { id: 'nostalgic', label: '그리운', color: '#FFF8E1' }
  ];

  return (
    <div className="emotion-selector">
      {emotions.map(emotion => (
        <button
          key={emotion.id}
          className={selected.includes(emotion.id) ? 'selected' : ''}
          style={{ backgroundColor: emotion.color }}
          onClick={() => {
            if (selected.includes(emotion.id)) {
              onChange(selected.filter(e => e !== emotion.id));
            } else {
              onChange([...selected, emotion.id]);
            }
          }}
        >
          {emotion.label}
        </button>
      ))}
    </div>
  );
};


