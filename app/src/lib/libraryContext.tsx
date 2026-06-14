import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./auth";
import { loadLibrary } from "./libraryLoader";
import type { LibraryBundle } from "./libraryTypes";
import { toStudyCards, type StudyCard } from "./libraryTypes";

interface LibraryContextValue {
  bundle: LibraryBundle | null;
  studyCards: StudyCard[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { libraryId } = useAuth();
  const [bundle, setBundle] = useState<LibraryBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLibrary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadLibrary(libraryId);
      setBundle(data);
    } catch (e) {
      setBundle(null);
      setError(e instanceof Error ? e.message : "Failed to load library");
    } finally {
      setLoading(false);
    }
  }, [libraryId]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const studyCards = useMemo(() => (bundle ? toStudyCards(bundle) : []), [bundle]);

  return (
    <LibraryContext.Provider
      value={{ bundle, studyCards, loading, error, reload: fetchLibrary }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
