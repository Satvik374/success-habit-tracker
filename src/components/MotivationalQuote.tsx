import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "You are never too old to set another goal or dream a new dream.", author: "C.S. Lewis" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Unknown" },
  { text: "Champions keep playing until they get it right.", author: "Billie Jean King" },
  { text: "Your habits shape your identity, and your identity shapes your habits.", author: "James Clear" },
  { text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear" },
  { text: "Progress, not perfection, is what we should be asking of ourselves.", author: "Julia Cameron" },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const MotivationalQuote = () => {
  const [quote, setQuote] = useState(quotes[0]);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setGreeting(getGreeting());
  }, []);

  return (
    <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary animate-pulse-glow" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Daily Motivation
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
          {greeting}, Champion! 🔥
        </h1>
        <blockquote className="text-muted-foreground text-lg italic mb-2">
          "{quote.text}"
        </blockquote>
        <p className="text-sm text-primary font-medium">— {quote.author}</p>
      </div>
    </div>
  );
};

export default MotivationalQuote;
