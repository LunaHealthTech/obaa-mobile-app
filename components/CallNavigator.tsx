import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useCallPhase } from "@/viewmodel/useCall";

// A ring can arrive on any screen, so the call screen opens from here rather
// than from the screen that started the call.
export function CallNavigator() {
  const router = useRouter();
  const phase = useCallPhase();
  const previous = useRef(phase);

  useEffect(() => {
    if (previous.current === "idle" && phase !== "idle") router.push("/call");
    previous.current = phase;
  }, [phase, router]);

  return null;
}
