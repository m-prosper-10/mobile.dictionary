import { Icon } from "@/components/icon";
import { useDictionary } from "@/components/dictionary-provider";
import { SafeAreaView } from "@/components/tw";
import type { Href } from "expo-router";
import { BookOpenText } from "lucide-react-native";

import React, { createContext, use, useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type DrawerContextValue = {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  return (
    <DrawerContext value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext>
  );
}

export function useDrawer() {
  const context = use(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
}

function DrawerHistoryItem({
  word,
  onPress,
}: {
  word: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mx-2 rounded-xl border border-border bg-card px-4 py-3 active:bg-muted"
    >
      <Text numberOfLines={1} className="text-[15px] text-foreground">
        {word}
      </Text>
    </Pressable>
  );
}

function EmptyHistory() {
  return (
    <View className="items-center gap-3 px-6 py-10">
      <View className="h-12 w-12 items-center justify-center rounded-2xl border border-border bg-secondary">
        <Icon icon={BookOpenText} className="w-6 h-6 text-foreground" />
      </View>
      <View className="items-center gap-1">
        <Text className="text-[15px] font-semibold text-foreground">
          No history yet
        </Text>
        <Text className="text-center text-[13px] leading-snug text-muted-foreground">
          Successful searches will appear here for quick access.
        </Text>
      </View>
    </View>
  );
}

export function DrawerContent() {
  const { history, searchWord } = useDictionary();
  const { closeDrawer } = useDrawer();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom", "left"]}>
      <View className="px-4 pt-4 pb-3">
        <Text className="text-[28px] font-bold text-foreground">
          Dictionary
        </Text>
        <Text className="text-[13px] text-muted-foreground">
          Search history
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2 pb-6"
      >
        {history.length > 0 ? (
          history.map((word) => (
            <DrawerHistoryItem
              key={word}
              word={word}
              onPress={() => {
                closeDrawer();
                void searchWord(word);
              }}
            />
          ))
        ) : (
          <EmptyHistory />
        )}
      </ScrollView>

      <View className="border-t border-border px-4 py-3">
        <Text className="text-[12px] text-muted-foreground">
          Tap a word to fetch it again.
        </Text>
      </View>
    </SafeAreaView>
  );
}
