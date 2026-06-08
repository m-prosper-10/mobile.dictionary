import { Search, X } from "lucide-react-native";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Icon } from "@/components/icon";

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  suggestions: string[];
  onSelectSuggestion: (value: string) => void;
  loading?: boolean;
  suggestionsLoading?: boolean;
};

export function SearchInput({
  value,
  onChangeText,
  onSubmit,
  onClear,
  suggestions,
  onSelectSuggestion,
  loading = false,
  suggestionsLoading = false,
}: SearchInputProps) {
  const hasSuggestions = suggestions.length > 0;

  return (
    <View className="gap-3">
      <View className="gap-3 rounded-2xl border border-border bg-card px-4 py-4 shadow-card">
        <View className="flex-row items-center gap-3 rounded-xl border border-border bg-background px-3 py-3">
          <Icon icon={Search} className="w-5 h-5 text-muted-foreground" />
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            placeholder="Search a word"
            placeholderTextColorClassName="accent-sf-gray-2"
            selectionColorClassName="accent-foreground"
            className="flex-1 text-[16px] text-foreground"
            returnKeyType="search"
            autoFocus={false}
          />
          {value ? (
            <Pressable
              onPress={onClear}
              className="h-8 w-8 items-center justify-center rounded-full active:bg-muted"
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <Icon icon={X} className="w-4 h-4 text-muted-foreground" />
            </Pressable>
          ) : null}
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-right text-[12px] text-muted-foreground">
            {loading
              ? "Searching..."
              : suggestionsLoading
                ? "Finding suggestions..."
                : "Press Search to look up the word"}
          </Text>
        </View>
      </View>

      {hasSuggestions ? (
        <View className="gap-2 rounded-2xl border border-border bg-card p-3 shadow-card">
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
              Suggestions
            </Text>
            <Text className="text-[12px] text-muted-foreground">
              {suggestions.length} option{suggestions.length === 1 ? "" : "s"}
            </Text>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 pb-1"
          >
            {suggestions.map((suggestion) => (
              <Pressable
                key={suggestion}
                onPress={() => onSelectSuggestion(suggestion)}
                className="rounded-full border border-border bg-background px-3 py-2 active:bg-muted"
              >
                <Text className="text-[14px] text-foreground">{suggestion}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <Pressable
        onPress={onSubmit}
        disabled={loading}
        className="h-12 items-center justify-center rounded-2xl bg-foreground px-4 active:opacity-80 disabled:opacity-50"
      >
        <Text className="text-[15px] font-semibold text-background">
          {loading ? "Searching" : "Search"}
        </Text>
      </Pressable>
    </View>
  );
}
