import { create } from "zustand";
import { TokenStorage } from "@/services/tokenStorage";
import { AuthState } from "@/types/auth.types";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  signUpItems: {
    first_name: "",
    last_name: "",
    date_of_birth: "",
    email: "",
  },
  status: "loading",

  login: async (user, access, refresh) => {
    await TokenStorage.saveTokens(access, refresh);
    set({ user, token: access, status: "authenticated" });
  },
  setToken: (token) => set({ token }),
  logout: async () => {
    await TokenStorage.clearTokens();
    set({ user: null, token: null, status: "unauthenticated" });
  },
  setSignUpItem: (info: { [keys: string]: string }) =>
    set({ signUpItems: { ...info } as AuthState["signUpItems"] }),

  rehydrate: async () => {
    try {
      const token = await TokenStorage.getAccessToken();
      if (token) {
        // Optionally fetch user profile here with the token
        set({ token, status: "authenticated" });
      } else {
        set({ status: "unauthenticated" });
      }
    } catch {
      set({ status: "unauthenticated" });
    }
  },
}));
