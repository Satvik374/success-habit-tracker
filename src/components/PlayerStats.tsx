import { Flame, Trophy, Zap, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PlayerStatsProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  completionRate: number;
}

const PlayerStats = ({ level, xp, xpToNextLevel, streak, completionRate }: PlayerStatsProps) => {
  const xpPercentage = (xp / xpToNextLevel) * 100;

  return (
    <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center shadow-glow">
            <Trophy className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Level</p>
            <p className="text-3xl font-display font-bold text-gradient-gold">{level}</p>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-5 h-5 text-streak animate-streak" />
              <span className="text-2xl font-display font-bold text-foreground">{streak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-5 h-5 text-success" />
              <span className="text-2xl font-display font-bold text-foreground">{completionRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Completion</p>
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Experience Points</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {xp} / {xpToNextLevel} XP
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-gold rounded-full transition-all duration-500 ease-out"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {xpToNextLevel - xp} XP until Level {level + 1}
        </p>
      </div>
    </div>
  );
};

export default PlayerStats;
