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
};

const AuthContext = createContext<AuthContextType>({ user: null, session: null, role: null, permissions: [], loading: true });

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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error || (session && isTokenExpired(session))) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setRole(null);
        setPermissions([]);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) await fetchProfileData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, role, permissions, loading }}>
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
