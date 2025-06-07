'use client';

import { motion } from 'framer-motion';

interface ChartContainerProps {
  title: string;
  icon: React.ReactNode;
  data: any[];
  type: 'hourly' | 'weekly' | 'line' | 'bar';
  height?: number;
}

export function ChartContainer({ title, icon, data, type, height = 300 }: ChartContainerProps) {
  const renderHourlyChart = () => {
    if (!data || data.length === 0) return <div className="text-gray-400">No data available</div>;

    const maxValue = Math.max(...data.map(d => d.interaction_count || 0));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>12 AM</span>
        </div>
        
        <div className="flex items-end justify-between gap-1" style={{ height: height - 60 }}>
          {hours.map(hour => {
            const hourData = data.find(d => d.hour === hour);
            const value = hourData?.interaction_count || 0;
            const barHeight = maxValue > 0 ? (value / maxValue) * (height - 100) : 0;
            
            return (
              <motion.div
                key={hour}
                initial={{ height: 0 }}
                animate={{ height: barHeight }}
                transition={{ delay: hour * 0.02, duration: 0.5 }}
                className="flex-1 bg-gradient-to-t from-purple-500/60 to-purple-400/60 rounded-t-sm min-h-[2px] relative group"
                style={{ height: Math.max(barHeight, 2) }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {hour === 0 ? '12 AM' : hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}: {value}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeeklyChart = () => {
    if (!data || data.length === 0) return <div className="text-gray-400">No data available</div>;

    const maxValue = Math.max(...data.map(d => d.interaction_count || 0));
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4" style={{ height: height - 60 }}>
          {daysOfWeek.map((day, dayIndex) => {
            const dayData = data.find(d => d.day_of_week === dayIndex);
            const value = dayData?.interaction_count || 0;
            const barHeight = maxValue > 0 ? (value / maxValue) * (height - 100) : 0;
            
            return (
              <div key={dayIndex} className="flex flex-col items-center gap-2 flex-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: barHeight }}
                  transition={{ delay: dayIndex * 0.1, duration: 0.6 }}
                  className="w-full bg-gradient-to-t from-blue-500/60 to-blue-400/60 rounded-t-lg min-h-[2px] relative group"
                  style={{ height: Math.max(barHeight, 2) }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {day}: {value} interactions
                  </div>
                </motion.div>
                <span className="text-xs text-gray-400">{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'hourly':
        return renderHourlyChart();
      case 'weekly':
        return renderWeeklyChart();
      default:
        return <div className="text-gray-400">Chart type not implemented</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
          <div className="text-purple-400">
            {icon}
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div style={{ height }}>
        {renderChart()}
      </div>
    </motion.div>
  );
}