import { Redirect, useRootNavigationState } from "expo-router";
import { useAuthStore } from "@/repositories/useAuthStore";

export default function Index() {
  const rootNavigationState = useRootNavigationState();
  const status = useAuthStore((s) => s.status);

  if (!rootNavigationState?.key) return null;

  if (status === "authenticated") {
    return <Redirect href="/(tabs)/home" />;
  }
  if (status === "unauthenticated") {
    return <Redirect href="/intro" />;
  }
  return null;
}
