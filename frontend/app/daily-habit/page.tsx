import { Metadata } from 'next';
import DailyHabitDashboard from '@/components/daily-habit/DailyHabitDashboard';

export const metadata: Metadata = {
  title: 'Daily Art Habit - 일일 예술 습관 | SAYU',
  description: '매일 아침, 점심, 저녁 3분으로 시작하는 예술과 함께하는 일상 습관을 만들어보세요.',
};

export default function DailyHabitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DailyHabitDashboard />
    </div>
  );
}