import { create } from "zustand";
import { TokenStorage } from "@/services/tokenStorage";
import { AuthState } from "@/types/auth.types";

export const useAuthStore = create<AuthState>((set, get) => ({
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
    await TokenStorage.saveUser(user);
    set({ user, token: access, status: "authenticated" });
  },
  setToken: (token) => set({ token }),
  markEmailVerified: async () => {
    const current = get().user;
    if (!current) return;
    const user = { ...current, email_verified: true };
    await TokenStorage.saveUser(user);
    set({ user });
  },
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
        const user = await TokenStorage.getUser();
        set({ user, token, status: "authenticated" });
      } else {
        set({ status: "unauthenticated" });
      }
    } catch {
      set({ status: "unauthenticated" });
    }
  },
}));
