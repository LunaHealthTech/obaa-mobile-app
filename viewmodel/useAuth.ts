import { useRouter } from "expo-router";
import { useAuthStore } from "@/repositories/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { signIn, signUp } from "@/services/authService";
import { toast } from "sonner-native";
import { AxiosError } from "axios";

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
      const userHasMenstrualProfile = !!data?.user.menstrual_profile_created;
      if (userHasMenstrualProfile) {
        router.navigate("/(tabs)");
      } else {
        router.navigate("/onboarding/persona");
      }
    },
    onError: (err: AxiosError<{ detail?: string }>) => {
      // TODO: log this error with a logger
      console.log({ err: err.message, data: err.response?.data });
      toast.error(
        err.response?.data?.detail ??
          "Something went wrong, please try again",
      );
    },
  });

  const registerMutation = useMutation({
    mutationFn: signUp,
    onSuccess: async (data) => {
      toast.dismiss();
      console.log({ dataFromSignUp: data });
      toast.success("Your account was created successfully");
      router.navigate("/signin");
    },
    onError: async (err: AxiosError<Record<string, string[]>>) => {
      toast.dismiss();
      if (!err.response) {
        toast.error("Something went wrong, please try again");
        console.log({ err: err.message });
        return;
      }
      const errorData = err.response.data;
      const errors: Record<string, string> = {};
      for (const e in errorData) {
        errors[e] = errorData[e][0];
      }
      console.log({ status: err.response.status, errorData, errors });
      for (const errr in errors) {
        toast.error(errors[errr]);
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
