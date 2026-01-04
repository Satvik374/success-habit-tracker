import { useState, useEffect, useCallback, useRef } from 'react';
import type { Task } from '@/components/TaskList';
import { achievementDefinitions, Achievement } from '@/components/Achievements';
import { toast } from 'sonner';
import { useCelebration } from './useCelebration';
import { useAuth } from '@/contexts/AuthContext';
import { saveUserData, loadUserData, subscribeToUserData, migrateLocalData } from '@/services/userDataService';
import type { GameState as FirestoreGameState } from '@/services/userDataService';

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
  totalTasksCompleted: number;
  daysUsed: string[];
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
  const { user } = useAuth();
  const prevLevelRef = useRef<number | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('habitTrackerGameState');
    const today = getToday();
    if (saved) {
      const parsed = JSON.parse(saved);
      // Track days used for dedication achievement
      const existingDaysUsed = parsed.daysUsed || [];
      const daysUsed = existingDaysUsed.includes(today) ? existingDaysUsed : [...existingDaysUsed, today];

      if (parsed.lastActiveDate !== today) {
        const resetHabits = parsed.habits.map((h: Habit) => ({
          ...h,
          completedDays: [false, false, false, false, false, false, false],
        }));
        const resetTasks = parsed.tasks.map((t: Task) => ({ ...t, completed: false }));
        return {
          ...parsed,
          habits: resetHabits,
          tasks: resetTasks,
          lastActiveDate: today,
          totalXpEarned: parsed.totalXpEarned || 0,
          unlockedAchievements: parsed.unlockedAchievements || [],
          perfectDays: parsed.perfectDays || 0,
          totalTasksCompleted: parsed.totalTasksCompleted || 0,
          daysUsed,
        };
      }
      return {
        ...parsed,
        totalXpEarned: parsed.totalXpEarned || 0,
        unlockedAchievements: parsed.unlockedAchievements || [],
        perfectDays: parsed.perfectDays || 0,
        totalTasksCompleted: parsed.totalTasksCompleted || 0,
        daysUsed,
      };
    }
    return {
      level: 1,
      xp: 0,
      totalXpEarned: 0,
      streak: 1,
      habits: defaultHabits,
      tasks: defaultTasks,
      lastActiveDate: today,
      unlockedAchievements: [],
      perfectDays: 0,
      totalTasksCompleted: 0,
      daysUsed: [today],
    };
  });


  // Debounced save to Firestore
  const saveToFirestore = useCallback((stateToSave: GameState) => {
    if (!user) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save by 1 second
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveUserData(user.uid, {
          level: stateToSave.level,
          xp: stateToSave.xp,
          streak: stateToSave.streak,
          habits: stateToSave.habits,
          tasks: stateToSave.tasks,
          achievements: stateToSave.unlockedAchievements.map(id => {
            const def = achievementDefinitions.find(a => a.id === id);
            return def ? { ...def, unlocked: true, unlockedAt: new Date().toISOString() } : null;
          }).filter(Boolean) as any[],
          totalHabitsCompleted: stateToSave.habits.reduce((sum, h) => sum + h.completedDays.filter(Boolean).length, 0),
          totalTasksCompleted: stateToSave.totalTasksCompleted,
          totalXpEarned: stateToSave.totalXpEarned,
          perfectDays: stateToSave.perfectDays,
          lastActive: stateToSave.lastActiveDate,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to save data:', error);
        // Fallback to localStorage
        localStorage.setItem('habitTrackerGameState', JSON.stringify(stateToSave));
      }
    }, 1000);
  }, [user]);

  // Save to localStorage or Firestore
  useEffect(() => {
    if (user) {
      saveToFirestore(state);
    } else {
      localStorage.setItem('habitTrackerGameState', JSON.stringify(state));
    }
  }, [state, user, saveToFirestore]);

  // Load data from Firestore when user signs in
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const loadData = async () => {
      try {
        // Try to migrate local data first
        await migrateLocalData(user.uid);

        // Load from Firestore
        const cloudData = await loadUserData(user.uid);

        if (cloudData) {
          setState({
            level: cloudData.level,
            xp: cloudData.xp,
            totalXpEarned: cloudData.totalXpEarned,
            streak: cloudData.streak,
            habits: cloudData.habits,
            tasks: cloudData.tasks,
            lastActiveDate: cloudData.lastActive,
            unlockedAchievements: cloudData.achievements.filter(a => a.unlocked).map(a => a.id),
            perfectDays: cloudData.perfectDays,
            totalTasksCompleted: cloudData.totalTasksCompleted,
            daysUsed: [], // Will be rebuilt from usage
          });
        }

        // Subscribe to real-time updates
        unsubscribe = subscribeToUserData(user.uid, (data) => {
          if (data) {
            setState(prev => ({
              ...prev,
              level: data.level,
              xp: data.xp,
              totalXpEarned: data.totalXpEarned,
              streak: data.streak,
              habits: data.habits,
              tasks: data.tasks,
              lastActiveDate: data.lastActive,
              unlockedAchievements: data.achievements.filter(a => a.unlocked).map(a => a.id),
              perfectDays: data.perfectDays,
              totalTasksCompleted: data.totalTasksCompleted,
            }));
          }
        });
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load your data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

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

  const checkAndUnlockAchievements = useCallback((currentState: GameState, isTaskCompletion = false): string[] => {
    const newUnlocks: string[] = [];
    const allUnlocked = [...currentState.unlockedAchievements];
    const todayIndex = new Date().getDay();
    const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1;
    const currentHour = new Date().getHours();
    const isWeekend = todayIndex === 0 || todayIndex === 6;

    const tryUnlock = (id: string) => {
      if (!allUnlocked.includes(id) && !newUnlocks.includes(id)) {
        if (unlockAchievement(id, [...allUnlocked, ...newUnlocks])) {
          newUnlocks.push(id);
          return true;
        }
      }
      return false;
    };

    // First habit
    const anyHabitComplete = currentState.habits.some((h) => h.completedDays.some(Boolean));
    if (anyHabitComplete) tryUnlock('first_habit');

    // First task
    const anyTaskComplete = currentState.tasks.some((t) => t.completed);
    if (anyTaskComplete) tryUnlock('first_task');

    // Streak achievements
    if (currentState.streak >= 3) tryUnlock('streak_3');
    if (currentState.streak >= 7) tryUnlock('streak_7');
    if (currentState.streak >= 14) tryUnlock('streak_14');
    if (currentState.streak >= 30) tryUnlock('streak_30');

    // Level achievements
    if (currentState.level >= 5) tryUnlock('level_5');
    if (currentState.level >= 10) tryUnlock('level_10');
    if (currentState.level >= 20) tryUnlock('level_20');
    if (currentState.level >= 50) tryUnlock('level_50');

    // XP achievements
    if (currentState.totalXpEarned >= 500) tryUnlock('xp_500');
    if (currentState.totalXpEarned >= 2000) tryUnlock('xp_2000');
    if (currentState.totalXpEarned >= 5000) tryUnlock('xp_5000');
    if (currentState.totalXpEarned >= 10000) tryUnlock('xp_10000');

    // Habit count achievements
    if (currentState.habits.length >= 5) tryUnlock('habits_5');
    if (currentState.habits.length >= 10) tryUnlock('habits_10');

    // Task completion achievements
    if (currentState.totalTasksCompleted >= 10) tryUnlock('tasks_10');
    if (currentState.totalTasksCompleted >= 50) tryUnlock('tasks_50');
    if (currentState.totalTasksCompleted >= 100) tryUnlock('tasks_100');

    // Perfect day check
    const habitsCompleted = currentState.habits.filter((h) => h.completedDays[adjustedIndex]).length;
    const tasksCompleted = currentState.tasks.filter((t) => t.completed).length;
    const totalItems = currentState.habits.length + currentState.tasks.length;
    if (totalItems > 0 && habitsCompleted + tasksCompleted === totalItems) {
      tryUnlock('perfect_day');
    }

    // Perfect week/month (based on perfectDays count)
    if (currentState.perfectDays >= 7) tryUnlock('perfect_week');
    if (currentState.perfectDays >= 30) tryUnlock('perfect_month');

    // Time-based achievements (only when completing tasks)
    if (isTaskCompletion) {
      if (currentHour < 7) tryUnlock('early_bird');
      if (currentHour >= 23) tryUnlock('night_owl');
    }

    // Weekend warrior - all habits complete on weekend
    if (isWeekend && currentState.habits.length > 0) {
      const allHabitsToday = currentState.habits.every((h) => h.completedDays[adjustedIndex]);
      if (allHabitsToday) tryUnlock('weekend_warrior');
    }

    // Dedication - used app on 7 different days
    if (currentState.daysUsed.length >= 7) tryUnlock('dedication');

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

  const editHabit = (habitId: string, newName?: string, newIcon?: string) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === habitId
          ? { ...h, name: newName || h.name, icon: newIcon || h.icon }
          : h
      ),
    }));
  };

  const toggleTask = (taskId: string) => {
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;

      const wasCompleted = task.completed;
      const xpChange = wasCompleted ? -task.xpReward : task.xpReward;
      const taskCountChange = wasCompleted ? 0 : 1; // Only increment, never decrement total

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
      const newTotalTasksCompleted = prev.totalTasksCompleted + taskCountChange;

      if (newXP >= XP_PER_LEVEL) {
        newXP -= XP_PER_LEVEL;
        newLevel++;
        toast.success(`🎉 Level Up! You're now Level ${newLevel}!`);
      } else if (newXP < 0) {
        newXP = 0;
      }

      // Check for perfect day
      const todayIdx = new Date().getDay();
      const adjustedIdx = todayIdx === 0 ? 6 : todayIdx - 1;
      const habitsComplete = prev.habits.filter((h) => h.completedDays[adjustedIdx]).length;
      const tasksComplete = newTasks.filter((t) => t.completed).length;
      const totalItems = prev.habits.length + newTasks.length;
      const isPerfectDay = totalItems > 0 && habitsComplete + tasksComplete === totalItems;
      const newPerfectDays = isPerfectDay && !wasCompleted ? prev.perfectDays + 1 : prev.perfectDays;

      if (isPerfectDay && !wasCompleted) {
        celebration.triggerPerfectDay();
      }

      const newState = {
        ...prev,
        tasks: newTasks,
        xp: newXP,
        level: newLevel,
        totalXpEarned: newTotalXp,
        totalTasksCompleted: newTotalTasksCompleted,
        perfectDays: newPerfectDays,
      };
      const newUnlocks = checkAndUnlockAchievements(newState, !wasCompleted);

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
    editHabit,
    toggleTask,
    addTask,
    deleteTask,
  };
};
