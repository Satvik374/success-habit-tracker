import { doc, setDoc, getDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase.config';

export interface GameState {
    level: number;
    xp: number;
    streak: number;
    habits: any[];
    tasks: any[];
    achievements: any[];
    totalHabitsCompleted: number;
    totalTasksCompleted: number;
    totalXpEarned: number;
    perfectDays: number;
    lastActive: string;
    updatedAt: string;
}

/**
 * Save user's game state to Firestore
 */
export const saveUserData = async (userId: string, gameState: GameState): Promise<void> => {
    try {
        const userDocRef = doc(db, 'users', userId, 'data', 'gameState');
        await setDoc(userDocRef, {
            ...gameState,
            updatedAt: new Date().toISOString(),
        }, { merge: true });
    } catch (error) {
        console.error('Error saving user data:', error);
        throw error;
    }
};

/**
 * Load user's game state from Firestore
 */
export const loadUserData = async (userId: string): Promise<GameState | null> => {
    try {
        const userDocRef = doc(db, 'users', userId, 'data', 'gameState');
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            return docSnap.data() as GameState;
        }
        return null;
    } catch (error) {
        console.error('Error loading user data:', error);
        throw error;
    }
};

/**
 * Subscribe to real-time updates of user's game state
 */
export const subscribeToUserData = (
    userId: string,
    callback: (data: GameState | null) => void
): Unsubscribe => {
    const userDocRef = doc(db, 'users', userId, 'data', 'gameState');

    return onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data() as GameState);
        } else {
            callback(null);
        }
    }, (error) => {
        console.error('Error in real-time subscription:', error);
        callback(null);
    });
};

/**
 * Migrate local storage data to Firestore
 */
export const migrateLocalData = async (userId: string): Promise<void> => {
    try {
        // Check if we have local data
        const localData = localStorage.getItem('habitTrackerGameState');
        if (!localData) return;

        const parsedData = JSON.parse(localData);

        // Check if user already has cloud data
        const existingData = await loadUserData(userId);
        if (existingData) {
            // User already has cloud data, don't overwrite
            console.log('User already has cloud data, skipping migration');
            return;
        }

        // Save local data to Firestore
        await saveUserData(userId, {
            ...parsedData,
            updatedAt: new Date().toISOString(),
        });

        console.log('Successfully migrated local data to cloud');
    } catch (error) {
        console.error('Error migrating local data:', error);
        throw error;
    }
};

/**
 * Save user profile information
 */
export const saveUserProfile = async (userId: string, profileData: {
    email: string;
    displayName?: string;
    photoURL?: string;
}): Promise<void> => {
    try {
        const profileDocRef = doc(db, 'users', userId, 'data', 'profile');
        await setDoc(profileDocRef, {
            ...profileData,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        }, { merge: true });
    } catch (error) {
        console.error('Error saving user profile:', error);
        throw error;
    }
};
