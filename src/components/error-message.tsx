import { Text, View } from "react-native";

export function ErrorMessage({ message }: { message: string }) {
  return (
    <View className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <Text className="text-[15px] font-semibold text-red-800">
        Unable to load word
      </Text>
      <Text selectable className="mt-1 text-[14px] leading-snug text-red-700">
        {message}
      </Text>
    </View>
  );
}
