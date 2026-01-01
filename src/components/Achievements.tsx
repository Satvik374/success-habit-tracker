import { Trophy, Flame, Star, Zap, Target, Crown, Medal, Rocket, Award, Lock } from 'lucide-react';
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
    id: 'perfect_day',
    name: 'Perfect Day',
    description: 'Complete 100% of habits & tasks in a day',
    icon: Trophy,
    requirement: '100% daily completion',
  },
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
    id: 'habits_5',
    name: 'Habit Builder',
    description: 'Create 5 different habits',
    icon: Rocket,
    requirement: 'Create 5 habits',
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
