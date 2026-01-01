import { Link } from 'react-router-dom';
import MotivationalQuote from '@/components/MotivationalQuote';
import PlayerStats from '@/components/PlayerStats';
import HabitTracker from '@/components/HabitTracker';
import TaskList from '@/components/TaskList';
import ProgressRing from '@/components/ProgressRing';
import { useGameState } from '@/hooks/useGameState';
import { Calendar, Gamepad2, BarChart3 } from 'lucide-react';

const Index = () => {
  const {
    level,
    xp,
    xpToNextLevel,
    streak,
    habits,
    tasks,
    completionRate,
    toggleHabit,
    addHabit,
    deleteHabit,
    toggleTask,
    addTask,
    deleteTask,
  } = useGameState();

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center shadow-glow">
              <Gamepad2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Quest Tracker</h1>
              <p className="text-sm text-muted-foreground">2026 Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/analytics"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Analytics</span>
            </Link>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm hidden md:inline">{formattedDate}</span>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Progress */}
          <div className="lg:col-span-1 space-y-6">
            <MotivationalQuote />
            
            <PlayerStats
              level={level}
              xp={xp}
              xpToNextLevel={xpToNextLevel}
              streak={streak}
              completionRate={completionRate}
            />
            
            {/* Daily Progress */}
            <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="text-lg font-display font-semibold text-foreground mb-4 text-center">
                Today's Progress
              </h3>
              <div className="flex justify-center">
                <ProgressRing progress={completionRate} label="Complete" />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                {completionRate === 100 
                  ? "🎉 Perfect day! You're unstoppable!"
                  : completionRate >= 75 
                  ? "Almost there! Keep pushing! 💪"
                  : completionRate >= 50
                  ? "Halfway done! You've got this! 🔥"
                  : "Every task counts. Start small! ⭐"}
              </p>
            </div>
          </div>

          {/* Right Column - Trackers */}
          <div className="lg:col-span-2 space-y-6">
            <HabitTracker
              habits={habits}
              onToggleHabit={toggleHabit}
              onAddHabit={addHabit}
              onDeleteHabit={deleteHabit}
            />
            
            <TaskList
              tasks={tasks}
              onToggleTask={toggleTask}
              onAddTask={addTask}
              onDeleteTask={deleteTask}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-muted-foreground text-sm">
          <p>Level up your life, one habit at a time 🚀</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
