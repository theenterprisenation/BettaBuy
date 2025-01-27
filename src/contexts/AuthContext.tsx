import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isVendor: boolean;
  isSupport: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          roles (
            name
          )
        `)
        .eq('id', userId)
        .maybeSingle();

      if (!error && data?.roles) {
        setUserRole(data.roles.name);
      } else {
        // If no role is found, create a new user record with default role
        const { data: roleData } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'user')
          .single();

        if (roleData) {
          await supabase
            .from('users')
            .insert({
              id: userId,
              role_id: roleData.id
            });
          setUserRole('user');
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = userRole === 'admin';
  const isVendor = userRole === 'vendor';
  const isSupport = userRole === 'support';

  return (
    <AuthContext.Provider value={{ user, loading, signOut, isAdmin, isVendor, isSupport }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}