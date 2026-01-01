import { useState, useEffect } from 'react';
import type { Task } from '@/components/TaskList';

interface Habit {
  id: string;
  name: string;
  icon: string;
  completedDays: boolean[];
}

interface GameState {
  level: number;
  xp: number;
  streak: number;
  habits: Habit[];
  tasks: Task[];
  lastActiveDate: string;
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
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('habitTrackerGameState');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check if it's a new day - reset habits if so
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
        };
      }
      return parsed;
    }
    return {
      level: 1,
      xp: 0,
      streak: 1,
      habits: defaultHabits,
      tasks: defaultTasks,
      lastActiveDate: getToday(),
    };
  });

  useEffect(() => {
    localStorage.setItem('habitTrackerGameState', JSON.stringify(state));
  }, [state]);

  const addXP = (amount: number) => {
    setState((prev) => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      
      while (newXP >= XP_PER_LEVEL) {
        newXP -= XP_PER_LEVEL;
        newLevel++;
      }
      
      return { ...prev, xp: newXP, level: newLevel };
    });
  };

  const toggleHabit = (habitId: string, dayIndex: number) => {
    setState((prev) => {
      const habit = prev.habits.find((h) => h.id === habitId);
      if (!habit) return prev;
      
      const wasCompleted = habit.completedDays[dayIndex];
      const xpChange = wasCompleted ? -15 : 15;
      
      const newHabits = prev.habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              completedDays: h.completedDays.map((c, i) => (i === dayIndex ? !c : c)),
            }
          : h
      );
      
      let newXP = prev.xp + xpChange;
      let newLevel = prev.level;
      
      if (newXP >= XP_PER_LEVEL) {
        newXP -= XP_PER_LEVEL;
        newLevel++;
      } else if (newXP < 0) {
        newXP = 0;
      }
      
      return { ...prev, habits: newHabits, xp: newXP, level: newLevel };
    });
  };

  const addHabit = (name: string, icon: string) => {
    setState((prev) => ({
      ...prev,
      habits: [
        ...prev.habits,
        {
          id: Date.now().toString(),
          name,
          icon,
          completedDays: [false, false, false, false, false, false, false],
        },
      ],
    }));
  };

  const deleteHabit = (habitId: string) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== habitId),
    }));
  };

  const toggleTask = (taskId: string) => {
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;
      
      const wasCompleted = task.completed;
      const xpChange = wasCompleted ? -task.xpReward : task.xpReward;
      
      const newTasks = prev.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      
      let newXP = prev.xp + xpChange;
      let newLevel = prev.level;
      
      if (newXP >= XP_PER_LEVEL) {
        newXP -= XP_PER_LEVEL;
        newLevel++;
      } else if (newXP < 0) {
        newXP = 0;
      }
      
      return { ...prev, tasks: newTasks, xp: newXP, level: newLevel };
    });
  };

  const addTask = (title: string, priority: 'low' | 'medium' | 'high') => {
    const xpRewards = { low: 10, medium: 25, high: 50 };
    setState((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          id: Date.now().toString(),
          title,
          completed: false,
          xpReward: xpRewards[priority],
          priority,
        },
      ],
    }));
  };

  const deleteTask = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
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

  return {
    level: state.level,
    xp: state.xp,
    xpToNextLevel: XP_PER_LEVEL,
    streak: state.streak,
    habits: state.habits,
    tasks: state.tasks,
    completionRate: calculateCompletionRate(),
    toggleHabit,
    addHabit,
    deleteHabit,
    toggleTask,
    addTask,
    deleteTask,
    addXP,
  };
};
