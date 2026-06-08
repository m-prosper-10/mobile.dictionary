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
  const { data, loading, error, history, searchWord, clearError } =
    useDictionary();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (data?.word) {
      setQuery(data.word);
    }
  }, [data?.word]);

  useEffect(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 4) {
      return;
    }

    const timer = setTimeout(() => {
      void searchWord(cleanQuery, { silent: true });
    }, 450);

    return () => clearTimeout(timer);
  }, [query, searchWord]);

  const suggestions = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) {
      return history.slice(0, 6);
    }

    return history
      .filter((word) => word.startsWith(cleanQuery))
      .slice(0, 6);
  }, [history, query]);

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
          loading={loading}
        />

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorMessage message={error} onRetry={handleSearch} />
        ) : data ? (
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
        ) : (
          <EmptyState />
        )}
      </View>
    </ScrollView>
  );
}
