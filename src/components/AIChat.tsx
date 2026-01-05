import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, Check, X as XIcon, Target, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface Suggestion {
  id: string;
  type: 'task' | 'habit';
  title: string;
  icon?: string;
  priority?: 'low' | 'medium' | 'high';
  reason: string;
  status: 'pending' | 'accepted' | 'dismissed';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: Suggestion[];
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
  onUpgradeClick: () => void;
}

const AIChat = ({ habits, onAddTask, onAddHabit, onEditHabit, onDeleteHabit, onUpgradeClick }: AIChatProps) => {
  const { isPremium, features } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: isPremium 
        ? "I am your Accountability Coach. My job is not to motivate you. My job is to hold you accountable. Tell me what you are working on."
        : "Upgrade to Premium to unlock the AI Accountability Coach. This is not a friendly chatbot. This is a strict coach who will hold you accountable for your goals.",
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

  const handleAcceptSuggestion = (messageId: string, suggestion: Suggestion) => {
    if (suggestion.type === 'task') {
      onAddTask(suggestion.title, suggestion.priority || 'medium');
      toast.success(`Quest added: "${suggestion.title}" (+${suggestion.priority === 'high' ? 50 : suggestion.priority === 'medium' ? 25 : 10} XP)`);
    } else {
      onAddHabit(suggestion.title, suggestion.icon || '⭐');
      toast.success(`New habit added: ${suggestion.icon || '⭐'} ${suggestion.title}`);
    }

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.suggestions) {
        return {
          ...msg,
          suggestions: msg.suggestions.map(s => 
            s.id === suggestion.id ? { ...s, status: 'accepted' as const } : s
          )
        };
      }
      return msg;
    }));
  };

  const handleDismissSuggestion = (messageId: string, suggestionId: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.suggestions) {
        return {
          ...msg,
          suggestions: msg.suggestions.map(s => 
            s.id === suggestionId ? { ...s, status: 'dismissed' as const } : s
          )
        };
      }
      return msg;
    }));
  };

  const handleToolCalls = (toolCalls: any[], messageId: string): Suggestion[] | null => {
    let suggestions: Suggestion[] | null = null;
    
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
        case 'suggest_items':
          suggestions = tool.arguments.suggestions.map((s: any, index: number) => ({
            id: `${messageId}-suggestion-${index}`,
            type: s.type,
            title: s.title,
            icon: s.icon,
            priority: s.priority,
            reason: s.reason,
            status: 'pending'
          }));
          break;
      }
    });

    return suggestions;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Check if user has premium access
    if (!features.aiCoach) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input.trim(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      
      const lockedMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'The AI Accountability Coach is a Premium feature. Upgrade to unlock strict accountability, habit tracking insights, and direct guidance. No excuses accepted.',
      };
      setMessages((prev) => [...prev, lockedMessage]);
      return;
    }

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

      const messageId = (Date.now() + 1).toString();
      let suggestions: Suggestion[] | null = null;

      // Handle tool calls if present
      if (data.toolCalls && data.toolCalls.length > 0) {
        suggestions = handleToolCalls(data.toolCalls, messageId);
      }

      const assistantMessage: Message = {
        id: messageId,
        role: 'assistant',
        content: data.content,
        suggestions: suggestions || undefined,
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

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
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
              {isPremium ? (
                <Crown className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Lock className="w-5 h-5 text-primary-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-primary-foreground">
                {isPremium ? 'Accountability Coach' : 'AI Coach'}
              </h3>
              <p className="text-xs text-primary-foreground/80">
                {isPremium ? 'Discipline over motivation' : 'Premium feature'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-code:bg-background/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-background/50 prose-pre:p-2 prose-strong:text-foreground">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Suggestion Cards */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className={`rounded-xl border p-3 transition-all ${
                            suggestion.status === 'accepted'
                              ? 'bg-green-500/10 border-green-500/30'
                              : suggestion.status === 'dismissed'
                              ? 'bg-muted/50 border-border/50 opacity-50'
                              : 'bg-card border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              suggestion.type === 'task' ? 'bg-primary/10' : 'bg-secondary/50'
                            }`}>
                              {suggestion.type === 'task' ? (
                                <Target className={`w-5 h-5 ${getPriorityColor(suggestion.priority)}`} />
                              ) : (
                                <span className="text-xl">{suggestion.icon || '⭐'}</span>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-foreground truncate">
                                  {suggestion.title}
                                </span>
                                {suggestion.type === 'task' && suggestion.priority && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(suggestion.priority)} bg-current/10`}>
                                    {suggestion.priority}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {suggestion.reason}
                              </p>
                              
                              {suggestion.status === 'pending' && (
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleAcceptSuggestion(message.id, suggestion)}
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-3"
                                    onClick={() => handleDismissSuggestion(message.id, suggestion.id)}
                                  >
                                    <XIcon className="w-3 h-3 mr-1" />
                                    Dismiss
                                  </Button>
                                </div>
                              )}
                              
                              {suggestion.status === 'accepted' && (
                                <div className="flex items-center gap-1 mt-2 text-green-600 text-xs">
                                  <Check className="w-3 h-3" />
                                  Added to your {suggestion.type === 'task' ? 'quests' : 'habits'}!
                                </div>
                              )}
                              
                              {suggestion.status === 'dismissed' && (
                                <div className="text-muted-foreground text-xs mt-2">
                                  Dismissed
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
            {!features.aiCoach ? (
              <div className="text-center">
                <Button
                  onClick={onUpgradeClick}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Unlock strict accountability coaching
                </p>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Report your progress..."
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
                  Be honest. Excuses will not be accepted.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;