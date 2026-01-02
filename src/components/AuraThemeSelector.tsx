import { useAuraTheme } from '@/contexts/AuraThemeContext';
import { Sparkles } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

const AuraThemeSelector = () => {
    const { theme: currentTheme, setTheme, allThemes } = useAuraTheme();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-all hover:shadow-glow">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
                    <span className="text-sm font-medium text-foreground hidden md:inline">Aura</span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 bg-card border-border">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Choose Your Aura</p>
                    <div className="grid grid-cols-1 gap-2">
                        {(Object.entries(allThemes) as [string, typeof allThemes[keyof typeof allThemes]][]).map(([key, colors]) => {
                            const isActive = currentTheme === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setTheme(key as any)}
                                    className={`relative flex items-center gap-3 p-3 rounded-lg transition-all ${isActive
                                            ? 'bg-primary/20 ring-2 ring-primary shadow-glow'
                                            : 'bg-muted hover:bg-muted/80 hover:shadow-md'
                                        }`}
                                    style={{
                                        boxShadow: isActive
                                            ? `0 0 20px hsl(${colors.glow} / 0.4)`
                                            : undefined,
                                    }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-md animate-pulse-glow"
                                        style={{
                                            background: colors.gradient,
                                        }}
                                    >
                                        {colors.icon}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-semibold text-foreground">{colors.name}</p>
                                        <div className="flex gap-1 mt-1">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ background: `hsl(${colors.primary})` }}
                                            />
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ background: `hsl(${colors.secondary})` }}
                                            />
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ background: `hsl(${colors.accent})` }}
                                            />
                                        </div>
                                    </div>
                                    {isActive && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <svg
                                                className="w-3 h-3 text-primary-foreground"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default AuraThemeSelector;
