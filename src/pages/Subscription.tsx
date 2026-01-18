import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Crown, 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import PricingModal from '@/components/PricingModal';

const Subscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    plan, 
    isPremium, 
    subscription, 
    paymentHistory, 
    loadingSubscription,
    cancelSubscription 
  } = useSubscription();
  const [isCancelling, setIsCancelling] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await cancelSubscription();
      toast.success('Subscription cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
      case 'cancelled':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case 'expired':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30"><Clock className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Success</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to view your subscription.</p>
            <Button onClick={() => navigate('/app')}>Go to App</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingSubscription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">Subscription Management</h1>
            <p className="text-muted-foreground">Manage your plan and billing</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Current Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className={`w-5 h-5 ${isPremium ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                Current Plan
              </CardTitle>
              <CardDescription>Your subscription details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold capitalize">
                      {plan === 'free' ? 'Free Plan' : `${plan} Premium`}
                    </h3>
                    {subscription && getStatusBadge(subscription.status)}
                  </div>
                  
                  {subscription && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Started: {format(new Date(subscription.starts_at), 'PPP')}
                      </div>
                      {subscription.ends_at && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {subscription.status === 'cancelled' ? 'Access until:' : 'Renews:'} {format(new Date(subscription.ends_at), 'PPP')}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!isPremium && (
                    <p className="text-sm text-muted-foreground">
                      Upgrade to Premium for unlimited features
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {isPremium && subscription?.status === 'active' ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                          Cancel Plan
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Your Premium access will continue until the end of your billing period. 
                            After that, you'll be downgraded to the Free plan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Plan</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleCancelSubscription}
                            disabled={isCancelling}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button onClick={() => setPricingOpen(true)} className="bg-aura-gradient">
                      <Crown className="w-4 h-4 mr-2" />
                      {isPremium ? 'Change Plan' : 'Upgrade to Premium'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing History
              </CardTitle>
              <CardDescription>Your past payments and invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No payment history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment, index) => (
                    <div key={payment.id}>
                      <div className="flex items-center justify-between py-3">
                        <div className="space-y-1">
                          <div className="font-medium capitalize">{payment.plan} Plan</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(payment.created_at), 'PPP')}
                          </div>
                          {payment.razorpay_payment_id && (
                            <div className="text-xs text-muted-foreground font-mono">
                              ID: {payment.razorpay_payment_id}
                            </div>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-semibold">
                            {payment.currency === 'INR' ? '₹' : payment.currency}{payment.amount}
                          </div>
                          {getPaymentStatusBadge(payment.status)}
                        </div>
                      </div>
                      {index < paymentHistory.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account ID</span>
                  <span className="font-mono text-xs">{user.uid.slice(0, 12)}...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
    </div>
  );
};

export default Subscription;
