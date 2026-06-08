import { fetchWordDefinition } from "@/api/dictionaryApi";
import type { DictionaryEntry } from "@/utils/parseDictionaryResponse";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type DictionaryContextValue = {
  data: DictionaryEntry | null;
  loading: boolean;
  liveLoading: boolean;
  error: string | null;
  history: string[];
  committedWord: string;
  searchWord: (
    word: string,
    options?: { silent?: boolean },
  ) => Promise<DictionaryEntry | null>;
  cancelPendingSearches: () => void;
  clearError: () => void;
};

const DictionaryContext = createContext<DictionaryContextValue | null>(null);

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [committedWord, setCommittedWord] = useState("");
  const requestIdRef = useRef(0);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const cancelPendingSearches = useCallback(() => {
    requestIdRef.current += 1;
    setLoading(false);
    setLiveLoading(false);
  }, []);

  const searchWord = useCallback(async (
    word: string,
    options?: { silent?: boolean },
  ) => {
    const cleanWord = word.trim().toLowerCase();
    const requestId = ++requestIdRef.current;

    if (!cleanWord) {
      if (!options?.silent) {
        setError("Please enter a word before searching.");
      }
      if (!options?.silent && requestId === requestIdRef.current) {
        setData(null);
      }
      return null;
    }

    if (options?.silent) {
      setLiveLoading(true);
    } else {
      setLoading(true);
      setLiveLoading(false);
    }
    if (!options?.silent) {
      setError(null);
    }
    if (!options?.silent) {
      setData(null);
    }

    try {
      const result = await fetchWordDefinition(cleanWord);
      if (requestId !== requestIdRef.current) {
        return result;
      }

      setData(result);
      if (!options?.silent && result.word) {
        setCommittedWord(result.word.trim().toLowerCase());
      }
      if (!options?.silent) {
        setHistory((previous) => {
          if (!result.word) {
            return previous;
          }

          const normalized = result.word.trim().toLowerCase();
          if (!normalized) {
            return previous;
          }

          return [normalized, ...previous.filter((item) => item !== normalized)].slice(0, 20);
        });
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch word definition.";
      if (requestId !== requestIdRef.current) {
        return null;
      }

      if (!options?.silent) {
        setError(message);
      } else {
        setError(null);
      }
      if (!options?.silent) {
        setData(null);
      }
      return null;
    } finally {
      if (requestId === requestIdRef.current) {
        if (options?.silent) {
          setLiveLoading(false);
        } else {
          setLoading(false);
        }
      }
    }
  }, []);

  const value = useMemo<DictionaryContextValue>(
    () => ({
      data,
      loading,
      liveLoading,
      error,
      history,
      committedWord,
      searchWord,
      cancelPendingSearches,
      clearError,
    }),
    [
      cancelPendingSearches,
      clearError,
      committedWord,
      data,
      error,
      history,
      liveLoading,
      loading,
      searchWord,
    ],
  );

  return (
    <DictionaryContext.Provider value={value}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error("useDictionary must be used within a DictionaryProvider");
  }
  return context;
}
