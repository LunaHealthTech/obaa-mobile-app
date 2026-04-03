import { apiClient } from "@/lib/apiClient";

interface SignInPayload {
  email: string;
  password: string;
}

export async function signIn(payload: SignInPayload) {
  const res = await apiClient.post("/auth/login/", payload);
  // const { tokens } = res.data;
  // console.log({ data: tokens });
  console.log(res.data);
  return res.data;
}
