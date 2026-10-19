export interface User {
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

export interface AuthState {
  user: User | null;
  token: string | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (user: User, access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  rehydrate: () => Promise<void>;
  signUpItems?: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    email: string;
  };
  setSignUpItem: (info: { [key: string]: string }) => void;
}
