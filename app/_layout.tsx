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
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CallNavigator } from "@/components/CallNavigator";
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
  const isMidwife = useAuthStore((s) => s.user?.role === "MIDWIFE");
  const signedIn = isAuthenticated === "authenticated";
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // if (!loaded || !error) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProviders>
          <ErrorBoundary>
            <Stack>
              <Stack.Protected guard={signedIn && !isMidwife}>
                <Stack.Screen
                  name={"(tabs)"}
                  options={{ title: "Home", headerShown: false }}
                />
                <Stack.Screen
                  name={"onboarding"}
                  options={{ title: "onboarding", headerShown: false }}
                />
              </Stack.Protected>
              <Stack.Protected guard={signedIn && isMidwife}>
                <Stack.Screen name={"midwife"} options={{ headerShown: false }} />
              </Stack.Protected>
              <Stack.Protected guard={signedIn}>
                <Stack.Screen
                  name={"notifications"}
                  options={{ title: "Notifications" }}
                />
                <Stack.Screen name={"bookmarks"} options={{ title: "Bookmarks" }} />
                <Stack.Screen
                  name={"call"}
                  options={{
                    headerShown: false,
                    presentation: "fullScreenModal",
                    gestureEnabled: false,
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
                <Stack.Screen
                  name={"forgot-password"}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name={"reset-password"}
                  options={{ title: "" }}
                />
              </Stack.Protected>
              <Stack.Screen name={"verify-email"} options={{ title: "" }} />
              <Stack.Screen name={"articles/index"} options={{ title: "Articles" }} />
              <Stack.Screen name={"articles/[slug]"} options={{ title: "" }} />
              <Stack.Screen name={"events"} options={{ title: "Events" }} />
              <Stack.Screen name={"privacy-policy"} options={{ title: "Privacy policy" }} />
            </Stack>
            {signedIn && <CallNavigator />}
          </ErrorBoundary>
          <Toaster position={"top-center"} />
        </AppProviders>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
