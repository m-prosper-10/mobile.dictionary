import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { ErrorMessage } from "@/components/error-message";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { MeaningCard } from "@/components/meaning-card";
import { SearchInput } from "@/components/search-input";
import { WordHeader } from "@/components/word-header";
import { fetchWordSuggestions } from "@/api/datamuseApi";
import { useDictionary } from "@/components/dictionary-provider";

export function DictionaryScreen() {
  const {
    data,
    loading,
    error,
    committedWord,
    searchWord,
    clearError,
  } = useDictionary();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const suppressSuggestionsRef = useRef(false);
  const suggestionsRequestIdRef = useRef(0);

  useEffect(() => {
    if (committedWord) {
      setQuery(committedWord);
    }
  }, [committedWord]);

  useEffect(() => {
    const cleanQuery = query.trim().toLowerCase();

    if (suppressSuggestionsRef.current || cleanQuery.length < 2) {
      suggestionsRequestIdRef.current += 1;
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      const requestId = ++suggestionsRequestIdRef.current;
      setSuggestionsLoading(true);

      void fetchWordSuggestions(cleanQuery)
        .then((result) => {
          if (requestId !== suggestionsRequestIdRef.current) {
            return;
          }

          setSuggestions(result);
        })
        .finally(() => {
          if (requestId === suggestionsRequestIdRef.current) {
            setSuggestionsLoading(false);
          }
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const cleanQuery = query.trim().toLowerCase();
  const hasMatchingResult = Boolean(
    data?.word && data.word.trim().toLowerCase() === cleanQuery,
  );

  async function handleSearch(value: unknown = query) {
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
            suppressSuggestionsRef.current = false;
            setQuery(value);
            clearError();
          }}
          onSubmit={() => handleSearch()}
          onClear={() => {
            suppressSuggestionsRef.current = false;
            suggestionsRequestIdRef.current += 1;
            setQuery("");
            setSuggestions([]);
            clearError();
          }}
          suggestions={suggestions}
          onSelectSuggestion={(value) => {
            suppressSuggestionsRef.current = true;
            suggestionsRequestIdRef.current += 1;
            setSuggestions([]);
            setQuery(value);
            void handleSearch(value);
          }}
          loading={loading}
          suggestionsLoading={suggestionsLoading}
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
            title="Search for a word"
            description="Press Search to look up the word and view meanings, examples, phonetics, and pronunciation audio."
          />
        ) : (
          <EmptyState />
        )}
      </View>
    </ScrollView>
  );
}
