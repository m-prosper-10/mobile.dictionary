import { Icon } from "@/components/icon";
import { Stack } from "expo-router";
import { Menu } from "lucide-react-native";
import { Pressable } from "react-native";
import { useDrawer } from "./drawer-content";

/**
 * Header for the Home screen: a drawer toggle on the left and a primary
 * action on the right. The screen title comes from the Stack screen options
 * in app/_layout.tsx.
 */
export function MainHeader() {
  const { openDrawer } = useDrawer();

  return (
    <>
      {process.env.EXPO_OS === "ios" ? (
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button icon="line.horizontal.3" onPress={openDrawer} />
        </Stack.Toolbar>
      ) : (
        // TODO: Migrate to unified Toolbar support for Android in SDK 56
        <Stack.Toolbar placement="left" asChild>
          <Pressable
            onPress={openDrawer}
            accessibilityLabel="Open drawer"
            accessibilityRole="button"
            className="p-2 -ml-1 active:opacity-60"
          >
            <Icon icon={Menu} className="w-6 h-6 text-foreground" />
          </Pressable>
        </Stack.Toolbar>
      )}
    </>
  );
}
