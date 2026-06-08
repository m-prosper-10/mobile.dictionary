import {
  DrawerContent,
  DrawerProvider,
  useDrawer,
} from "@/components/drawer-content";
import { DictionaryProvider } from "@/components/dictionary-provider";
import { DrawerLayout } from "@/components/drawer-layout";
import "@/global.css";
import { useSystemBackgroundColor } from "@/utils/use-system-background-color";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { DefaultTheme, ThemeProvider as RNTheme } from "expo-router/react-navigation";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind, useCSSVariable } from "uniwind";

function ThemeProvider(props: { children: React.ReactNode }) {
  return (
    <RNTheme value={DefaultTheme}>
      <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
        {props.children}
      </SafeAreaListener>
    </RNTheme>
  );
}

export const unstable_settings = {
  anchor: "index",
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <KeyboardProvider>
        <DictionaryProvider>
          <DrawerProvider>
            <RootDrawer />
          </DrawerProvider>
        </DictionaryProvider>
        {process.env.EXPO_OS !== "ios" && <StatusBar style="dark" />}
      </KeyboardProvider>
    </ThemeProvider>
  );
}

function RootDrawer() {
  const { isOpen, openDrawer, closeDrawer } = useDrawer();

  useSystemBackgroundColor();

  return (
    <DrawerLayout
      open={isOpen}
      onOpen={openDrawer}
      onClose={closeDrawer}
      drawerContent={<DrawerContent />}
    >
      <StackLayout />
    </DrawerLayout>
  );
}

function StackLayout() {
  const appForeground = useCSSVariable("--app-foreground") as string;
  const appBackground = useCSSVariable("--app-background") as string;

  return (
    <Stack
      screenOptions={{
        headerTintColor: appForeground,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: appBackground,
        },
      }}
    >
      <Stack.Screen
        name="index"
        dangerouslySingular
        options={{
          title: "Dictionary",
          animation: "none",
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
