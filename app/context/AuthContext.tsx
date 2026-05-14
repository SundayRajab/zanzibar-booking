import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/app/lib/supabase';

interface AuthContextProps {
  user: any | null;
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Auth error', error);
    }
    if (session?.user) {
      setUser(session.user);
      // fetch role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      setRole(profile?.role ?? null);
    } else {
      setUser(null);
      setRole(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSession();
    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, _session) => {
      fetchSession();
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await fetchSession();
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
