import { Stack } from "expo-router";

export default function ConsultLayout() {
  return (
    <Stack>
      <Stack.Screen name={"index"} options={{ headerShown: false }} />
      <Stack.Screen
        name={"booking-method"}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={"match-preferences"}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={"finding-midwife"}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={"midwife-match"}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={"checkout"}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={"booking-confirmation"}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={"appointment"}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={"choose-midwife"}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={"midwife-profile"}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={"book-midwife"}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={"consultations"}
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
