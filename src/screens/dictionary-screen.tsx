import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { ErrorMessage } from "@/components/error-message";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { MeaningCard } from "@/components/meaning-card";
import { SearchInput } from "@/components/search-input";
import { WordHeader } from "@/components/word-header";
import { useDictionary } from "@/components/dictionary-provider";

export function DictionaryScreen() {
  const {
    data,
    loading,
    liveLoading,
    error,
    history,
    committedWord,
    searchWord,
    clearError,
  } = useDictionary();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (committedWord) {
      setQuery(committedWord);
    }
  }, [committedWord]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 3) {
      return;
    }
    if (data?.word?.trim().toLowerCase() === cleanQuery) {
      return;
    }

    const timer = setTimeout(() => {
      void searchWord(cleanQuery, { silent: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [data?.word, loading, query, searchWord]);

  const suggestions = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    const seen = new Set<string>();
    const ranked: string[] = [];

    if (!cleanQuery) {
      return history.slice(0, 8);
    }

    const push = (word: string) => {
      const normalized = word.trim().toLowerCase();
      if (!normalized || seen.has(normalized)) {
        return;
      }

      seen.add(normalized);
      ranked.push(normalized);
    };

    history.forEach((word) => {
      if (word.startsWith(cleanQuery)) {
        push(word);
      }
    });

    history.forEach((word) => {
      if (word.includes(cleanQuery)) {
        push(word);
      }
    });

    return ranked.slice(0, 8);
  }, [history, query]);

  const cleanQuery = query.trim().toLowerCase();
  const hasMatchingResult = Boolean(
    data?.word && data.word.trim().toLowerCase() === cleanQuery,
  );

  async function handleSearch(value = query) {
    const result = await searchWord(value);
    if (result?.word) {
      setQuery(result.word);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="android:pb-safe px-5 py-4"
    >
      <View className="gap-5">
        <View className="gap-2">
          <Text className="text-[28px] font-bold text-foreground">
            Dictionary
          </Text>
          <Text className="text-[14px] leading-snug text-muted-foreground">
            Search English words, meanings, examples, and pronunciations.
          </Text>
        </View>

        <SearchInput
          value={query}
          onChangeText={(value) => {
            setQuery(value);
            clearError();
          }}
          onSubmit={() => handleSearch()}
          onClear={() => {
            setQuery("");
            clearError();
          }}
          suggestions={suggestions}
          onSelectSuggestion={(value) => {
            setQuery(value);
            void handleSearch(value);
          }}
          loading={loading || liveLoading}
        />

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorMessage message={error} onRetry={handleSearch} />
        ) : hasMatchingResult ? (
          <View className="gap-4">
            <WordHeader wordData={data} />

            <View className="gap-3">
              <Text className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                Meanings
              </Text>
              <View className="gap-3">
                {data.meanings.map((meaning, index) => (
                  <MeaningCard
                    key={`${meaning.partOfSpeech}-${index}`}
                    meaning={meaning}
                  />
                ))}
              </View>
            </View>
          </View>
        ) : cleanQuery ? (
          <EmptyState
            title="Keep typing or pick a suggestion"
            description="Live results and recent matches update as you type. Tap one to search instantly."
          />
        ) : (
          <EmptyState />
        )}
      </View>
    </ScrollView>
  );
}
