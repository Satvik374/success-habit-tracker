import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';

interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired';
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}

interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  plan: string;
  status: string;
  created_at: string;
  razorpay_payment_id: string | null;
}

interface SubscriptionContextType {
  plan: SubscriptionPlan;
  isPremium: boolean;
  setPlan: (plan: SubscriptionPlan) => void;
  subscription: Subscription | null;
  paymentHistory: PaymentHistoryItem[];
  loadingSubscription: boolean;
  cancelSubscription: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  features: {
    aiCoach: boolean;
    unlimitedHabits: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    customThemes: boolean;
    weeklyReports: boolean;
  };
  planDetails: {
    monthly: { price: number; currency: string };
    yearly: { price: number; currency: string; savings: string };
  };
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [plan, setPlanState] = useState<SubscriptionPlan>('free');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  // Fetch subscription from database when user changes
  const fetchSubscription = async () => {
    if (!user?.uid) {
      setPlanState('free');
      setSubscription(null);
      setPaymentHistory([]);
      setLoadingSubscription(false);
      return;
    }

    setLoadingSubscription(true);
    try {
      // Fetch subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.uid)
        .maybeSingle();

      if (subError) {
        console.error('Error fetching subscription:', subError);
      }

      if (subData) {
        const typedSubscription = subData as unknown as Subscription;
        setSubscription(typedSubscription);
        
        // Check if subscription is still active
        const isActive = typedSubscription.status === 'active';
        const notExpired = !typedSubscription.ends_at || new Date(typedSubscription.ends_at) > new Date();
        
        if (isActive && notExpired) {
          setPlanState(typedSubscription.plan);
        } else {
          setPlanState('free');
        }
      } else {
        setSubscription(null);
        setPlanState('free');
      }

      // Fetch payment history
      const { data: historyData, error: historyError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });

      if (historyError) {
        console.error('Error fetching payment history:', historyError);
      } else {
        setPaymentHistory((historyData as unknown as PaymentHistoryItem[]) || []);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user?.uid]);

  // Save subscription to database
  const setPlan = async (newPlan: SubscriptionPlan) => {
    if (!user?.uid) {
      setPlanState(newPlan);
      return;
    }

    try {
      const now = new Date().toISOString();
      const endsAt = newPlan === 'yearly' 
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : newPlan === 'monthly'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.uid,
          plan: newPlan,
          status: 'active',
          starts_at: now,
          ends_at: endsAt,
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving subscription:', error);
      }

      setPlanState(newPlan);
      await fetchSubscription();
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const cancelSubscription = async () => {
    if (!user?.uid || !subscription) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', user.uid);

      if (error) {
        console.error('Error cancelling subscription:', error);
        throw error;
      }

      await fetchSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  const isPremium = plan === 'monthly' || plan === 'yearly';

  const features = {
    aiCoach: isPremium,
    unlimitedHabits: isPremium,
    advancedAnalytics: isPremium,
    prioritySupport: isPremium,
    customThemes: isPremium,
    weeklyReports: plan === 'yearly',
  };

  const planDetails = {
    monthly: { price: 199, currency: '₹' },
    yearly: { price: 599, currency: '₹', savings: 'Save ₹1,789/year' },
  };

  const value: SubscriptionContextType = {
    plan,
    isPremium,
    setPlan,
    subscription,
    paymentHistory,
    loadingSubscription,
    cancelSubscription,
    refreshSubscription,
    features,
    planDetails,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};
