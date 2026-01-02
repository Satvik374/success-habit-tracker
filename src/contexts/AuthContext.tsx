import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase.config';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signUp = async (email: string, password: string) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            toast.success('Account created successfully!');
        } catch (error: any) {
            console.error('Sign up error:', error);
            if (error.code === 'auth/email-already-in-use') {
                toast.error('Email already in use');
            } else if (error.code === 'auth/weak-password') {
                toast.error('Password should be at least 6 characters');
            } else {
                toast.error('Failed to create account');
            }
            throw error;
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('Signed in successfully!');
        } catch (error: any) {
            console.error('Sign in error:', error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                toast.error('Invalid email or password');
            } else {
                toast.error('Failed to sign in');
            }
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            toast.success('Signed in with Google!');
        } catch (error: any) {
            console.error('Google sign in error:', error);
            toast.error('Failed to sign in with Google');
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            toast.success('Signed out successfully');
        } catch (error) {
            console.error('Sign out error:', error);
            toast.error('Failed to sign out');
            throw error;
        }
    };

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success('Password reset email sent!');
        } catch (error: any) {
            console.error('Password reset error:', error);
            if (error.code === 'auth/user-not-found') {
                toast.error('No account found with this email');
            } else {
                toast.error('Failed to send reset email');
            }
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
