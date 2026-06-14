import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getAuthInstance, getDb, isFirebaseConfigured } from "./firebase";
import { SocratesClient } from "./socratesClient";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  error: string | null;
  userId: string;
  libraryId: string;
  client: SocratesClient | null;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const envUserId = import.meta.env.VITE_USER_ID as string | undefined;
const envLibraryId = import.meta.env.VITE_LIBRARY_ID as string | undefined;
const envDeviceId = import.meta.env.VITE_DEVICE_ID as string | undefined;
const envEmail = import.meta.env.VITE_DEV_EMAIL as string | undefined;
const envPassword = import.meta.env.VITE_DEV_PASSWORD as string | undefined;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const configured = isFirebaseConfigured();
  const userId = user?.uid ?? envUserId ?? "";
  const libraryId = envLibraryId ?? "lib_dev_001";

  const client = useMemo(() => {
    if (!configured || !userId) return null;
    return new SocratesClient(getDb(), userId, libraryId, envDeviceId ?? "web_dev");
  }, [configured, userId, libraryId]);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(getAuthInstance(), (nextUser) => {
      setUser(nextUser);
      setLoading(false);

      if (nextUser && envUserId && nextUser.uid !== envUserId) {
        setError(
          `Signed-in UID (${nextUser.uid}) does not match VITE_USER_ID (${envUserId}). Firestore rules require they match.`
        );
      } else {
        setError(null);
      }
    });

    return unsubscribe;
  }, [configured]);

  async function signIn() {
    if (!envEmail || !envPassword) {
      setError("Set VITE_DEV_EMAIL and VITE_DEV_PASSWORD in .env.local");
      return;
    }
    setError(null);
    await signInWithEmailAndPassword(getAuthInstance(), envEmail, envPassword);
  }

  async function signOutUser() {
    await signOut(getAuthInstance());
  }

  const value: AuthContextValue = {
    user,
    loading,
    configured,
    error,
    userId,
    libraryId,
    client,
    signIn,
    signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
