import { useEffect } from "react";
import { Stack, Tabs, SplashScreen } from "expo-router";
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

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // if (!loaded || !error) return null;

  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Protected guard={false}>
          <Stack.Screen name={"(tabs)"} options={{ title: "Home" }} />
        </Stack.Protected>
        <Stack.Protected guard={true}>
          <Stack.Screen
            name={"intro"}
            options={{ title: "Choose wisely", headerShown: false }}
          />
          <Stack.Screen name={"signin"} options={{ title: "Log in joor" }} />
        </Stack.Protected>
      </Stack>
    </SafeAreaProvider>
  );
}
