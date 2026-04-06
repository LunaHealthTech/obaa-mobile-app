import { apiClient } from "@/lib/apiClient";

interface SignInPayload {
  email: string;
  password: string;
}

interface SignUpPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  date_of_birth: Date | string;
}

export async function signIn(payload: SignInPayload) {
  const res = await apiClient.post("/auth/login/", payload);
  console.log(res.data);
  return res.data;
}

export async function signUp(payload: SignUpPayload) {
  console.log({ payload });
  const res = await apiClient.post("/auth/register/", payload);
  console.log(res.data);
  return res.data;
}
