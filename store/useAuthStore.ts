import { create } from "zustand";
import { TokenStorage } from "@/lib/tokenStorage";

interface User {
  username: string;
  display_name: string;
  first_name: string;
  last_name: string;
  role: "PATIENT" | "MIDWIFE"; // TODO: find the rest
  profile_pic: null | string;
  email: string;
  email_verified: boolean;
  phone_number: string;
  phone_verified: boolean;
  menstrual_profile_created: boolean;
  status: "UNASSIGNED";
  uuid: string;
  last_login: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (user: User, access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  rehydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  status: "unauthenticated",

  login: async (user, access, refresh) => {
    await TokenStorage.saveTokens(access, refresh);
    set({ user, token: access, status: "authenticated" });
  },
  setToken: (token) => set({ token }),
  logout: async () => {
    await TokenStorage.clearTokens();
    set({ user: null, token: null, status: "unauthenticated" });
  },
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
