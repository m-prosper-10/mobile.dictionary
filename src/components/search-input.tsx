import { Search } from "lucide-react-native";
import { Pressable, Text, TextInput, View } from "react-native";

import { Icon } from "@/components/icon";

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
};

export function SearchInput({
  value,
  onChangeText,
  onSubmit,
  loading = false,
}: SearchInputProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <Icon icon={Search} className="w-5 h-5 text-muted-foreground" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Search a word"
          placeholderTextColorClassName="accent-muted-foreground"
          selectionColorClassName="accent-foreground"
          cursorColorClassName="accent-foreground"
          className="flex-1 text-[17px] text-foreground"
          returnKeyType="search"
        />
      </View>

      <Pressable
        onPress={onSubmit}
        disabled={loading}
        className="h-12 items-center justify-center rounded-xl bg-foreground px-4 active:opacity-80 disabled:opacity-50"
      >
        <Text className="text-[15px] font-semibold text-background">
          {loading ? "Searching" : "Search"}
        </Text>
      </Pressable>
    </View>
  );
}
