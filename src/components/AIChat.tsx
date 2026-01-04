import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Habit {
  id: string;
  name: string;
  icon: string;
  completedDays: boolean[];
}

interface AIChatProps {
  habits: Habit[];
  onAddTask: (title: string, priority: 'low' | 'medium' | 'high') => void;
  onAddHabit: (name: string, icon: string) => void;
  onEditHabit: (habitId: string, newName?: string, newIcon?: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

const AIChat = ({ habits, onAddTask, onAddHabit, onEditHabit, onDeleteHabit }: AIChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey there, adventurer! 🎮 I'm Quest AI, your productivity companion. I can help you add quests, manage habits, and answer questions about the app. What would you like to do today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleToolCalls = (toolCalls: any[]) => {
    toolCalls.forEach((tool) => {
      switch (tool.name) {
        case 'add_task':
          onAddTask(tool.arguments.title, tool.arguments.priority);
          toast.success(`Quest added: "${tool.arguments.title}" (+${tool.arguments.priority === 'high' ? 50 : tool.arguments.priority === 'medium' ? 25 : 10} XP)`);
          break;
        case 'add_habit':
          onAddHabit(tool.arguments.name, tool.arguments.icon);
          toast.success(`New habit added: ${tool.arguments.icon} ${tool.arguments.name}`);
          break;
        case 'edit_habit':
          onEditHabit(tool.arguments.habitId, tool.arguments.newName, tool.arguments.newIcon);
          toast.success('Habit updated successfully!');
          break;
        case 'delete_habit':
          onDeleteHabit(tool.arguments.habitId);
          toast.success('Habit removed from tracking');
          break;
      }
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke('quest-ai-chat', {
        body: { 
          messages: chatMessages,
          currentHabits: habits.map(h => ({ id: h.id, name: h.name, icon: h.icon })),
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Handle tool calls if present
      if (data.toolCalls && data.toolCalls.length > 0) {
        handleToolCalls(data.toolCalls);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-aura-gradient shadow-aura-glow-lg flex items-center justify-center transition-all hover:scale-110 ${
          isOpen ? 'rotate-0' : 'animate-pulse'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <Bot className="w-6 h-6 text-primary-foreground" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-aura-gradient p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-bold text-primary-foreground">Quest AI</h3>
              <p className="text-xs text-primary-foreground/80">Your productivity companion</p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="bg-aura-gradient hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Try: "Add a quest to learn TypeScript" or "Create a habit for journaling"
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
