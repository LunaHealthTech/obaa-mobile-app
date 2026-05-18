import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandMMKVStorage } from "@/store/mmkvStorage";

interface SettingsStorage {
  theme: "system" | "dark" | "light" | string;
  locale: string;
  notificationsEnabled: boolean;
  seenOnboarding: boolean;
  setTheme: (theme: string) => void;
  setLocale: (locale: string) => void;
  setSeenOnboarding: (seenOnboarding: boolean) => void;
  setNotificationsEnabled: (notificationsEnabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStorage>()(
  persist(
    (set) => ({
      theme: "system",
      locale: "en",
      notificationsEnabled: true,
      seenOnboarding: false,
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      setSeenOnboarding: (seenOnboarding) => set({ seenOnboarding }),
      setNotificationsEnabled: (notificationsEnabled) =>
        set({ notificationsEnabled }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
