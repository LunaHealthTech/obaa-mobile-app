import { Stack } from "expo-router";

export default function PeriodCheckInLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="quick-check-in" />
      <Stack.Screen name="not-yet" />
      <Stack.Screen name="date" />
      <Stack.Screen name="flow-intensity" />
      <Stack.Screen name="symptoms" />
      <Stack.Screen name="confirmation" />
    </Stack>
  );
}
