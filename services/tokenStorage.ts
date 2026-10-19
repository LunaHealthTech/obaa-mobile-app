import * as SecureStore from "expo-secure-store";
import type { User } from "@/types/auth.types";

export const TokenStorage = {
  saveTokens: async (access: string, refresh: string) => {
    await SecureStore.setItemAsync("ACCESS_TOKEN", access);
    await SecureStore.setItemAsync("REFRESH_TOKEN", refresh);
  },
  saveUser: (user: User) => SecureStore.setItemAsync("USER", JSON.stringify(user)),
  getUser: async (): Promise<User | null> => {
    const raw = await SecureStore.getItemAsync("USER");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  getAccessToken: () => SecureStore.getItemAsync("ACCESS_TOKEN"),
  getRefreshToken: () => SecureStore.getItemAsync("REFRESH_TOKEN"),
  clearTokens: async () => {
    await SecureStore.deleteItemAsync("ACCESS_TOKEN");
    await SecureStore.deleteItemAsync("REFRESH_TOKEN");
    await SecureStore.deleteItemAsync("USER");
  },
};
