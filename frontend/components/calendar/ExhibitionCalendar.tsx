'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Bell, Filter, Grid, List } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Exhibition {
  id: string;
  title: string;
  institution_name: string;
  city: string;
  start_date: string;
  end_date: string;
  poster_url?: string;
  genres: string[];
  has_notification: boolean;
  is_visited: boolean;
  distance_km?: number;
}

interface CalendarDay {
  date: Date;
  exhibitions: Exhibition[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface ExhibitionCalendarProps {
  initialDate?: Date;
  viewMode?: 'month' | 'week' | 'list';
  showFilters?: boolean;
  userId?: string;
}

export default function ExhibitionCalendar({
  initialDate = new Date(),
  viewMode: initialViewMode = 'month',
  showFilters = true,
  userId
}: ExhibitionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [calendarData, setCalendarData] = useState<Record<string, Exhibition[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    genres: [],
    showPersonalizedOnly: false
  });

  useEffect(() => {
    loadCalendarData();
  }, [currentDate, filters]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
        ...(userId && { userId }),
        ...(filters.location && { location: filters.location }),
        ...(filters.genres.length > 0 && { genres: filters.genres.join(',') }),
        showPersonalizedOnly: filters.showPersonalizedOnly.toString()
      });

      const response = await fetch(`/api/calendar/monthly?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setCalendarData(data.calendar);
      }
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    return days.map(date => ({
      date,
      exhibitions: calendarData[format(date, 'yyyy-MM-dd')] || [],
      isCurrentMonth: isSameMonth(date, currentDate),
      isToday: isSameDay(date, new Date())
    }));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const toggleNotification = async (exhibitionId: string) => {
    try {
      await fetch('/api/calendar/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          exhibitionId,
          preferences: {
            notifyBefore: [7, 1],
            quietHours: { start: 22, end: 8 }
          }
        })
      });
      
      // 데이터 새로고침
      loadCalendarData();
    } catch (error) {
      console.error('Failed to toggle notification:', error);
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-bold">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* 뷰 모드 선택 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded ${
                viewMode === 'month' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {showFilters && (
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* 캘린더 뷰 */}
      {!loading && viewMode === 'month' && (
        <div className="grid grid-cols-7 gap-1">
          {/* 요일 헤더 */}
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}

          {/* 캘린더 날짜 */}
          {calendarDays.map((day, index) => (
            <motion.div
              key={index}
              className={`
                min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all
                ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${day.isToday ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}
                hover:shadow-md
              `}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleDateClick(day.date)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`
                  text-sm font-medium
                  ${day.isToday ? 'text-purple-700' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                `}>
                  {format(day.date, 'd')}
                </span>
                
                {day.exhibitions.length > 0 && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                    {day.exhibitions.length}
                  </span>
                )}
              </div>

              {/* 전시 목록 (최대 3개) */}
              <div className="space-y-1">
                {day.exhibitions.slice(0, 3).map((exhibition, idx) => (
                  <div
                    key={idx}
                    className="text-xs p-1.5 bg-gradient-to-r from-purple-100 to-pink-100 
                             text-purple-800 rounded truncate"
                    title={exhibition.title}
                  >
                    {exhibition.title}
                  </div>
                ))}
                
                {day.exhibitions.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{day.exhibitions.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 리스트 뷰 */}
      {!loading && viewMode === 'list' && (
        <div className="space-y-4">
          {calendarDays
            .filter(day => day.exhibitions.length > 0)
            .map((day, index) => (
              <motion.div
                key={index}
                className="border rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="font-bold text-lg mb-3">
                  {format(day.date, 'M월 d일 (eee)', { locale: ko })}
                  {day.isToday && (
                    <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      오늘
                    </span>
                  )}
                </h3>
                
                <div className="grid gap-3">
                  {day.exhibitions.map((exhibition) => (
                    <ExhibitionListItem
                      key={exhibition.id}
                      exhibition={exhibition}
                      onToggleNotification={toggleNotification}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
        </div>
      )}

      {/* 상세 모달 */}
      <AnimatePresence>
        {selectedDate && (
          <DayDetailModal
            date={selectedDate}
            exhibitions={calendarData[format(selectedDate, 'yyyy-MM-dd')] || []}
            onClose={() => setSelectedDate(null)}
            onToggleNotification={toggleNotification}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// 전시 리스트 아이템 컴포넌트
function ExhibitionListItem({ 
  exhibition, 
  onToggleNotification 
}: { 
  exhibition: Exhibition;
  onToggleNotification: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium">{exhibition.title}</h4>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{exhibition.institution_name}</span>
          </div>
          {exhibition.distance_km && (
            <span>{exhibition.distance_km.toFixed(1)}km</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {exhibition.genres.slice(0, 2).map((genre, idx) => (
          <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {genre}
          </span>
        ))}
        
        <button
          onClick={() => onToggleNotification(exhibition.id)}
          className={`p-2 rounded-lg transition-colors ${
            exhibition.has_notification
              ? 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200'
              : 'text-gray-400 hover:bg-gray-200'
          }`}
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// 일별 상세 모달
function DayDetailModal({
  date,
  exhibitions,
  onClose,
  onToggleNotification
}: {
  date: Date;
  exhibitions: Exhibition[];
  onClose: () => void;
  onToggleNotification: (id: string) => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {format(date, 'M월 d일 (eee)', { locale: ko })}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {exhibitions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            이 날에는 전시가 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {exhibitions.map((exhibition) => (
              <div key={exhibition.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{exhibition.title}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{exhibition.institution_name}, {exhibition.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(exhibition.start_date), 'M/d')} - {format(new Date(exhibition.end_date), 'M/d')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      {exhibition.genres.map((genre, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onToggleNotification(exhibition.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      exhibition.has_notification
                        ? 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200'
                        : 'text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}