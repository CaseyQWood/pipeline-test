import { useAuthContext } from '../components/auth/AuthProvider';

/**
 * Hook to access auth state and actions.
 *
 * Must be used inside an AuthProvider.
 * Returns: { user, loading, lastSynced, signIn, signUp, signOut, signInWithGoogle }
 */
export function useAuth() {
  return useAuthContext();
}
