import { Text, View } from "react-native";

import { AudioControls } from "@/components/audio-controls";
import type { DictionaryEntry } from "@/utils/parseDictionaryResponse";

type WordHeaderProps = {
  wordData: DictionaryEntry;
};

export function WordHeader({ wordData }: WordHeaderProps) {
  return (
    <View className="gap-4">
      <View className="gap-1.5">
        <Text selectable className="text-[32px] font-bold text-foreground">
          {wordData.word}
        </Text>
        {wordData.phonetic ? (
          <Text selectable className="text-[15px] text-muted-foreground">
            {wordData.phonetic}
          </Text>
        ) : null}
      </View>

      <AudioControls audioUrls={wordData.audioUrls} />

      {wordData.origin ? (
        <View className="gap-1 rounded-xl border border-border bg-card px-4 py-3">
          <Text className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
            Origin
          </Text>
          <Text selectable className="text-[14px] leading-snug text-foreground">
            {wordData.origin}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
