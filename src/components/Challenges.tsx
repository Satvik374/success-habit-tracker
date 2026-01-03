import { useState, useEffect } from 'react';
import { Trophy, Clock, Zap, Target, Flame, Star, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  target: number;
  current: number;
  xpReward: number;
  icon: React.ReactNode;
  completed: boolean;
}

interface ChallengesProps {
  tasksCompleted: number;
  habitsCompleted: number;
  streak: number;
}

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toISOString().split('T')[0];
};

const getToday = () => new Date().toISOString().split('T')[0];

const Challenges = ({ tasksCompleted, habitsCompleted, streak }: ChallengesProps) => {
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('completedChallenges');
    if (saved) {
      const { date, weekStart, challenges } = JSON.parse(saved);
      const today = getToday();
      const currentWeekStart = getWeekStart();
      
      // Reset daily challenges if it's a new day
      // Reset weekly challenges if it's a new week
      const validChallenges = challenges.filter((id: string) => {
        if (id.startsWith('daily_') && date !== today) return false;
        if (id.startsWith('weekly_') && weekStart !== currentWeekStart) return false;
        return true;
      });
      
      return new Set(validChallenges);
    }
    return new Set();
  });

  const dailyChallenges: Challenge[] = [
    {
      id: 'daily_tasks_3',
      title: 'Task Master',
      description: 'Complete 3 tasks today',
      type: 'daily',
      target: 3,
      current: Math.min(tasksCompleted, 3),
      xpReward: 50,
      icon: <Target className="w-5 h-5" />,
      completed: completedChallenges.has('daily_tasks_3'),
    },
    {
      id: 'daily_habits_2',
      title: 'Habit Builder',
      description: 'Complete 2 habits today',
      type: 'daily',
      target: 2,
      current: Math.min(habitsCompleted, 2),
      xpReward: 40,
      icon: <Flame className="w-5 h-5" />,
      completed: completedChallenges.has('daily_habits_2'),
    },
    {
      id: 'daily_all_habits',
      title: 'Perfect Routine',
      description: 'Complete all habits today',
      type: 'daily',
      target: 4,
      current: habitsCompleted,
      xpReward: 75,
      icon: <Star className="w-5 h-5" />,
      completed: completedChallenges.has('daily_all_habits'),
    },
  ];

  const weeklyChallenges: Challenge[] = [
    {
      id: 'weekly_tasks_15',
      title: 'Weekly Warrior',
      description: 'Complete 15 tasks this week',
      type: 'weekly',
      target: 15,
      current: Math.min(tasksCompleted, 15),
      xpReward: 200,
      icon: <Trophy className="w-5 h-5" />,
      completed: completedChallenges.has('weekly_tasks_15'),
    },
    {
      id: 'weekly_streak_5',
      title: 'Consistency King',
      description: 'Maintain a 5-day streak',
      type: 'weekly',
      target: 5,
      current: Math.min(streak, 5),
      xpReward: 150,
      icon: <Zap className="w-5 h-5" />,
      completed: completedChallenges.has('weekly_streak_5'),
    },
  ];

  // Check for newly completed challenges
  useEffect(() => {
    const allChallenges = [...dailyChallenges, ...weeklyChallenges];
    let updated = false;
    const newCompleted = new Set(completedChallenges);

    allChallenges.forEach(challenge => {
      if (!challenge.completed && challenge.current >= challenge.target) {
        newCompleted.add(challenge.id);
        updated = true;
      }
    });

    if (updated) {
      setCompletedChallenges(newCompleted);
      localStorage.setItem('completedChallenges', JSON.stringify({
        date: getToday(),
        weekStart: getWeekStart(),
        challenges: Array.from(newCompleted),
      }));
    }
  }, [tasksCompleted, habitsCompleted, streak]);

  const getTimeRemaining = (type: 'daily' | 'weekly') => {
    const now = new Date();
    if (type === 'daily') {
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      return `${hours}h left`;
    } else {
      const endOfWeek = new Date(now);
      const daysUntilSunday = 7 - now.getDay();
      endOfWeek.setDate(now.getDate() + daysUntilSunday);
      endOfWeek.setHours(23, 59, 59, 999);
      const diff = endOfWeek.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return `${days}d left`;
    }
  };

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
    const progress = (challenge.current / challenge.target) * 100;
    const isComplete = challenge.completed || challenge.current >= challenge.target;

    return (
      <div
        className={`relative p-4 rounded-xl border transition-all ${
          isComplete
            ? 'bg-accent/10 border-accent/30'
            : 'bg-card border-border hover:border-primary/30'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg ${
              isComplete ? 'bg-accent/20 text-accent' : 'bg-primary/10 text-primary'
            }`}
          >
            {isComplete ? <CheckCircle2 className="w-5 h-5" /> : challenge.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-display font-semibold text-foreground text-sm">
                {challenge.title}
              </h4>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  challenge.type === 'daily'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-accent/10 text-accent'
                }`}
              >
                {challenge.type === 'daily' ? 'Daily' : 'Weekly'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {challenge.current}/{challenge.target}
                </span>
                <span className="flex items-center gap-1 text-primary font-medium">
                  <Zap className="w-3 h-3" />
                  +{challenge.xpReward} XP
                </span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-2" />
            </div>

            {!isComplete && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {getTimeRemaining(challenge.type)}
              </div>
            )}
          </div>
        </div>

        {isComplete && (
          <div className="absolute top-2 right-2">
            <span className="text-xs font-medium text-accent">Completed!</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-semibold text-foreground">Challenges</h3>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Daily Challenges
          </h4>
          <div className="space-y-3">
            {dailyChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            Weekly Challenges
          </h4>
          <div className="space-y-3">
            {weeklyChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;
