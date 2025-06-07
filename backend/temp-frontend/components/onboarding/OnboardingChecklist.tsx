'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Circle, 
  Gift, 
  Sparkles,
  Brain,
  MessageSquare,
  Palette,
  Trophy,
  ChevronRight,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  route?: string;
  completed: boolean;
  reward?: string;
}

export function OnboardingChecklist() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const [tasks, setTasks] = useState<OnboardingTask[]>([
    {
      id: 'complete-quiz',
      title: 'Complete Personality Assessment',
      description: 'Discover your unique aesthetic personality',
      icon: <Brain className="w-5 h-5" />,
      action: 'Complete Assessment',
      route: '/quiz',
      completed: false,
      reward: 'Unlock personalized theme'
    },
    {
      id: 'chat-curator',
      title: 'Chat with AI Curator',
      description: 'Have your first conversation about art',
      icon: <MessageSquare className="w-5 h-5" />,
      action: 'Start Chat',
      route: '/agent',
      completed: false,
      reward: 'Earn "First Contact" achievement'
    },
    {
      id: 'explore-gallery',
      title: 'Explore Curated Gallery',
      description: 'View personalized art recommendations',
      icon: <Palette className="w-5 h-5" />,
      action: 'Browse Gallery',
      route: '/gallery',
      completed: false,
      reward: 'Unlock daily recommendations'
    },
    {
      id: 'first-achievement',
      title: 'Earn First Achievement',
      description: 'Complete any achievement to start your collection',
      icon: <Trophy className="w-5 h-5" />,
      action: 'View Achievements',
      route: '/profile',
      completed: false,
      reward: 'Unlock achievement showcase'
    }
  ]);

  useEffect(() => {
    // Load completed tasks from localStorage
    const completed = localStorage.getItem('onboardingCompleted');
    if (completed) {
      const completedTasks = JSON.parse(completed);
      setTasks(prev => prev.map(task => ({
        ...task,
        completed: completedTasks.includes(task.id)
      })));
    }
  }, []);

  const handleTaskAction = (task: OnboardingTask) => {
    if (task.route) {
      router.push(task.route);
    }
  };

  const markTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));
    
    // Save to localStorage
    const completed = tasks.filter(t => t.completed || t.id === taskId).map(t => t.id);
    localStorage.setItem('onboardingCompleted', JSON.stringify(completed));
    
    // Show reward toast
    const task = tasks.find(t => t.id === taskId);
    if (task?.reward) {
      toast.success(`🎉 ${task.reward}`, {
        duration: 4000,
        position: 'top-center'
      });
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = (completedCount / totalCount) * 100;
  const allCompleted = completedCount === totalCount;

  if (allCompleted && !isExpanded) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-40 max-w-md"
    >
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800">
        {/* Header */}
        <div 
          className="p-4 border-b border-gray-800 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="w-6 h-6 text-purple-400" />
                {!allCompleted && completedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white">Getting Started</h3>
                <p className="text-sm text-gray-400">
                  {allCompleted 
                    ? 'All tasks completed! 🎉' 
                    : `${completedCount} of ${totalCount} completed`
                  }
                </p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white">
              {isExpanded ? <X className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          {/* Progress Bar */}
          {!allCompleted && (
            <div className="mt-3">
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tasks */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border transition-colors ${
                      task.completed 
                        ? 'bg-gray-800/50 border-gray-700' 
                        : 'bg-gray-800 border-gray-700 hover:border-purple-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${task.completed ? 'text-green-400' : 'text-gray-400'}`}>
                        {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {task.description}
                        </p>
                        {task.reward && !task.completed && (
                          <p className="text-xs text-purple-400 mt-1 flex items-center gap-1">
                            <Gift className="w-3 h-3" />
                            {task.reward}
                          </p>
                        )}
                        {!task.completed && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTaskAction(task)}
                            className="mt-2 text-purple-400 hover:text-purple-300 p-0 h-auto"
                          >
                            {task.action}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {allCompleted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-white mb-1">Congratulations!</h4>
                    <p className="text-sm text-gray-400">
                      You've completed all onboarding tasks. Enjoy your journey!
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}