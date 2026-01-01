import { useMemo } from 'react';
import { useGameState } from './useGameState';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const useAnalytics = () => {
  const { habits, tasks, level, xp, xpToNextLevel } = useGameState();

  const weeklyData = useMemo(() => {
    return daysOfWeek.map((day, index) => {
      const habitsCompleted = habits.filter((h) => h.completedDays[index]).length;
      const totalHabits = habits.length || 1;
      const completion = Math.round((habitsCompleted / totalHabits) * 100);
      
      // Simulate task completion for the week (in real app, you'd track this)
      const tasksCompleted = index <= new Date().getDay() - 1 
        ? Math.floor(Math.random() * 5) + 1 
        : 0;

      return {
        day,
        completion,
        tasks: tasksCompleted,
        habitsCompleted,
      };
    });
  }, [habits]);

  const monthlyData = useMemo(() => {
    // Simulate monthly data (4 weeks)
    return [
      { week: 'Week 1', avgCompletion: 65, xpEarned: 320 },
      { week: 'Week 2', avgCompletion: 72, xpEarned: 415 },
      { week: 'Week 3', avgCompletion: 68, xpEarned: 380 },
      { week: 'Week 4', avgCompletion: Math.round(weeklyData.reduce((a, b) => a + b.completion, 0) / 7), xpEarned: (level - 1) * xpToNextLevel + xp },
    ];
  }, [weeklyData, level, xp, xpToNextLevel]);

  const habitBreakdown = useMemo(() => {
    return habits.map((habit) => ({
      name: habit.name,
      value: habit.completedDays.filter(Boolean).length,
    }));
  }, [habits]);

  const stats = useMemo(() => {
    const completionRates = weeklyData.map((d) => d.completion);
    const weeklyAvg = Math.round(completionRates.reduce((a, b) => a + b, 0) / 7);
    
    const maxCompletion = Math.max(...completionRates);
    const bestDayIndex = completionRates.indexOf(maxCompletion);
    const bestDay = daysOfWeek[bestDayIndex];
    
    const totalXP = (level - 1) * xpToNextLevel + xp;
    const perfectDays = completionRates.filter((c) => c === 100).length;

    return {
      weeklyAvg,
      bestDay,
      totalXP,
      perfectDays,
    };
  }, [weeklyData, level, xp, xpToNextLevel]);

  return {
    weeklyData,
    monthlyData,
    habitBreakdown,
    stats,
  };
};
