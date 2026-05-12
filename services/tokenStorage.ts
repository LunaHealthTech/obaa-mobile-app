import * as SecureStore from "expo-secure-store";

export const TokenStorage = {
  saveTokens: async (access: string, refresh: string) => {
    await SecureStore.setItemAsync("ACCESS_TOKEN", access);
    await SecureStore.setItemAsync("REFRESH_TOKEN", refresh);
  },
  saveInfo: async (userInfo) => {},
  getAccessToken: () => SecureStore.getItemAsync("ACCESS_TOKEN"),
  getRefreshToken: () => SecureStore.getItemAsync("REFRESH_TOKEN"),
  clearTokens: async () => {
    await SecureStore.deleteItemAsync("ACCESS_TOKEN");
    await SecureStore.deleteItemAsync("REFRESH_TOKEN");
  },
};
