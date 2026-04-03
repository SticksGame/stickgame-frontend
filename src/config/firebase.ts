import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
} = import.meta.env;

const isConfigured = Boolean(VITE_FIREBASE_API_KEY && VITE_FIREBASE_PROJECT_ID);

if (!isConfigured) {
  console.warn('[Firebase] Missing environment variables — auth will not work. Copy .env.example to .env and fill in your Firebase config.');
}

const app = isConfigured && getApps().length === 0
  ? initializeApp({
      apiKey: VITE_FIREBASE_API_KEY,
      authDomain: VITE_FIREBASE_AUTH_DOMAIN,
      projectId: VITE_FIREBASE_PROJECT_ID,
      storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: VITE_FIREBASE_APP_ID,
    })
  : getApps()[0];

export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();

