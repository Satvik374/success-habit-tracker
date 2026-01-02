import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react';

interface AuthModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
    const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
    const [showResetPassword, setShowResetPassword] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signIn(email, password);
            onOpenChange(false);
            setEmail('');
            setPassword('');
        } catch (error) {
            // Error is handled in AuthContext
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return;
        }

        setLoading(true);
        try {
            await signUp(email, password);
            onOpenChange(false);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            // Error is handled in AuthContext
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            onOpenChange(false);
        } catch (error) {
            // Error is handled in AuthContext
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email);
            setShowResetPassword(false);
        } catch (error) {
            // Error is handled in AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-aura">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-aura-gradient flex items-center justify-center shadow-aura-glow animate-ripple-glow">
                            <Sparkles className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <DialogTitle className="font-display text-xl">Welcome to Quest Tracker</DialogTitle>
                            <DialogDescription>Sign in to save your progress across devices</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {showResetPassword ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reset-email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="reset-email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-muted border-border"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleResetPassword}
                            disabled={loading || !email}
                            className="w-full bg-aura-gradient text-primary-foreground shadow-aura-glow"
                        >
                            {loading ? 'Sending...' : 'Send Reset Email'}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setShowResetPassword(false)}
                            className="w-full"
                        >
                            Back to Sign In
                        </Button>
                    </div>
                ) : (
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-muted">
                            <TabsTrigger value="signin">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>

                        <TabsContent value="signin" className="space-y-4">
                            <form onSubmit={handleSignIn} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="pl-10 bg-muted border-border"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pl-10 bg-muted border-border"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => setShowResetPassword(true)}
                                    className="p-0 h-auto text-xs text-primary"
                                >
                                    Forgot password?
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-aura-gradient text-primary-foreground shadow-aura-glow hover:shadow-aura-glow-lg transition-all"
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full border-border hover:border-aura"
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </Button>
                        </TabsContent>

                        <TabsContent value="signup" className="space-y-4">
                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="pl-10 bg-muted border-border"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="pl-10 bg-muted border-border"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">At least 6 characters</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="pl-10 bg-muted border-border"
                                        />
                                    </div>
                                    {password && confirmPassword && password !== confirmPassword && (
                                        <p className="text-xs text-destructive">Passwords don't match</p>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading || password !== confirmPassword}
                                    className="w-full bg-aura-gradient text-primary-foreground shadow-aura-glow hover:shadow-aura-glow-lg transition-all"
                                >
                                    {loading ? 'Creating account...' : 'Create Account'}
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full border-border hover:border-aura"
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign up with Google
                            </Button>
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
