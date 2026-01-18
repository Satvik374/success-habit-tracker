import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSubscription, SubscriptionPlan } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Crown, Zap, BarChart3, Shield, Palette, FileText, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PricingModal = ({ open, onOpenChange }: PricingModalProps) => {
  const { user } = useAuth();
  const { plan, setPlan, planDetails, refreshSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const features = [
    { icon: Zap, label: 'AI Accountability Coach', description: 'Strict discipline-focused AI coach' },
    { icon: Check, label: 'Unlimited Habits', description: 'Track as many habits as you want' },
    { icon: BarChart3, label: 'Advanced Analytics', description: 'Deep insights into your progress' },
    { icon: Shield, label: 'Priority Support', description: 'Get help when you need it' },
    { icon: Palette, label: 'Custom Themes', description: 'Personalize your experience' },
    { icon: FileText, label: 'Weekly Reports', description: 'Detailed accountability reports', yearlyOnly: true },
  ];

  const handleSubscribe = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment system is loading. Please try again.');
      return;
    }

    if (!user) {
      toast.error('Please sign in to subscribe.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const amount = planDetails[selectedPlan].price;
      
      // Create order via edge function
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: amount,
          currency: 'INR',
          plan: selectedPlan,
        },
      });

      if (orderError || !orderData) {
        console.error('Order creation error:', orderError);
        throw new Error(orderError?.message || 'Failed to create order');
      }

      console.log('Order created:', orderData);

      // Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Success Habit Tracker',
        description: `${selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} Premium Subscription`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          console.log('Payment successful:', response);
          
          // Verify payment and save to database
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: selectedPlan,
              user_id: user.uid,
              amount: amount,
            },
          });

          if (verifyError || !verifyData?.success) {
            console.error('Payment verification failed:', verifyError);
            toast.error('Payment verification failed. Please contact support.');
            setIsProcessing(false);
            return;
          }

          // Payment successful - refresh subscription from database
          await refreshSubscription();
          setIsProcessing(false);
          onOpenChange(false);
          toast.success(`🎉 Welcome to Premium! You're now on the ${selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} plan.`);
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#8B5CF6',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
      
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
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
              disabled={isProcessing || !razorpayLoaded}
              className="w-full mt-6 h-12 bg-aura-gradient text-primary-foreground font-semibold"
            >
              {isProcessing ? (
                'Processing...'
              ) : !razorpayLoaded ? (
                'Loading payment...'
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Pay {planDetails[selectedPlan].currency}
                  {planDetails[selectedPlan].price} with Razorpay
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-3">
              Secure payment powered by Razorpay. Cancel anytime.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;
