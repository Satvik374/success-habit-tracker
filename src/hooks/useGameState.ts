import { useState, useEffect, useCallback, useRef } from 'react';
import type { Task } from '@/components/TaskList';
import { achievementDefinitions, Achievement } from '@/components/Achievements';
import { toast } from 'sonner';
import { useCelebration } from './useCelebration';

interface Habit {
  id: string;
  name: string;
  icon: string;
  completedDays: boolean[];
}

interface GameState {
  level: number;
  xp: number;
  totalXpEarned: number;
  streak: number;
  habits: Habit[];
  tasks: Task[];
  lastActiveDate: string;
  unlockedAchievements: string[];
  perfectDays: number;
}

const XP_PER_LEVEL = 500;

const defaultHabits: Habit[] = [
  { id: '1', name: 'Exercise', icon: '💪', completedDays: [false, false, false, false, false, false, false] },
  { id: '2', name: 'Read', icon: '📚', completedDays: [false, false, false, false, false, false, false] },
  { id: '3', name: 'Meditate', icon: '🧘', completedDays: [false, false, false, false, false, false, false] },
  { id: '4', name: 'Drink Water', icon: '💧', completedDays: [false, false, false, false, false, false, false] },
];

const defaultTasks: Task[] = [
  { id: '1', title: 'Complete morning routine', completed: false, xpReward: 25, priority: 'high' },
  { id: '2', title: 'Work on main project', completed: false, xpReward: 50, priority: 'high' },
  { id: '3', title: 'Review goals', completed: false, xpReward: 10, priority: 'low' },
];

const getToday = () => new Date().toISOString().split('T')[0];

export const useGameState = () => {
  const celebration = useCelebration();
  const prevLevelRef = useRef<number | null>(null);
  
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('habitTrackerGameState');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.lastActiveDate !== getToday()) {
        const resetHabits = parsed.habits.map((h: Habit) => ({
          ...h,
          completedDays: [false, false, false, false, false, false, false],
        }));
        const resetTasks = parsed.tasks.map((t: Task) => ({ ...t, completed: false }));
        return {
          ...parsed,
          habits: resetHabits,
          tasks: resetTasks,
          lastActiveDate: getToday(),
          totalXpEarned: parsed.totalXpEarned || 0,
          unlockedAchievements: parsed.unlockedAchievements || [],
          perfectDays: parsed.perfectDays || 0,
        };
      }
      return {
        ...parsed,
        totalXpEarned: parsed.totalXpEarned || 0,
        unlockedAchievements: parsed.unlockedAchievements || [],
        perfectDays: parsed.perfectDays || 0,
      };
    }
    return {
      level: 1,
      xp: 0,
      totalXpEarned: 0,
      streak: 1,
      habits: defaultHabits,
      tasks: defaultTasks,
      lastActiveDate: getToday(),
      unlockedAchievements: [],
      perfectDays: 0,
    };
  });

  useEffect(() => {
    localStorage.setItem('habitTrackerGameState', JSON.stringify(state));
  }, [state]);

  // Track level changes for celebration
  useEffect(() => {
    if (prevLevelRef.current !== null && state.level > prevLevelRef.current) {
      celebration.triggerLevelUp(state.level);
    }
    prevLevelRef.current = state.level;
  }, [state.level, celebration]);

  const unlockAchievement = useCallback((achievementId: string, currentUnlocked: string[]) => {
    if (currentUnlocked.includes(achievementId)) return false;
    
    const achievement = achievementDefinitions.find((a) => a.id === achievementId);
    if (achievement) {
      toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
        description: achievement.description,
        duration: 4000,
      });
      celebration.triggerAchievement();
    }
    return true;
  }, [celebration]);

  const checkAndUnlockAchievements = useCallback((currentState: GameState): string[] => {
    const newUnlocks: string[] = [];
    const todayIndex = new Date().getDay();
    const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1;
    
    // Check first habit
    const anyHabitComplete = currentState.habits.some((h) => h.completedDays.some(Boolean));
    if (anyHabitComplete && !currentState.unlockedAchievements.includes('first_habit')) {
      if (unlockAchievement('first_habit', currentState.unlockedAchievements)) {
        newUnlocks.push('first_habit');
      }
    }
    
    // Check first task
    const anyTaskComplete = currentState.tasks.some((t) => t.completed);
    if (anyTaskComplete && !currentState.unlockedAchievements.includes('first_task') && !newUnlocks.includes('first_task')) {
      if (unlockAchievement('first_task', [...currentState.unlockedAchievements, ...newUnlocks])) {
        newUnlocks.push('first_task');
      }
    }
    
    // Check streak achievements
    if (currentState.streak >= 3 && !currentState.unlockedAchievements.includes('streak_3') && !newUnlocks.includes('streak_3')) {
      if (unlockAchievement('streak_3', [...currentState.unlockedAchievements, ...newUnlocks])) {
        newUnlocks.push('streak_3');
      }
    }
    if (currentState.streak >= 7 && !currentState.unlockedAchievements.includes('streak_7') && !newUnlocks.includes('streak_7')) {
      if (unlockAchievement('streak_7', [...currentState.unlockedAchievements, ...newUnlocks])) {
        newUnlocks.push('streak_7');
      }
    }
    
    // Check level achievements
    if (currentState.level >= 5 && !currentState.unlockedAchievements.includes('level_5') && !newUnlocks.includes('level_5')) {
      if (unlockAchievement('level_5', [...currentState.unlockedAchievements, ...newUnlocks])) {
        newUnlocks.push('level_5');
      }
    }
    if (currentState.level >= 10 && !currentState.unlockedAchievements.includes('level_10') && !newUnlocks.includes('level_10')) {
      if (unlockAchievement('level_10', [...currentState.unlockedAchievements, ...newUnlocks])) {
        newUnlocks.push('level_10');
      }
    }
    
    // Check XP achievements
    if (currentState.totalXpEarned >= 500 && !currentState.unlockedAchievements.includes('xp_500') && !newUnlocks.includes('xp_500')) {
      if (unlockAchievement('xp_500', [...currentState.unlockedAchievements, ...newUnlocks])) {
        newUnlocks.push('xp_500');
      }
    }
    if (currentState.totalXpEarned >= 2000 && !currentState.unlockedAchievements.includes('xp_2000') && !newUnlocks.includes('xp_2000')) {
      if (unlockAchievement('xp_2000', [...currentState.unlockedAchievements, ...newUnlocks])) {
        newUnlocks.push('xp_2000');
      }
    }
    
    // Check habit count
    if (currentState.habits.length >= 5 && !currentState.unlockedAchievements.includes('habits_5') && !newUnlocks.includes('habits_5')) {
      if (unlockAchievement('habits_5', [...currentState.unlockedAchievements, ...newUnlocks])) {
        newUnlocks.push('habits_5');
      }
    }
    
    // Check perfect day
    const habitsCompleted = currentState.habits.filter((h) => h.completedDays[adjustedIndex]).length;
    const tasksCompleted = currentState.tasks.filter((t) => t.completed).length;
    const totalItems = currentState.habits.length + currentState.tasks.length;
    if (totalItems > 0 && habitsCompleted + tasksCompleted === totalItems) {
      if (!currentState.unlockedAchievements.includes('perfect_day') && !newUnlocks.includes('perfect_day')) {
        if (unlockAchievement('perfect_day', [...currentState.unlockedAchievements, ...newUnlocks])) {
          newUnlocks.push('perfect_day');
        }
      }
    }
    
    return newUnlocks;
  }, [unlockAchievement]);

  const toggleHabit = (habitId: string, dayIndex: number) => {
    setState((prev) => {
      const habit = prev.habits.find((h) => h.id === habitId);
      if (!habit) return prev;
      
      const wasCompleted = habit.completedDays[dayIndex];
      const xpChange = wasCompleted ? -15 : 15;
      
      // Trigger celebration for completing (not uncompleting)
      if (!wasCompleted) {
        celebration.triggerHabitComplete();
      }
      
      const newHabits = prev.habits.map((h) =>
        h.id === habitId
          ? { ...h, completedDays: h.completedDays.map((c, i) => (i === dayIndex ? !c : c)) }
          : h
      );
      
      let newXP = prev.xp + xpChange;
      let newLevel = prev.level;
      const newTotalXp = prev.totalXpEarned + (xpChange > 0 ? xpChange : 0);
      
      if (newXP >= XP_PER_LEVEL) {
        newXP -= XP_PER_LEVEL;
        newLevel++;
        toast.success(`🎉 Level Up! You're now Level ${newLevel}!`);
      } else if (newXP < 0) {
        newXP = 0;
      }
      
      const newState = { ...prev, habits: newHabits, xp: newXP, level: newLevel, totalXpEarned: newTotalXp };
      const newUnlocks = checkAndUnlockAchievements(newState);
      
      // Check for perfect day
      const todayIdx = new Date().getDay();
      const adjustedIdx = todayIdx === 0 ? 6 : todayIdx - 1;
      const habitsComplete = newState.habits.filter((h) => h.completedDays[adjustedIdx]).length;
      const tasksComplete = newState.tasks.filter((t) => t.completed).length;
      const totalItems = newState.habits.length + newState.tasks.length;
      if (totalItems > 0 && habitsComplete + tasksComplete === totalItems && !wasCompleted) {
        celebration.triggerPerfectDay();
      }
      
      return {
        ...newState,
        unlockedAchievements: [...newState.unlockedAchievements, ...newUnlocks],
      };
    });
  };

  const addHabit = (name: string, icon: string) => {
    setState((prev) => {
      const newState = {
        ...prev,
        habits: [
          ...prev.habits,
          { id: Date.now().toString(), name, icon, completedDays: [false, false, false, false, false, false, false] },
        ],
      };
      const newUnlocks = checkAndUnlockAchievements(newState);
      return {
        ...newState,
        unlockedAchievements: [...newState.unlockedAchievements, ...newUnlocks],
      };
    });
  };

  const deleteHabit = (habitId: string) => {
    setState((prev) => ({ ...prev, habits: prev.habits.filter((h) => h.id !== habitId) }));
  };

  const toggleTask = (taskId: string) => {
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;
      
      const wasCompleted = task.completed;
      const xpChange = wasCompleted ? -task.xpReward : task.xpReward;
      
      // Trigger celebration for completing (not uncompleting)
      if (!wasCompleted) {
        celebration.triggerTaskComplete();
      }
      
      const newTasks = prev.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      
      let newXP = prev.xp + xpChange;
      let newLevel = prev.level;
      const newTotalXp = prev.totalXpEarned + (xpChange > 0 ? xpChange : 0);
      
      if (newXP >= XP_PER_LEVEL) {
        newXP -= XP_PER_LEVEL;
        newLevel++;
        toast.success(`🎉 Level Up! You're now Level ${newLevel}!`);
      } else if (newXP < 0) {
        newXP = 0;
      }
      
      const newState = { ...prev, tasks: newTasks, xp: newXP, level: newLevel, totalXpEarned: newTotalXp };
      const newUnlocks = checkAndUnlockAchievements(newState);
      
      // Check for perfect day
      const todayIdx = new Date().getDay();
      const adjustedIdx = todayIdx === 0 ? 6 : todayIdx - 1;
      const habitsComplete = newState.habits.filter((h) => h.completedDays[adjustedIdx]).length;
      const tasksComplete = newState.tasks.filter((t) => t.completed).length;
      const totalItems = newState.habits.length + newState.tasks.length;
      if (totalItems > 0 && habitsComplete + tasksComplete === totalItems && !wasCompleted) {
        celebration.triggerPerfectDay();
      }
      
      return {
        ...newState,
        unlockedAchievements: [...newState.unlockedAchievements, ...newUnlocks],
      };
    });
  };

  const addTask = (title: string, priority: 'low' | 'medium' | 'high') => {
    const xpRewards = { low: 10, medium: 25, high: 50 };
    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { id: Date.now().toString(), title, completed: false, xpReward: xpRewards[priority], priority }],
    }));
  };

  const deleteTask = (taskId: string) => {
    setState((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) }));
  };

  const calculateCompletionRate = () => {
    const todayIndex = new Date().getDay();
    const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1;
    
    const habitsCompleted = state.habits.filter((h) => h.completedDays[adjustedIndex]).length;
    const tasksCompleted = state.tasks.filter((t) => t.completed).length;
    const totalItems = state.habits.length + state.tasks.length;
    
    if (totalItems === 0) return 0;
    return Math.round(((habitsCompleted + tasksCompleted) / totalItems) * 100);
  };

  const achievements: Achievement[] = achievementDefinitions.map((def) => ({
    ...def,
    unlocked: state.unlockedAchievements.includes(def.id),
  }));

  return {
    level: state.level,
    xp: state.xp,
    xpToNextLevel: XP_PER_LEVEL,
    streak: state.streak,
    habits: state.habits,
    tasks: state.tasks,
    completionRate: calculateCompletionRate(),
    achievements,
    totalXpEarned: state.totalXpEarned,
    toggleHabit,
    addHabit,
    deleteHabit,
    toggleTask,
    addTask,
    deleteTask,
  };
};
