import { Redirect, useRootNavigationState } from "expo-router";
import { useAuthStore } from "@/repositories/useAuthStore";
import { homeRouteFor, useCurrentUser } from "@/viewmodel/useAuth";

export default function Index() {
  const rootNavigationState = useRootNavigationState();
  const status = useAuthStore((s) => s.status);
  const user = useCurrentUser();

  if (!rootNavigationState?.key) return null;

  if (status === "authenticated") {
    return <Redirect href={homeRouteFor(user)} />;
  }
  if (status === "unauthenticated") {
    return <Redirect href="/intro" />;
  }
  return null;
}
