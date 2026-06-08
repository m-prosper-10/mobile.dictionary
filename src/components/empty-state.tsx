import { BookOpenText } from "lucide-react-native";
import { Text, View } from "react-native";

import { Icon } from "@/components/icon";

export function EmptyState({
  title = "Search for a word",
  description = "View meanings, examples, phonetics, and pronunciation audio.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <View className="items-center justify-center gap-3 py-16">
      <View className="h-12 w-12 items-center justify-center rounded-2xl border border-border bg-secondary">
        <Icon icon={BookOpenText} className="w-6 h-6 text-foreground" />
      </View>
      <View className="items-center gap-1">
        <Text className="text-[17px] font-semibold text-foreground">
          {title}
        </Text>
        <Text className="px-8 text-center text-[14px] leading-snug text-muted-foreground">
          {description}
        </Text>
      </View>
    </View>
  );
}
