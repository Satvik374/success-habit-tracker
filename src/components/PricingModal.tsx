import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSubscription, SubscriptionPlan } from '@/contexts/SubscriptionContext';
import { Check, Crown, Zap, BarChart3, Shield, Palette, FileText, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PricingModal = ({ open, onOpenChange }: PricingModalProps) => {
  const { plan, setPlan, planDetails } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  const features = [
    { icon: Zap, label: 'AI Accountability Coach', description: 'Strict discipline-focused AI coach' },
    { icon: Check, label: 'Unlimited Habits', description: 'Track as many habits as you want' },
    { icon: BarChart3, label: 'Advanced Analytics', description: 'Deep insights into your progress' },
    { icon: Shield, label: 'Priority Support', description: 'Get help when you need it' },
    { icon: Palette, label: 'Custom Themes', description: 'Personalize your experience' },
    { icon: FileText, label: 'Weekly Reports', description: 'Detailed accountability reports', yearlyOnly: true },
  ];

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing (will be replaced with Razorpay later)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setPlan(selectedPlan);
    setIsProcessing(false);
    onOpenChange(false);
    toast.success(`Upgraded to ${selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} plan. Welcome to Premium.`);
  };

  const isPremium = plan === 'monthly' || plan === 'yearly';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-display">
            <Crown className="w-6 h-6 text-yellow-500" />
            Upgrade to Premium
          </DialogTitle>
        </DialogHeader>

        {isPremium ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">You are already Premium</h3>
            <p className="text-muted-foreground">
              Current plan: <span className="font-medium text-foreground capitalize">{plan}</span>
            </p>
          </div>
        ) : (
          <>
            {/* Plan Selection */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Monthly Plan */}
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  selectedPlan === 'monthly'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-semibold text-lg">Monthly</div>
                <div className="text-2xl font-bold mt-1">
                  {planDetails.monthly.currency}{planDetails.monthly.price}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Billed monthly</p>
              </button>

              {/* Yearly Plan */}
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  selectedPlan === 'yearly'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="absolute -top-3 right-3 px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
                  BEST VALUE
                </div>
                <div className="font-semibold text-lg">Yearly</div>
                <div className="text-2xl font-bold mt-1">
                  {planDetails.yearly.currency}{planDetails.yearly.price}
                  <span className="text-sm font-normal text-muted-foreground">/year</span>
                </div>
                <p className="text-sm text-green-600 mt-2">{planDetails.yearly.savings}</p>
              </button>
            </div>

            {/* Features List */}
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                What you get
              </h4>
              {features.map((feature) => (
                <div
                  key={feature.label}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    feature.yearlyOnly && selectedPlan !== 'yearly'
                      ? 'opacity-50'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      {feature.label}
                      {feature.yearlyOnly && (
                        <span className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-600 rounded">
                          Yearly only
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Subscribe Button */}
            <Button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full mt-6 h-12 bg-aura-gradient text-primary-foreground font-semibold"
            >
              {isProcessing ? (
                'Processing...'
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Subscribe for {planDetails[selectedPlan].currency}
                  {planDetails[selectedPlan].price}/{selectedPlan === 'yearly' ? 'year' : 'month'}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-3">
              Payment integration coming soon. Currently simulated for demo.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;
