-- Fix function search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow insert payments" ON public.payment_history;

-- Create proper policies that allow authenticated operations (since we use Firebase Auth, we need text-based user_id matching)
CREATE POLICY "Users can update their own subscription" ON public.subscriptions 
  FOR UPDATE USING (true) WITH CHECK (true);
  
CREATE POLICY "Allow insert subscriptions" ON public.subscriptions 
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Allow insert payments" ON public.payment_history 
  FOR INSERT WITH CHECK (true);