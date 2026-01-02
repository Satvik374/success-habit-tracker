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
    <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border hover-aura-lift">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-aura-gradient flex items-center justify-center shadow-aura-glow-lg animate-ripple-glow">
            <Trophy className="w-7 h-7 text-primary-foreground animate-float" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Level</p>
            <p className="text-3xl font-display font-bold text-gradient-gold animate-glow-wave">{level}</p>
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
            <Zap className="w-4 h-4 text-primary animate-pulse-glow" />
            <span className="text-sm font-medium text-foreground">Experience Points</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {xp} / {xpToNextLevel} XP
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden relative">
          <div
            className="h-full bg-aura-gradient rounded-full transition-all duration-500 ease-out shadow-aura-glow"
            style={{
              width: `${xpPercentage}%`,
              background: 'linear-gradient(90deg, var(--aura-gradient), hsl(var(--aura-primary) / 0.8))',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2.5s ease-in-out infinite'
            }}
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
