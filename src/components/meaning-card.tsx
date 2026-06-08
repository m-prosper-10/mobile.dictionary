import type { DictionaryMeaning } from "@/utils/parseDictionaryResponse";
import { Text, View } from "react-native";

type MeaningCardProps = {
  meaning: DictionaryMeaning;
};

export function MeaningCard({ meaning }: MeaningCardProps) {
  return (
    <View className="gap-3 rounded-xl border border-border bg-card px-4 py-4">
      <Text className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
        {meaning.partOfSpeech || "Meaning"}
      </Text>

      <View className="gap-3">
        {meaning.definitions.map((definition, index) => (
          <View key={`${definition.definition}-${index}`} className="gap-1.5">
            <Text selectable className="text-[15px] leading-snug text-foreground">
              {index + 1}. {definition.definition}
            </Text>
            {definition.example ? (
              <Text selectable className="text-[13px] leading-snug text-muted-foreground">
                “{definition.example}”
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      {(meaning.synonyms.length > 0 || meaning.antonyms.length > 0) && (
        <View className="gap-2 border-t border-border pt-3">
          {meaning.synonyms.length > 0 && (
            <Text className="text-[13px] leading-snug text-muted-foreground">
              Synonyms: {meaning.synonyms.join(", ")}
            </Text>
          )}
          {meaning.antonyms.length > 0 && (
            <Text className="text-[13px] leading-snug text-muted-foreground">
              Antonyms: {meaning.antonyms.join(", ")}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
