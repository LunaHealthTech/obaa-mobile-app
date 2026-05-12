import { useRouter } from "expo-router";
import { useAuthStore } from "@/repositories/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { signIn, signUp } from "@/services/authService";

export function useAuth() {
  // Constants
  const router = useRouter();
  const signUpSteps = useAuthStore((state) => state.signUpItems);
  const setSignUpItem = useAuthStore((s) => s.setSignUpItem);
  const login = useAuthStore((s) => s.login);

  // Mutations
  const loginMutation = useMutation({
    mutationFn: signIn,
    onSuccess: async (data) => {
      console.log({ dataFromSignIn: data });
      await login(data.user, data.tokens.access, data.tokens.refresh);
      router.navigate("/(tabs)");
    },
    onError: (err) => {
      // TODO: log this error with a logger
      console.log({ err: err.message, setni: err.response.data });
    },
  });

  // const register = useAuthStore()
  const registerMutation = useMutation({
    mutationFn: signUp,
    onSuccess: async (data) => {
      console.log({ dataFromSignUp: data });
      router.navigate("/signin");
    },
    onError: async (err) => {
      console.log({ status: err.response.status });
      const errorData = err.response.data;
      const errors = {};
      for (const e in errorData) {
        errors[e] = errorData[e][0];
      }
      return errors;
    },
  });

  return {
    signUpSteps,
    setSignUpItem,
    register: registerMutation.mutate,
    registerPending: registerMutation.isPending,
    signIn: loginMutation.mutate,
    signInPending: loginMutation.isPending,
  };
}
