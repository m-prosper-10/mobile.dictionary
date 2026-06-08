import { useDictionary } from "@/components/dictionary-provider";
import { Icon } from "@/components/icon";
import { BookOpenText, Menu, PanelLeft, PanelLeftOpen } from "lucide-react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";

export function Sidebar(_props: {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapse: () => void;
}) {
  const { history, searchWord } = useDictionary();

  return (
    <View className="relative">
      <SidebarShell history={history} searchWord={searchWord} {..._props} />
    </View>
  );
}

function SidebarShell({
  isOpen,
  onToggle,
  isCollapsed,
  onCollapse,
  history,
  searchWord,
}: {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapse: () => void;
  history: string[];
  searchWord: (word: string) => Promise<unknown>;
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const showCollapsedRail = isCollapsed && !isMobile;

  return (
    <>
      <Pressable
        onPress={onToggle}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-40 bg-foreground/12 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{
          transition: "opacity 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      />

      <View
        className={`fixed left-0 top-0 z-50 flex h-dvh flex-col border-r border-border/40 bg-sidebar md:relative md:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{
          width: showCollapsedRail ? 56 : 280,
          overflow: "hidden",
          transition:
            "width 0.25s cubic-bezier(0.32, 0.72, 0, 1), transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {!showCollapsedRail ? (
          <>
            <View className="flex-row items-center gap-3 px-4 pt-5 pb-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
                <Icon icon={BookOpenText} className="w-5 h-5 text-foreground" />
              </View>
              <View className="flex-1">
                <Text className="text-[24px] font-bold text-foreground">
                  Dictionary
                </Text>
                <Text className="text-[13px] text-muted-foreground">
                  Search history
                </Text>
              </View>
            <Pressable
              onPress={onCollapse}
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-border bg-card md:flex active:bg-muted"
            >
              <PanelLeft size={18} strokeWidth={1.5} />
            </Pressable>
            <Pressable
              onPress={onToggle}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card md:hidden active:bg-muted"
              >
                <Text className="text-[14px] font-semibold text-foreground">✕</Text>
              </Pressable>
            </View>

            <ScrollView className="flex-1" contentContainerClassName="gap-2 pb-4">
              {history.length > 0 ? (
                history.map((word) => (
                  <Pressable
                    key={word}
                    onPress={async () => {
                      if (isOpen) {
                        onToggle();
                      }
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
              )}
            </ScrollView>
          </>
        ) : (
          <View className="flex-1 items-center gap-3 px-2 pt-3">
            <Pressable
              onPress={onCollapse}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card active:bg-muted"
            >
              <Icon icon={PanelLeftOpen} className="w-5 h-5 text-foreground" />
            </Pressable>
            <Pressable
              onPress={onToggle}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card active:bg-muted md:hidden"
            >
              <Icon icon={Menu} className="w-5 h-5 text-foreground" />
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}

export function SidebarToggle({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card active:bg-muted"
    >
      <Icon icon={Menu} className="w-5 h-5 text-foreground" />
    </Pressable>
  );
}
