import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';

interface SubscriptionContextType {
  plan: SubscriptionPlan;
  isPremium: boolean;
  setPlan: (plan: SubscriptionPlan) => void;
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

const PLAN_STORAGE_KEY = 'quest-tracker-subscription';

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [plan, setPlanState] = useState<SubscriptionPlan>('free');

  // Load plan from localStorage on mount
  useEffect(() => {
    const storedPlan = localStorage.getItem(PLAN_STORAGE_KEY);
    if (storedPlan && ['free', 'monthly', 'yearly'].includes(storedPlan)) {
      setPlanState(storedPlan as SubscriptionPlan);
    }
  }, []);

  // Save plan to localStorage when it changes
  const setPlan = (newPlan: SubscriptionPlan) => {
    setPlanState(newPlan);
    localStorage.setItem(PLAN_STORAGE_KEY, newPlan);
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
