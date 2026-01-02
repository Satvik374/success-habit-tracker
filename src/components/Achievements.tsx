import { Trophy, Flame, Star, Zap, Target, Crown, Medal, Rocket, Award, Lock, Calendar, Sparkles, TrendingUp, Heart, Brain, Coffee, Moon, Sun, Dumbbell, BookOpen } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
  unlockedAt?: string;
  requirement: string;
}

export const achievementDefinitions: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Getting Started
  {
    id: 'first_habit',
    name: 'Getting Started',
    description: 'Complete your first habit',
    icon: Star,
    requirement: 'Complete 1 habit',
  },
  {
    id: 'first_task',
    name: 'Quest Beginner',
    description: 'Complete your first task',
    icon: Target,
    requirement: 'Complete 1 task',
  },
  // Streaks
  {
    id: 'streak_3',
    name: 'On Fire',
    description: 'Maintain a 3-day streak',
    icon: Flame,
    requirement: '3-day streak',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: Flame,
    requirement: '7-day streak',
  },
  {
    id: 'streak_14',
    name: 'Unstoppable',
    description: 'Maintain a 14-day streak',
    icon: Rocket,
    requirement: '14-day streak',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: Calendar,
    requirement: '30-day streak',
  },
  // Levels
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: Zap,
    requirement: 'Reach Level 5',
  },
  {
    id: 'level_10',
    name: 'Elite Player',
    description: 'Reach level 10',
    icon: Crown,
    requirement: 'Reach Level 10',
  },
  {
    id: 'level_20',
    name: 'Legendary',
    description: 'Reach level 20',
    icon: Sparkles,
    requirement: 'Reach Level 20',
  },
  {
    id: 'level_50',
    name: 'Grandmaster',
    description: 'Reach level 50',
    icon: Crown,
    requirement: 'Reach Level 50',
  },
  // Perfect Days
  {
    id: 'perfect_day',
    name: 'Perfect Day',
    description: 'Complete 100% of habits & tasks in a day',
    icon: Trophy,
    requirement: '100% daily completion',
  },
  {
    id: 'perfect_week',
    name: 'Flawless Week',
    description: 'Achieve 7 perfect days',
    icon: Star,
    requirement: '7 perfect days total',
  },
  {
    id: 'perfect_month',
    name: 'Perfection Pro',
    description: 'Achieve 30 perfect days',
    icon: Trophy,
    requirement: '30 perfect days total',
  },
  // XP Milestones
  {
    id: 'xp_500',
    name: 'XP Hunter',
    description: 'Earn 500 total XP',
    icon: Medal,
    requirement: 'Earn 500 XP',
  },
  {
    id: 'xp_2000',
    name: 'XP Master',
    description: 'Earn 2000 total XP',
    icon: Award,
    requirement: 'Earn 2000 XP',
  },
  {
    id: 'xp_5000',
    name: 'XP Legend',
    description: 'Earn 5000 total XP',
    icon: TrendingUp,
    requirement: 'Earn 5000 XP',
  },
  {
    id: 'xp_10000',
    name: 'XP Titan',
    description: 'Earn 10000 total XP',
    icon: Sparkles,
    requirement: 'Earn 10000 XP',
  },
  // Habits
  {
    id: 'habits_5',
    name: 'Habit Builder',
    description: 'Create 5 different habits',
    icon: Rocket,
    requirement: 'Create 5 habits',
  },
  {
    id: 'habits_10',
    name: 'Habit Architect',
    description: 'Create 10 different habits',
    icon: Brain,
    requirement: 'Create 10 habits',
  },
  // Tasks
  {
    id: 'tasks_10',
    name: 'Task Tackler',
    description: 'Complete 10 tasks total',
    icon: Target,
    requirement: 'Complete 10 tasks',
  },
  {
    id: 'tasks_50',
    name: 'Task Champion',
    description: 'Complete 50 tasks total',
    icon: Medal,
    requirement: 'Complete 50 tasks',
  },
  {
    id: 'tasks_100',
    name: 'Task Titan',
    description: 'Complete 100 tasks total',
    icon: Award,
    requirement: 'Complete 100 tasks',
  },
  // Special
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a task before 7 AM',
    icon: Sun,
    requirement: 'Complete task before 7 AM',
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a task after 11 PM',
    icon: Moon,
    requirement: 'Complete task after 11 PM',
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete all habits on a weekend',
    icon: Coffee,
    requirement: 'All habits on Sat or Sun',
  },
  {
    id: 'dedication',
    name: 'Dedicated',
    description: 'Use the app for 7 different days',
    icon: Heart,
    requirement: 'Open app on 7 days',
  },
];

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

const AchievementBadge = ({ achievement, size = 'md' }: AchievementBadgeProps) => {
  const Icon = achievement.icon;
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };
  
  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 36,
  };

  return (
    <div className="flex flex-col items-center gap-2 group">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center relative transition-all duration-300 ${
          achievement.unlocked
            ? 'bg-gradient-gold shadow-glow animate-pulse-glow'
            : 'bg-muted border-2 border-border'
        }`}
      >
        {achievement.unlocked ? (
          <Icon size={iconSizes[size]} className="text-primary-foreground" />
        ) : (
          <Lock size={iconSizes[size]} className="text-muted-foreground" />
        )}
        {achievement.unlocked && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
            <span className="text-xs text-accent-foreground">✓</span>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className={`text-sm font-medium ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
          {achievement.name}
        </p>
        <p className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity max-w-[100px]">
          {achievement.unlocked ? achievement.description : achievement.requirement}
        </p>
      </div>
    </div>
  );
};

interface AchievementsGridProps {
  achievements: Achievement[];
}

export const AchievementsGrid = ({ achievements }: AchievementsGridProps) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  
  return (
    <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-display font-bold text-foreground">Achievements</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {unlockedCount}/{achievements.length} Unlocked
          </span>
          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-gold transition-all duration-500"
              style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {achievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} size="sm" />
        ))}
      </div>
    </div>
  );
};

export default AchievementBadge;
