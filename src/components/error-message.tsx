import { Pressable, Text, View } from "react-native";

export function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <Text className="text-[15px] font-semibold text-red-800">
        Unable to load word
      </Text>
      <Text selectable className="mt-1 text-[14px] leading-snug text-red-700">
        {message}
      </Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          className="mt-3 self-start rounded-lg border border-red-200 bg-white px-3 py-2 active:bg-red-100"
        >
          <Text className="text-[13px] font-semibold text-red-800">
            Retry
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
