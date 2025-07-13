# 📅 SAYU 전시 캘린더 & 알림 시스템

## 시스템 개요

전시 일정 관리와 스마트 알림을 통해 사용자가 관심 있는 전시를 놓치지 않도록 돕는 통합 시스템입니다.

### 핵심 기능
1. **전시 캘린더**: 월간/주간/일간 뷰, 필터링, 검색
2. **스마트 알림**: 개인화된 알림, 시간대별 최적화
3. **일정 동기화**: Google Calendar, Apple Calendar 연동
4. **그룹 일정**: 친구와 함께 관람 계획
5. **위치 기반 알림**: 전시장 근처 도착 시 알림

## 📊 데이터베이스 스키마

```sql
-- 전시 일정 테이블
CREATE TABLE exhibition_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID REFERENCES exhibitions(id),
  
  -- 기본 일정 정보
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- 운영 시간
  opening_hours JSONB DEFAULT '{
    "mon": {"open": "10:00", "close": "18:00"},
    "tue": {"open": "10:00", "close": "18:00"},
    "wed": {"open": "10:00", "close": "18:00"},
    "thu": {"open": "10:00", "close": "20:00"},
    "fri": {"open": "10:00", "close": "20:00"},
    "sat": {"open": "10:00", "close": "18:00"},
    "sun": {"open": "10:00", "close": "18:00"}
  }',
  
  -- 특별 일정
  special_events JSONB[], -- 오프닝, 작가와의 만남 등
  holidays JSONB[], -- 휴관일
  
  -- 가격 정보
  pricing JSONB DEFAULT '{
    "adult": 15000,
    "student": 10000,
    "child": 5000,
    "group": {"min": 20, "discount": 0.2}
  }',
  
  -- 예약 정보
  reservation_required BOOLEAN DEFAULT false,
  reservation_url VARCHAR(500),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 캘린더 이벤트
CREATE TABLE user_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  exhibition_id UUID REFERENCES exhibitions(id),
  
  -- 이벤트 정보
  event_type VARCHAR(50), -- 'plan', 'visited', 'reminder'
  planned_date DATE,
  planned_time TIME,
  
  -- 그룹 정보
  group_id UUID,
  attendees UUID[],
  
  -- 알림 설정
  reminder_settings JSONB DEFAULT '{
    "enabled": true,
    "times": ["1d", "1h", "30m"]
  }',
  
  -- 메모
  notes TEXT,
  
  -- 상태
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 알림 설정
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  
  -- 전역 설정
  enabled BOOLEAN DEFAULT true,
  quiet_hours JSONB DEFAULT '{
    "enabled": true,
    "start": "22:00",
    "end": "08:00"
  }',
  
  -- 알림 유형별 설정
  notification_types JSONB DEFAULT '{
    "new_exhibition": true,
    "ending_soon": true,
    "price_drop": true,
    "friend_going": true,
    "reminder": true,
    "weekly_digest": true,
    "location_based": true
  }',
  
  -- 채널 설정
  channels JSONB DEFAULT '{
    "push": true,
    "email": true,
    "sms": false,
    "in_app": true
  }',
  
  -- 개인화 설정
  preferences JSONB DEFAULT '{
    "advance_notice": "3d",
    "preferred_time": "10:00",
    "max_per_day": 5,
    "grouping": true
  }',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 알림 큐
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  
  -- 알림 내용
  type VARCHAR(50),
  title VARCHAR(200),
  body TEXT,
  data JSONB,
  
  -- 전송 정보
  channels VARCHAR(50)[],
  scheduled_for TIMESTAMPTZ,
  
  -- 상태
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  error TEXT,
  
  -- 우선순위
  priority INTEGER DEFAULT 5,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_exhibition_schedules_dates ON exhibition_schedules(start_date, end_date);
CREATE INDEX idx_user_calendar_events_user_date ON user_calendar_events(user_id, planned_date);
CREATE INDEX idx_notification_queue_scheduled ON notification_queue(scheduled_for, status);
CREATE INDEX idx_notification_queue_user ON notification_queue(user_id, created_at DESC);
```

## 🎯 백엔드 구현

### 1. 캘린더 서비스

```javascript
// services/calendarService.js
class CalendarService {
  constructor() {
    this.cache = new Redis();
    this.notificationService = new NotificationService();
  }

  // 월간 캘린더 데이터
  async getMonthlyCalendar(userId, year, month, options = {}) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // 캐시 확인
    const cacheKey = `calendar:${userId}:${year}-${month}`;
    const cached = await this.cache.get(cacheKey);
    if (cached && !options.force) {
      return JSON.parse(cached);
    }
    
    // 데이터 조회
    const [exhibitions, userEvents, holidays] = await Promise.all([
      this.getExhibitionsInRange(startDate, endDate, options.filters),
      this.getUserEvents(userId, startDate, endDate),
      this.getHolidays(year, month)
    ]);
    
    // 캘린더 데이터 구성
    const calendar = this.buildCalendarData({
      exhibitions,
      userEvents,
      holidays,
      userId
    });
    
    // 캐싱 (1시간)
    await this.cache.setex(cacheKey, 3600, JSON.stringify(calendar));
    
    return calendar;
  }
  
  // 전시 일정 추가
  async addToCalendar(userId, exhibitionId, data) {
    const { plannedDate, plannedTime, notes, attendees } = data;
    
    // 중복 확인
    const existing = await db.query(
      'SELECT id FROM user_calendar_events WHERE user_id = $1 AND exhibition_id = $2 AND planned_date = $3',
      [userId, exhibitionId, plannedDate]
    );
    
    if (existing.rows.length > 0) {
      throw new Error('Already added to calendar');
    }
    
    // 이벤트 생성
    const event = await db.query(`
      INSERT INTO user_calendar_events 
      (user_id, exhibition_id, event_type, planned_date, planned_time, notes, attendees)
      VALUES ($1, $2, 'plan', $3, $4, $5, $6)
      RETURNING *
    `, [userId, exhibitionId, plannedDate, plannedTime, notes, attendees]);
    
    // 알림 스케줄링
    await this.scheduleReminders(event.rows[0]);
    
    // 친구 알림
    if (attendees && attendees.length > 0) {
      await this.notifyAttendees(event.rows[0]);
    }
    
    return event.rows[0];
  }
  
  // 스마트 추천 시간대
  async suggestBestTimes(exhibitionId, userId, date) {
    const [exhibition, userPatterns, crowdData] = await Promise.all([
      this.getExhibitionSchedule(exhibitionId),
      this.getUserTimePatterns(userId),
      this.getCrowdPrediction(exhibitionId, date)
    ]);
    
    const suggestions = [];
    
    // 사용자 선호 시간대
    if (userPatterns.preferredTimes) {
      suggestions.push({
        time: userPatterns.preferredTimes[0],
        reason: '평소 선호하시는 시간대',
        crowdLevel: crowdData[userPatterns.preferredTimes[0]] || 'medium'
      });
    }
    
    // 한산한 시간대
    const quietTimes = this.findQuietTimes(crowdData);
    suggestions.push({
      time: quietTimes[0],
      reason: '예상 관람객이 적은 시간',
      crowdLevel: 'low'
    });
    
    // 특별 프로그램 시간
    if (exhibition.specialEvents) {
      exhibition.specialEvents
        .filter(e => e.date === date)
        .forEach(event => {
          suggestions.push({
            time: event.time,
            reason: event.title,
            type: 'special',
            crowdLevel: 'high'
          });
        });
    }
    
    return suggestions.slice(0, 3);
  }
}
```

### 2. 알림 서비스

```javascript
// services/notificationService.js
class NotificationService {
  constructor() {
    this.queue = new Bull('notifications');
    this.pushService = new PushNotificationService();
    this.emailService = new EmailService();
    this.smsService = new SMSService();
  }
  
  // 알림 스케줄링
  async scheduleNotification(userId, notification, scheduledFor) {
    // 사용자 설정 확인
    const preferences = await this.getUserPreferences(userId);
    
    if (!preferences.enabled) return null;
    
    // 조용한 시간 확인
    const adjustedTime = this.adjustForQuietHours(
      scheduledFor,
      preferences.quiet_hours
    );
    
    // 큐에 추가
    const job = await this.queue.add('send-notification', {
      userId,
      notification,
      preferences
    }, {
      delay: adjustedTime - Date.now(),
      priority: notification.priority || 5,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });
    
    return job.id;
  }
  
  // 스마트 알림 생성
  async createSmartNotifications(userId) {
    const notifications = [];
    
    // 1. 곧 종료되는 관심 전시
    const endingSoon = await this.getEndingSoonExhibitions(userId);
    endingSoon.forEach(exhibition => {
      if (exhibition.matchScore > 0.7) {
        notifications.push({
          type: 'ending_soon',
          title: '곧 종료되는 추천 전시',
          body: `"${exhibition.title}"이 ${exhibition.daysLeft}일 후 종료됩니다`,
          data: { exhibitionId: exhibition.id },
          priority: 8
        });
      }
    });
    
    // 2. 친구가 가는 전시
    const friendsGoing = await this.getFriendsExhibitions(userId);
    if (friendsGoing.length > 0) {
      notifications.push({
        type: 'friend_going',
        title: '친구들이 관심있어 하는 전시',
        body: `${friendsGoing[0].friendNames.join(', ')}님이 "${friendsGoing[0].exhibition.title}"에 갈 예정입니다`,
        data: { exhibitionId: friendsGoing[0].exhibition.id },
        priority: 6
      });
    }
    
    // 3. 주간 다이제스트
    if (new Date().getDay() === 1) { // 월요일
      const digest = await this.createWeeklyDigest(userId);
      notifications.push({
        type: 'weekly_digest',
        title: '이번 주 추천 전시',
        body: `${digest.count}개의 새로운 전시가 기다리고 있습니다`,
        data: { digest },
        priority: 5
      });
    }
    
    // 4. 위치 기반 알림 설정
    await this.setupLocationBasedNotifications(userId);
    
    return notifications;
  }
  
  // 그룹 알림
  async notifyGroup(groupId, notification) {
    const members = await this.getGroupMembers(groupId);
    
    const jobs = members.map(member => 
      this.scheduleNotification(member.userId, {
        ...notification,
        data: {
          ...notification.data,
          groupId,
          groupName: member.groupName
        }
      }, notification.scheduledFor)
    );
    
    return Promise.all(jobs);
  }
}
```

## 🎨 프론트엔드 구현

### 1. 캘린더 컴포넌트

```tsx
// components/calendar/ExhibitionCalendar.tsx
'use client';

import { useState, useMemo } from 'react';
import { useCalendar } from '@/hooks/useCalendar';
import { CalendarView } from './CalendarView';
import { CalendarFilters } from './CalendarFilters';
import { EventDetail } from './EventDetail';

export function ExhibitionCalendar() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState({
    genres: [],
    locations: [],
    priceRange: null,
    showUserEvents: true,
    showHolidays: true
  });
  
  const { calendar, isLoading, addEvent, removeEvent } = useCalendar({
    date: selectedDate,
    view,
    filters
  });
  
  // 날짜별 이벤트 그룹핑
  const eventsByDate = useMemo(() => {
    if (!calendar) return {};
    
    return calendar.events.reduce((acc, event) => {
      const dateKey = event.date.toISOString().split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {});
  }, [calendar]);
  
  return (
    <div className="exhibition-calendar">
      {/* 헤더 */}
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button onClick={() => navigateDate(-1)}>
            <ChevronLeft />
          </button>
          <h2>{formatDateHeader(selectedDate, view)}</h2>
          <button onClick={() => navigateDate(1)}>
            <ChevronRight />
          </button>
        </div>
        
        <div className="calendar-controls">
          <ViewSelector value={view} onChange={setView} />
          <CalendarFilters 
            filters={filters}
            onChange={setFilters}
          />
          <button onClick={() => setSelectedDate(new Date())}>
            오늘
          </button>
        </div>
      </div>
      
      {/* 캘린더 뷰 */}
      <CalendarView
        view={view}
        date={selectedDate}
        events={eventsByDate}
        onDateSelect={setSelectedDate}
        onEventClick={handleEventClick}
        isLoading={isLoading}
      />
      
      {/* 선택된 날짜의 이벤트 목록 */}
      <div className="selected-date-events">
        <h3>{formatDate(selectedDate)} 전시 일정</h3>
        {eventsByDate[selectedDate.toISOString().split('T')[0]]?.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onAdd={() => addEvent(event)}
            onRemove={() => removeEvent(event.id)}
          />
        ))}
      </div>
    </div>
  );
}

// 이벤트 카드 컴포넌트
function EventCard({ event, onAdd, onRemove }) {
  const [showDetail, setShowDetail] = useState(false);
  
  return (
    <div className="event-card">
      <div className="event-main">
        <img src={event.exhibition.thumbnail} alt={event.exhibition.title} />
        
        <div className="event-info">
          <h4>{event.exhibition.title}</h4>
          <p className="venue">{event.exhibition.venue}</p>
          <div className="event-meta">
            <span className="time">
              {event.startTime} - {event.endTime}
            </span>
            {event.price && (
              <span className="price">{event.price.toLocaleString()}원</span>
            )}
          </div>
        </div>
        
        <div className="event-actions">
          {event.isUserEvent ? (
            <button onClick={onRemove} className="remove-btn">
              <X /> 일정 취소
            </button>
          ) : (
            <button onClick={onAdd} className="add-btn">
              <Plus /> 내 일정 추가
            </button>
          )}
          <button onClick={() => setShowDetail(!showDetail)}>
            <Info /> 상세
          </button>
        </div>
      </div>
      
      {showDetail && <EventDetail event={event} />}
    </div>
  );
}
```

### 2. 알림 설정 컴포넌트

```tsx
// components/notifications/NotificationSettings.tsx
export function NotificationSettings() {
  const { preferences, updatePreferences } = useNotificationPreferences();
  const [testLoading, setTestLoading] = useState(false);
  
  const handleToggle = (key: string, value: boolean) => {
    updatePreferences({
      ...preferences,
      [key]: value
    });
  };
  
  const sendTestNotification = async () => {
    setTestLoading(true);
    try {
      await notificationAPI.sendTest();
      toast.success('테스트 알림을 전송했습니다');
    } catch (error) {
      toast.error('알림 전송에 실패했습니다');
    } finally {
      setTestLoading(false);
    }
  };
  
  return (
    <div className="notification-settings">
      <h3>알림 설정</h3>
      
      {/* 전역 설정 */}
      <section className="settings-section">
        <h4>기본 설정</h4>
        <Toggle
          label="알림 받기"
          checked={preferences.enabled}
          onChange={(v) => handleToggle('enabled', v)}
        />
        
        <div className="quiet-hours">
          <Toggle
            label="방해 금지 시간"
            checked={preferences.quietHours.enabled}
            onChange={(v) => updatePreferences({
              ...preferences,
              quietHours: { ...preferences.quietHours, enabled: v }
            })}
          />
          {preferences.quietHours.enabled && (
            <div className="time-range">
              <TimePicker
                label="시작"
                value={preferences.quietHours.start}
                onChange={(v) => updatePreferences({
                  ...preferences,
                  quietHours: { ...preferences.quietHours, start: v }
                })}
              />
              <TimePicker
                label="종료"
                value={preferences.quietHours.end}
                onChange={(v) => updatePreferences({
                  ...preferences,
                  quietHours: { ...preferences.quietHours, end: v }
                })}
              />
            </div>
          )}
        </div>
      </section>
      
      {/* 알림 유형 */}
      <section className="settings-section">
        <h4>알림 유형</h4>
        <div className="notification-types">
          {Object.entries(NOTIFICATION_TYPES).map(([key, info]) => (
            <div key={key} className="notification-type">
              <Toggle
                label={info.label}
                description={info.description}
                checked={preferences.notificationTypes[key]}
                onChange={(v) => updatePreferences({
                  ...preferences,
                  notificationTypes: {
                    ...preferences.notificationTypes,
                    [key]: v
                  }
                })}
              />
            </div>
          ))}
        </div>
      </section>
      
      {/* 채널 설정 */}
      <section className="settings-section">
        <h4>알림 방법</h4>
        <div className="channels">
          <Toggle
            label="푸시 알림"
            checked={preferences.channels.push}
            onChange={(v) => updatePreferences({
              ...preferences,
              channels: { ...preferences.channels, push: v }
            })}
          />
          <Toggle
            label="이메일"
            checked={preferences.channels.email}
            onChange={(v) => updatePreferences({
              ...preferences,
              channels: { ...preferences.channels, email: v }
            })}
          />
          <Toggle
            label="SMS"
            checked={preferences.channels.sms}
            onChange={(v) => updatePreferences({
              ...preferences,
              channels: { ...preferences.channels, sms: v }
            })}
          />
        </div>
      </section>
      
      {/* 고급 설정 */}
      <section className="settings-section">
        <h4>고급 설정</h4>
        <div className="advanced-settings">
          <Select
            label="사전 알림 시간"
            value={preferences.preferences.advanceNotice}
            onChange={(v) => updatePreferences({
              ...preferences,
              preferences: { ...preferences.preferences, advanceNotice: v }
            })}
            options={[
              { value: '30m', label: '30분 전' },
              { value: '1h', label: '1시간 전' },
              { value: '1d', label: '1일 전' },
              { value: '3d', label: '3일 전' },
              { value: '1w', label: '1주일 전' }
            ]}
          />
          
          <NumberInput
            label="일일 최대 알림 수"
            value={preferences.preferences.maxPerDay}
            min={1}
            max={20}
            onChange={(v) => updatePreferences({
              ...preferences,
              preferences: { ...preferences.preferences, maxPerDay: v }
            })}
          />
        </div>
      </section>
      
      {/* 테스트 */}
      <button 
        onClick={sendTestNotification}
        disabled={testLoading}
        className="test-notification-btn"
      >
        {testLoading ? '전송 중...' : '테스트 알림 보내기'}
      </button>
    </div>
  );
}
```

### 3. 일정 추가 모달

```tsx
// components/calendar/AddEventModal.tsx
export function AddEventModal({ exhibition, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    date: new Date(),
    time: '14:00',
    notes: '',
    reminder: '1d',
    inviteFriends: false,
    friends: []
  });
  
  const { friends } = useFriends();
  const { suggestedTimes, isLoading } = useSuggestedTimes(
    exhibition.id,
    formData.date
  );
  
  const handleSubmit = async () => {
    try {
      await onAdd({
        exhibitionId: exhibition.id,
        plannedDate: formData.date,
        plannedTime: formData.time,
        notes: formData.notes,
        reminderSettings: {
          enabled: true,
          times: [formData.reminder]
        },
        attendees: formData.inviteFriends ? formData.friends : []
      });
      
      toast.success('일정이 추가되었습니다');
      onClose();
    } catch (error) {
      toast.error('일정 추가에 실패했습니다');
    }
  };
  
  return (
    <Modal isOpen onClose={onClose}>
      <div className="add-event-modal">
        <h3>전시 일정 추가</h3>
        
        <div className="exhibition-preview">
          <img src={exhibition.thumbnail} alt={exhibition.title} />
          <div>
            <h4>{exhibition.title}</h4>
            <p>{exhibition.venue}</p>
          </div>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {/* 날짜 선택 */}
          <DatePicker
            label="관람 날짜"
            value={formData.date}
            onChange={(date) => setFormData({ ...formData, date })}
            minDate={new Date()}
            maxDate={new Date(exhibition.endDate)}
          />
          
          {/* 추천 시간대 */}
          {suggestedTimes && suggestedTimes.length > 0 && (
            <div className="suggested-times">
              <label>추천 시간대</label>
              <div className="time-suggestions">
                {suggestedTimes.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      time: suggestion.time 
                    })}
                    className={`suggestion ${formData.time === suggestion.time ? 'selected' : ''}`}
                  >
                    <span className="time">{suggestion.time}</span>
                    <span className="reason">{suggestion.reason}</span>
                    <CrowdIndicator level={suggestion.crowdLevel} />
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* 시간 선택 */}
          <TimePicker
            label="관람 시간"
            value={formData.time}
            onChange={(time) => setFormData({ ...formData, time })}
          />
          
          {/* 메모 */}
          <TextArea
            label="메모"
            value={formData.notes}
            onChange={(notes) => setFormData({ ...formData, notes })}
            placeholder="함께 갈 사람, 준비물 등을 메모하세요"
          />
          
          {/* 알림 설정 */}
          <Select
            label="알림"
            value={formData.reminder}
            onChange={(reminder) => setFormData({ ...formData, reminder })}
            options={[
              { value: 'none', label: '알림 없음' },
              { value: '30m', label: '30분 전' },
              { value: '1h', label: '1시간 전' },
              { value: '1d', label: '1일 전' },
              { value: '3d', label: '3일 전' }
            ]}
          />
          
          {/* 친구 초대 */}
          <div className="invite-section">
            <Toggle
              label="친구 초대"
              checked={formData.inviteFriends}
              onChange={(v) => setFormData({ ...formData, inviteFriends: v })}
            />
            
            {formData.inviteFriends && (
              <FriendSelector
                friends={friends}
                selected={formData.friends}
                onChange={(friends) => setFormData({ ...formData, friends })}
              />
            )}
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="primary">
              일정 추가
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
```

## 🔌 API 엔드포인트

```javascript
// routes/calendarRoutes.js
router.get('/calendar/monthly', auth, calendarController.getMonthlyCalendar);
router.get('/calendar/events', auth, calendarController.getUserEvents);
router.post('/calendar/events', auth, calendarController.addEvent);
router.put('/calendar/events/:id', auth, calendarController.updateEvent);
router.delete('/calendar/events/:id', auth, calendarController.removeEvent);
router.get('/calendar/suggestions', auth, calendarController.getSuggestedTimes);
router.post('/calendar/sync', auth, calendarController.syncExternalCalendar);

// routes/notificationRoutes.js
router.get('/notifications/preferences', auth, notificationController.getPreferences);
router.put('/notifications/preferences', auth, notificationController.updatePreferences);
router.get('/notifications/history', auth, notificationController.getHistory);
router.post('/notifications/test', auth, notificationController.sendTest);
router.post('/notifications/register-token', auth, notificationController.registerPushToken);
router.delete('/notifications/:id', auth, notificationController.markAsRead);
```

## 📱 푸시 알림 설정

### Web Push 구현
```javascript
// utils/webPush.js
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:support@sayu.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: payload.data,
        actions: payload.actions || []
      })
    );
  } catch (error) {
    if (error.statusCode === 410) {
      // 구독 만료 - 삭제
      await removeSubscription(subscription.endpoint);
    }
    throw error;
  }
}
```

### Service Worker
```javascript
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: data.data,
    actions: data.actions,
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const notification = event.notification;
  
  if (action === 'view') {
    clients.openWindow(`/exhibitions/${notification.data.exhibitionId}`);
  } else if (action === 'dismiss') {
    // 알림 무시
  } else {
    // 기본 동작
    clients.openWindow('/');
  }
});
```

## 🌍 외부 캘린더 연동

### Google Calendar 연동
```javascript
// services/googleCalendarService.js
const { google } = require('googleapis');

class GoogleCalendarService {
  async addEvent(tokens, eventData) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const event = {
      summary: eventData.title,
      location: eventData.venue,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime,
        timeZone: 'Asia/Seoul'
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'Asia/Seoul'
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 }
        ]
      }
    };
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });
    
    return response.data;
  }
}
```

## 📊 분석 및 최적화

### 알림 효과성 분석
```javascript
// analytics/notificationAnalytics.js
class NotificationAnalytics {
  async trackNotification(notificationId, event) {
    await analytics.track({
      userId: notification.userId,
      event: `notification_${event}`,
      properties: {
        notificationId,
        type: notification.type,
        channel: notification.channel,
        timestamp: new Date()
      }
    });
  }
  
  async getNotificationMetrics() {
    const metrics = await db.query(`
      SELECT 
        type,
        COUNT(*) as sent_count,
        COUNT(opened_at) as opened_count,
        COUNT(opened_at)::float / COUNT(*)::float as open_rate,
        AVG(EXTRACT(EPOCH FROM (opened_at - sent_at))) as avg_open_time
      FROM notification_queue
      WHERE sent_at > NOW() - INTERVAL '30 days'
      GROUP BY type
    `);
    
    return metrics.rows;
  }
}
```

## 🚀 구현 우선순위

### Phase 1 (Week 1)
1. 기본 캘린더 UI 구현
2. 전시 일정 표시
3. 사용자 이벤트 추가/삭제

### Phase 2 (Week 2)
1. 알림 시스템 백엔드
2. 푸시 알림 구현
3. 알림 설정 UI

### Phase 3 (Week 3)
1. 스마트 추천 기능
2. 그룹 일정 기능
3. 외부 캘린더 연동

### Phase 4 (Week 4)
1. 위치 기반 알림
2. 분석 대시보드
3. 성능 최적화

## 성공 지표

- 일정 추가율 30% 증가
- 알림 오픈율 25% 이상
- 전시 방문 전환율 20% 향상
- 사용자 만족도 4.5/5 이상