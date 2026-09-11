import { Redirect } from "expo-router";
import { useAuthStore } from "@/repositories/useAuthStore";

export default function Index() {
  const status = useAuthStore((s) => s.status);

  if (status === "authenticated") {
    return <Redirect href="/(tabs)" />;
  }
  if (status === "unauthenticated") {
    return <Redirect href="/intro" />;
  }
  return null;
}
