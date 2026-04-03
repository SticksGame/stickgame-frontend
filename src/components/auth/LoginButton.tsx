import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

export function LoginButton() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return (
      <button onClick={() => signOut(auth)}>
        Sign out ({user.displayName})
      </button>
    );
  }

  return (
    <button onClick={() => signInWithPopup(auth, googleProvider)}>
      Sign in with Google
    </button>
  );
}
