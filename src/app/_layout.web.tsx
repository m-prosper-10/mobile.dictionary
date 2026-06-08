import { Sidebar, SidebarToggle } from "@/components/sidebar";
import { DictionaryProvider } from "@/components/dictionary-provider";
import { useDictionary } from "@/components/dictionary-provider";
import "@/global.css";
import { Slot } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { useState } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";

export default function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <DictionaryProvider>
      {isMobile ? (
        <MobileLayout
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        >
          <Slot />
        </MobileLayout>
      ) : (
        <View className="flex h-dvh w-full flex-row bg-sidebar">
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen((v) => !v)}
            isCollapsed={sidebarCollapsed}
            onCollapse={() => setSidebarCollapsed((v) => !v)}
          />

          <View className="flex flex-1 min-w-0 flex-col">
            <View className="flex h-14 shrink-0 flex-row items-center gap-3 bg-sidebar px-3">
              <View className="md:hidden">
                <SidebarToggle onPress={() => setSidebarOpen(true)} />
              </View>
              <Text className="text-[17px] font-semibold text-foreground">
                Dictionary
              </Text>
            </View>

            <View className="flex flex-1 min-h-0 flex-col overflow-hidden bg-background md:rounded-tl-xl md:border-t md:border-l md:border-border/40">
              <Slot />
            </View>
          </View>
        </View>
      )}
    </DictionaryProvider>
  );
}

function MobileLayout({
  sidebarOpen,
  setSidebarOpen,
  children,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
}) {
  const { history, searchWord, clearHistory } = useDictionary();

  return (
    <View className="relative flex h-dvh w-full flex-col bg-background">
      <View className="flex h-14 shrink-0 flex-row items-center gap-3 border-b border-border bg-sidebar px-3">
        <SidebarToggle onPress={() => setSidebarOpen(true)} />
        <Text className="text-[17px] font-semibold text-foreground">
          Dictionary
        </Text>
      </View>

      <View className="flex-1 min-h-0 flex-col overflow-hidden bg-background">
        {children}
      </View>

      <Pressable
        onPress={() => setSidebarOpen(false)}
        className={`absolute inset-0 z-40 bg-foreground/12 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <View
        className="absolute left-0 top-0 z-50 h-dvh border-r border-border bg-sidebar transition-transform duration-300"
        style={{
          width: 280,
          transform: [{ translateX: sidebarOpen ? 0 : -288 }],
          overflow: "hidden",
        }}
      >
        <View className="flex-row items-center gap-3 border-b border-border px-4 pt-5 pb-3">
          <View className="flex-1">
            <Text className="text-[24px] font-bold text-foreground">
              Dictionary
            </Text>
            <Text className="text-[13px] text-muted-foreground">
              Search history
            </Text>
          </View>
          {history.length > 0 ? (
            <Pressable
              onPress={clearHistory}
              accessibilityRole="button"
              accessibilityLabel="Clear history"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card active:bg-muted"
            >
              <Trash2 size={16} strokeWidth={1.8} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => setSidebarOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card active:bg-muted"
          >
            <Text className="text-[14px] font-semibold text-foreground">
              ✕
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="gap-2 pb-6">
          {history.length > 0 ? (
            history.map((word) => (
              <Pressable
                key={word}
                onPress={async () => {
                  setSidebarOpen(false);
                  await searchWord(word);
                }}
                className="mx-2 rounded-xl border border-border bg-card px-4 py-3 active:bg-muted"
              >
                <Text numberOfLines={1} className="text-[15px] text-foreground">
                  {word}
                </Text>
              </Pressable>
            ))
          ) : (
            <View className="items-center gap-3 px-6 py-12">
              <View className="h-12 w-12 items-center justify-center rounded-2xl border border-border bg-secondary">
                <Text className="text-[18px]">Aa</Text>
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
          )}
        </ScrollView>

        <View className="border-t border-border px-4 py-3">
          <Text className="text-[12px] text-muted-foreground">
            Tap a word to fetch it again.
          </Text>
        </View>
      </View>
    </View>
  );
}
