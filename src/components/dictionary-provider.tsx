import { fetchWordDefinition } from "@/api/dictionaryApi";
import type { DictionaryEntry } from "@/utils/parseDictionaryResponse";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DictionaryContextValue = {
  data: DictionaryEntry | null;
  loading: boolean;
  error: string | null;
  history: string[];
  searchWord: (word: string) => Promise<DictionaryEntry | null>;
  clearError: () => void;
};

const DictionaryContext = createContext<DictionaryContextValue | null>(null);

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const searchWord = useCallback(async (word: string) => {
    const cleanWord = word.trim().toLowerCase();

    if (!cleanWord) {
      setError("Please enter a word before searching.");
      setData(null);
      return null;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await fetchWordDefinition(cleanWord);
      setData(result);
      setHistory((previous) => {
        if (!result.word) {
          return previous;
        }

        const normalized = result.word.trim().toLowerCase();
        if (!normalized || previous.includes(normalized)) {
          return previous;
        }

        return [normalized, ...previous].slice(0, 20);
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch word definition.";
      setError(message);
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<DictionaryContextValue>(
    () => ({
      data,
      loading,
      error,
      history,
      searchWord,
      clearError,
    }),
    [clearError, data, error, history, loading, searchWord],
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
