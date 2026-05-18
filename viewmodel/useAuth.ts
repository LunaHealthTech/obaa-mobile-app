import { useRouter } from "expo-router";
import { useAuthStore } from "@/repositories/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { signIn, signUp } from "@/services/authService";
import { toast } from "sonner-native";

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
      toast.dismiss();
      console.log({ dataFromSignUp: data });
      toast.success("Your account was created successfully");
      router.navigate("/signin");
    },
    onError: async (err) => {
      toast.dismiss();
      const errorData = err.response.data;
      const errors = {};
      for (const e in errorData) {
        errors[e] = errorData[e][0];
      }
      console.log({ status: err.response.status, errorData, errors });
      if (err?.response.status !== 200) {
        for (const errr in errors) {
          toast.error(errors[errr]);
        }
      }
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
