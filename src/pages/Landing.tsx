import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Target, Trophy, Brain, ArrowRight } from "lucide-react";
import LightPillar from "@/components/LightPillar";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Track Your Habits",
      description: "Build streaks. Break patterns. Stay consistent."
    },
    {
      icon: Brain,
      title: "AI Accountability Coach",
      description: "No excuses. No comfort. Just results."
    },
    {
      icon: Trophy,
      title: "Gamified Progress",
      description: "Level up as you build discipline."
    },
    {
      icon: Zap,
      title: "Daily Challenges",
      description: "Push your limits. Earn rewards."
    }
  ];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Light Pillar Background */}
      <LightPillar
        topColor="#8B5CF6"
        bottomColor="#EC4899"
        intensity={1.2}
        rotationSpeed={1.7}
        glowAmount={0.004}
        pillarWidth={2.5}
        pillarHeight={0.5}
        noiseIntensity={0.3}
      />

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 md:px-12 md:py-6">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white tracking-tight">QuestLog</span>
          </div>
          <Button 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
            onClick={() => navigate("/app")}
          >
            Launch App
          </Button>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
              Discipline is
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Built Daily
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              QuestLog transforms your habits into a game. Track progress, face accountability, 
              and level up your life. No excuses. Just action.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-semibold shadow-2xl shadow-purple-500/25"
                onClick={() => navigate("/app")}
              >
                Start Your Quest
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                className="text-white/80 hover:text-white hover:bg-white/10 px-8 py-6 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section className="px-6 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <feature.icon className="h-10 w-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-6 text-center">
          <p className="text-white/40 text-sm">
            Built for those who refuse to settle. Start today.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
