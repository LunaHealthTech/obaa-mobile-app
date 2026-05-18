import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name={"persona"} options={{ headerShown: false }} />
      <Stack.Screen
        name={"menstrual-profile-setup"}
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
