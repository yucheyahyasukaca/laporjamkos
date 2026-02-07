import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'picket';

export const useUserRole = () => {
    const [role, setRole] = useState<UserRole>('admin'); // Default to admin for safety/backward compat
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const user = session?.user;
                if (user) {
                    // Check metadata first
                    if (user.user_metadata?.role) {
                        setRole(user.user_metadata.role as UserRole);
                    }
                    // Fallback: Check email if metadata is missing/empty
                    else if (user.email?.toLowerCase().includes('piket')) {
                        console.log('Role detected from email: picket');
                        setRole('picket');
                    }
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRole();
    }, []);

    return { role, loading };
};
