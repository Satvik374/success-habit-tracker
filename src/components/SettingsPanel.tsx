import { Settings, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSettings } from '@/contexts/SettingsContext';

const SettingsPanel = () => {
  const { settings, setSoundEnabled, setConfettiEnabled } = useSettings();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg hover:bg-muted"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Settings
          </h3>
          
          <div className="space-y-4">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-primary" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
                <Label htmlFor="sound-toggle" className="text-sm font-medium">
                  Sound Effects
                </Label>
              </div>
              <Switch
                id="sound-toggle"
                checked={settings.soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
            
            {/* Confetti Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${settings.confettiEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                <Label htmlFor="confetti-toggle" className="text-sm font-medium">
                  Confetti Effects
                </Label>
              </div>
              <Switch
                id="confetti-toggle"
                checked={settings.confettiEnabled}
                onCheckedChange={setConfettiEnabled}
              />
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            Toggle celebration effects when completing tasks and habits.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SettingsPanel;
