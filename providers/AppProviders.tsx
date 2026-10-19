import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/repositories/useAuthStore";
import { useEffect } from "react";
import { AppState } from "react-native";
import { connectRealtime } from "@/lib/realtimeSocket";
import { notificationsQueryKey } from "@/lib/notifications/cache";
import {
  receiveNotification,
  refetchNotifications,
} from "@/viewmodel/useNotifications";
import {
  receiveAppointmentClosed,
  receiveAppointmentMatched,
  refetchAppointments,
} from "@/viewmodel/useAppointments";
import {
  callRealtimeHandlers,
  onCallSocketClosed,
  onCallSocketReconnected,
  resetCall,
} from "@/viewmodel/useCall";

const realtimeHandlers = {
  "notification.new": receiveNotification,
  "appointment.matched": receiveAppointmentMatched,
  "appointment.match_failed": receiveAppointmentClosed,
  "appointment.expired": receiveAppointmentClosed,
  ...callRealtimeHandlers,
};

function refetchRealtimeState() {
  refetchNotifications();
  refetchAppointments();
}

function onSocketConnected() {
  refetchRealtimeState();
  onCallSocketReconnected();
}

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const rehydrate = useAuthStore((s) => s.rehydrate);

  useEffect(() => {
    rehydrate();
  }, []);

  return <>{children}</>;
}

function RealtimeBootstrap() {
  const status = useAuthStore((s) => s.status);
  const hasToken = useAuthStore((s) => !!s.token);

  useEffect(() => {
    if (status === "unauthenticated") {
      queryClient.removeQueries({ queryKey: notificationsQueryKey });
      queryClient.removeQueries({ queryKey: ["/appointments/"] });
    }
    if (status !== "authenticated" || !hasToken) return;

    const disconnect = connectRealtime(() => useAuthStore.getState().token, realtimeHandlers, {
      onConnect: onSocketConnected,
      onClose: onCallSocketClosed,
    });
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refetchRealtimeState();
    });
    return () => {
      disconnect();
      subscription.remove();
      resetCall();
    };
  }, [status, hasToken]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeBootstrap />
      <AuthBootstrap>{children}</AuthBootstrap>
    </QueryClientProvider>
  );
}
