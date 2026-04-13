import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { CloudSyncAdapter, mergeLocalAndCloud } from '../../storage/cloudSync';
import { setProfileStoreAdapter } from '../../storage/profileStore';
import { LocalStorageAdapter } from '../../storage/localStorage';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  lastSynced: number | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<number | null>(() => {
    const stored = localStorage.getItem('mathhammer:lastSynced');
    return stored ? parseInt(stored, 10) : null;
  });

  async function handleSignIn(signedInUser: User) {
    const adapter = new CloudSyncAdapter(signedInUser.id);

    // First set the adapter so any writes during merge go to cloud
    setProfileStoreAdapter(adapter);

    // Merge local profiles with cloud (last-write-wins)
    try {
      await mergeLocalAndCloud(signedInUser.id);
      const ts = localStorage.getItem('mathhammer:lastSynced');
      setLastSynced(ts ? parseInt(ts, 10) : Date.now());
    } catch (err) {
      console.error('[AuthProvider] Merge failed:', err);
    }
  }

  function handleSignOut() {
    setProfileStoreAdapter(new LocalStorageAdapter());
    setLastSynced(null);
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        handleSignIn(sessionUser).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        handleSignIn(sessionUser);
      } else {
        handleSignOut();
      }
    });

    // Offline/online listener to sync when reconnected
    function handleOnline() {
      if (user) {
        mergeLocalAndCloud(user.id)
          .then(() => {
            const ts = localStorage.getItem('mathhammer:lastSynced');
            setLastSynced(ts ? parseInt(ts, 10) : Date.now());
          })
          .catch((err) => console.error('[AuthProvider] Reconnect sync failed:', err));
      }
    }

    window.addEventListener('online', handleOnline);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  }

  const value: AuthContextValue = {
    user,
    loading,
    lastSynced,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
