import { useEffect } from "react";
import { Stack, SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

import "@/global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProviders } from "@/providers/AppProviders";
import { Toaster } from "sonner-native";
import { useAuthStore } from "@/repositories/useAuthStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
export const unstable_settings = {
  initialRouteName: "intro",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const isAuthenticated = useAuthStore((s) => s.status);
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // if (!loaded || !error) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProviders>
          <Stack>
            <Stack.Protected guard={isAuthenticated === "authenticated"}>
              <Stack.Screen
                name={"(tabs)"}
                options={{ title: "Home", headerShown: false }}
              />
              <Stack.Screen
                name={"onboarding"}
                options={{ title: "onboarding", headerShown: false }}
              />
              <Stack.Screen
                name={"period-checkin"}
                options={{
                  title: "period-checkin",
                  headerShown: false,
                  presentation: "formSheet",
                  sheetAllowedDetents: "fitToContents",
                  sheetCornerRadius: 24,
                  sheetGrabberVisible: true,
                }}
              />
            </Stack.Protected>
            <Stack.Protected guard={!(isAuthenticated === "authenticated")}>
              <Stack.Screen
                name={"intro"}
                options={{ title: "Welcome", headerShown: false }}
              />
              <Stack.Screen
                name={"signin"}
                options={{ title: "Log in joor" }}
              />
              <Stack.Screen
                name={"signup"}
                options={{ title: "Sign up joor" }}
              />
            </Stack.Protected>
          </Stack>
          <Toaster position={"top-center"} />
        </AppProviders>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
