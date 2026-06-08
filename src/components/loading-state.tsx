import { ActivityIndicator, Text, View } from "react-native";

export function LoadingState({ label = "Fetching word details..." }: { label?: string }) {
  return (
    <View className="items-center justify-center gap-3 py-16">
      <ActivityIndicator colorClassName="accent-foreground" />
      <Text className="text-[14px] text-muted-foreground">{label}</Text>
    </View>
  );
}
