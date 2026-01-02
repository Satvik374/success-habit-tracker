import { useState, useRef } from 'react';
import { Check, Plus, Trash2, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useParticles } from '@/hooks/useParticles';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  xpReward: number;
  priority: 'low' | 'medium' | 'high';
}

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, priority: 'low' | 'medium' | 'high') => void;
  onDeleteTask: (taskId: string) => void;
}

const priorityConfig = {
  low: { color: 'text-muted-foreground', bg: 'bg-muted', xp: 10 },
  medium: { color: 'text-primary', bg: 'bg-primary/20', xp: 25 },
  high: { color: 'text-streak', bg: 'bg-streak/20', xp: 50 },
};

const TaskList = ({ tasks, onToggleTask, onAddTask, onDeleteTask }: TaskListProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const { triggerParticles } = useParticles();
  const taskRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim(), priority);
      setNewTaskTitle('');
    }
  };

  const handleToggleTask = (taskId: string, completed: boolean) => {
    onToggleTask(taskId);

    // Trigger particles if completing (not uncompleting)
    if (!completed) {
      setTimeout(() => {
        triggerParticles(taskRefs.current[taskId], 'sparkle', 20);
      }, 50);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-aura hover-aura-lift">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary animate-pulse-glow" />
          <h2 className="text-xl font-display font-bold text-foreground">Today's Quests</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {completedCount}/{tasks.length}
          </span>
          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-aura-gradient transition-all duration-300 shadow-aura-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Add a new quest..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-muted border-border"
        />
        <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'medium' | 'high')}>
          <SelectTrigger className="w-28 bg-muted border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleAddTask} className="bg-aura-gradient text-primary-foreground hover:opacity-90 shadow-aura-glow transition-all hover:shadow-aura-glow-lg">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover-aura-lift ${task.completed
                ? 'bg-success/10 border-success/30 shadow-aura-glow'
                : 'bg-muted/50 border-border hover:border-aura'
              }`}
          >
            <button
              ref={el => taskRefs.current[task.id] = el}
              onClick={() => handleToggleTask(task.id, task.completed)}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${task.completed
                  ? 'bg-aura-gradient shadow-aura-glow'
                  : 'border-2 border-muted-foreground hover:border-primary hover:shadow-aura-glow'
                }`}
            >
              {task.completed && <Check className="w-3 h-3 text-accent-foreground animate-check" />}
            </button>
            <span
              className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}
            >
              {task.title}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].color}`}
            >
              {task.priority}
            </span>
            <div className="flex items-center gap-1 text-primary">
              <Zap className="w-3 h-3" />
              <span className="text-xs font-medium">+{task.xpReward}</span>
            </div>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No quests yet. Add your first quest to earn XP!</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
