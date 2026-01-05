import { Crown, Lock } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PremiumBadgeProps {
  feature?: string;
  showUpgrade?: boolean;
  onUpgradeClick?: () => void;
  size?: 'sm' | 'md';
}

const PremiumBadge = ({ feature, showUpgrade = true, onUpgradeClick, size = 'md' }: PremiumBadgeProps) => {
  const { isPremium } = useSubscription();

  if (isPremium) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600 ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}>
        <Crown className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        Premium
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground cursor-pointer ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`} onClick={onUpgradeClick}>
          <Lock className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          Premium
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{feature || 'This feature'} requires Premium</p>
        {showUpgrade && <p className="text-xs text-muted-foreground">Click to upgrade</p>}
      </TooltipContent>
    </Tooltip>
  );
};

export default PremiumBadge;
