import { apiClient } from "@/lib/apiClient";
import { format } from "date-fns";

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
  console.log(res.data); // TODO: remove these
  return res.data;
}

export async function signUp(payload: SignUpPayload) {
  const updatedPayload = {
    ...payload,
    date_of_birth: format(payload.date_of_birth, "yyyy-MM-dd"),
  };
  console.log({ updatedPayload });
  const res = await apiClient.post("/auth/register/", updatedPayload);
  // console.log(res.data, { res }); // TODO: remove console log statements
  return res.data;
}
