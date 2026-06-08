import { fetchWordDefinition } from "@/api/dictionaryApi";
import type { DictionaryEntry } from "@/utils/parseDictionaryResponse";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type DictionaryContextValue = {
  data: DictionaryEntry | null;
  loading: boolean;
  error: string | null;
  history: string[];
  committedWord: string;
  searchWord: (word: string) => Promise<DictionaryEntry | null>;
  clearError: () => void;
};

const DictionaryContext = createContext<DictionaryContextValue | null>(null);
const HISTORY_STORAGE_KEY = "dictionary.searchHistory";
const MAX_HISTORY_ITEMS = 20;

function normalizeHistory(words: string[]) {
  const seen = new Set<string>();

  return words
    .map((word) =>
      typeof word === "string" ? word.trim().toLowerCase() : "",
    )
    .filter((word) => {
      if (!word || seen.has(word)) {
        return false;
      }

      seen.add(word);
      return true;
    })
    .slice(0, MAX_HISTORY_ITEMS);
}

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [committedWord, setCommittedWord] = useState("");
  const [historyReady, setHistoryReady] = useState(false);
  const requestIdRef = useRef(0);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    void AsyncStorage.getItem(HISTORY_STORAGE_KEY)
      .then((value) => {
        if (!isMounted) {
          return;
        }

        if (!value) {
          setHistoryReady(true);
          return;
        }

        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            setHistory(normalizeHistory(parsed));
          }
        } catch {
          // Ignore malformed persisted data.
        } finally {
          setHistoryReady(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHistoryReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!historyReady) {
      return;
    }

    void AsyncStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(normalizeHistory(history)),
    ).catch(() => {
      // Persisting history should never block search flow.
    });
  }, [history, historyReady]);

  const searchWord = useCallback(async (word: string) => {
    const cleanWord = word.trim().toLowerCase();
    const requestId = ++requestIdRef.current;

    if (!cleanWord) {
      setError("Please enter a word before searching.");
      if (requestId === requestIdRef.current) {
        setData(null);
      }
      return null;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await fetchWordDefinition(cleanWord);
      if (requestId !== requestIdRef.current) {
        return result;
      }

      setData(result);
      if (result.word) {
        setCommittedWord(result.word.trim().toLowerCase());
      }
      setHistory((previous) => {
        if (!result.word) {
          return previous;
        }

        const normalized = result.word.trim().toLowerCase();
        if (!normalized) {
          return previous;
        }

        return normalizeHistory([
          normalized,
          ...previous.filter((item) => item !== normalized),
        ]);
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch word definition.";
      if (requestId !== requestIdRef.current) {
        return null;
      }

      setError(message);
      setData(null);
      return null;
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const value = useMemo<DictionaryContextValue>(
    () => ({
      data,
      loading,
      error,
      history,
      committedWord,
      searchWord,
      clearError,
    }),
    [clearError, committedWord, data, error, history, loading, searchWord],
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
