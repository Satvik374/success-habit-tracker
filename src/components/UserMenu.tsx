import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';

const UserMenu = () => {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await signOut();
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    // Get display name or email
    const displayName = user.displayName || user.email?.split('@')[0] || 'User';
    const email = user.email || '';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 border-aura hover:shadow-aura-glow">
                    <div className="w-8 h-8 rounded-full bg-aura-gradient flex items-center justify-center shadow-aura-glow">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt={displayName} className="w-full h-full rounded-full" />
                        ) : (
                            <User className="w-4 h-4 text-primary-foreground" />
                        )}
                    </div>
                    <span className="text-sm font-medium hidden md:inline">{displayName}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-aura">
                <DropdownMenuLabel>
                    <div>
                        <p className="font-medium">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={loading}
                    className="cursor-pointer hover:bg-destructive/10 text-destructive focus:text-destructive"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    {loading ? 'Signing out...' : 'Sign Out'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserMenu;
