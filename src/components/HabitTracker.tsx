import { useState, useRef } from 'react';
import { Check, Plus, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useParticles } from '@/hooks/useParticles';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Habit {
  id: string;
  name: string;
  icon: string;
  completedDays: boolean[];
}

interface HabitTrackerProps {
  habits: Habit[];
  onToggleHabit: (habitId: string, dayIndex: number) => void;
  onAddHabit: (name: string, icon: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const habitIcons = ['💪', '📚', '🧘', '💧', '🏃', '🎯', '✍️', '🌙', '🍎', '💊'];

const HabitTracker = ({ habits, onToggleHabit, onAddHabit, onDeleteHabit }: HabitTrackerProps) => {
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💪');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { triggerParticles } = useParticles();
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      onAddHabit(newHabitName.trim(), selectedIcon);
      setNewHabitName('');
      setSelectedIcon('💪');
      setIsDialogOpen(false);
    }
  };

  const handleToggle = (habitId: string, dayIndex: number, completed: boolean) => {
    onToggleHabit(habitId, dayIndex);

    // Trigger particles if completing (not uncompleting)
    if (!completed) {
      const buttonKey = `${habitId}-${dayIndex}`;
      setTimeout(() => {
        triggerParticles(buttonRefs.current[buttonKey], 'burst', 15);
      }, 50);
    }
  };

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-aura hover-aura-lift relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse-glow" />
          <h2 className="text-xl font-display font-bold text-foreground">Weekly Habits</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-aura-gradient text-primary-foreground hover:opacity-90 shadow-aura-glow transition-all hover:shadow-aura-glow-lg">
              <Plus className="w-4 h-4 mr-1" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Habit name (e.g., Exercise)"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="bg-muted border-border"
              />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Choose an icon:</p>
                <div className="flex flex-wrap gap-2">
                  {habitIcons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${selectedIcon === icon
                          ? 'bg-primary/20 ring-2 ring-primary'
                          : 'bg-muted hover:bg-muted/80'
                        }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddHabit} className="w-full bg-aura-gradient text-primary-foreground shadow-aura-glow">
                Add Habit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-sm text-muted-foreground font-medium pb-3 min-w-[150px]">
                Habit
              </th>
              {daysOfWeek.map((day, index) => (
                <th
                  key={day}
                  className={`text-center text-sm font-medium pb-3 w-12 ${index === todayIndex ? 'text-primary' : 'text-muted-foreground'
                    }`}
                >
                  {day}
                </th>
              ))}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id} className="border-t border-border">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{habit.icon}</span>
                    <span className="text-foreground font-medium">{habit.name}</span>
                  </div>
                </td>
                {habit.completedDays.map((completed, dayIndex) => (
                  <td key={dayIndex} className="text-center py-3">
                    <button
                      ref={el => buttonRefs.current[`${habit.id}-${dayIndex}`] = el}
                      onClick={() => handleToggle(habit.id, dayIndex, completed)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${completed
                          ? 'bg-aura-gradient shadow-aura-glow'
                          : dayIndex === todayIndex
                            ? 'bg-primary/20 hover:bg-primary/30 ring-2 ring-aura animate-pulse-glow'
                            : 'bg-muted hover:bg-muted/80 hover:ring-2 hover:ring-aura/50'
                        }`}
                    >
                      {completed && (
                        <Check className="w-4 h-4 text-accent-foreground animate-check" />
                      )}
                    </button>
                  </td>
                ))}
                <td className="py-3">
                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {habits.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No habits yet. Add your first habit to start tracking!</p>
        </div>
      )}
    </div>
  );
};

export default HabitTracker;
