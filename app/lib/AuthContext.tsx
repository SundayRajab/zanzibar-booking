"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  role: 'admin' | 'provider' | 'user' | null;
  permissions: string[];
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  session: null, 
  role: null, 
  permissions: [], 
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'admin' | 'provider' | 'user' | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async (userId: string) => {
    // Fetch role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (profile) setRole(profile.role);

    // If provider, fetch permissions
    if (profile?.role === 'provider') {
      const { data: perms } = await supabase.from('provider_permissions').select('permission').eq('provider_id', userId);
      if (perms) setPermissions(perms.map((p: any) => p.permission));
    }
  };

  const refreshUser = async () => {
    const { data: { user: updatedUser } } = await supabase.auth.getUser();
    setUser(updatedUser);
    if (updatedUser) await fetchProfileData(updatedUser.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; // Force redirect to home
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      // Get initial session safely
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!mounted) return;

      if (error || (session && isTokenExpired(session))) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setRole(null);
        setPermissions([]);
      } else if (session) {
        setSession(session);
        setUser(session.user);
        await fetchProfileData(session.user.id);
      }
      setLoading(false);
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfileData(session.user.id);
      } else {
        setRole(null);
        setPermissions([]);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, role, permissions, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Check if the JWT access token is expired
function isTokenExpired(session: Session): boolean {
  if (!session.expires_at) return false;
  // expires_at is in seconds since epoch
  return Date.now() / 1000 > session.expires_at;
}

export const useAuth = () => useContext(AuthContext);
