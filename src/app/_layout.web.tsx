import { Sidebar, SidebarToggle } from "@/components/sidebar";
import { DictionaryProvider } from "@/components/dictionary-provider";
import "@/global.css";
import { Slot } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

export default function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <DictionaryProvider>
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
    </DictionaryProvider>
  );
}
