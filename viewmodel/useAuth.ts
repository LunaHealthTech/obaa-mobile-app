import { useRouter } from "expo-router";
import { useAuthStore } from "@/repositories/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import {
  signIn,
  signUp,
  verifyEmail,
  resendVerificationCode,
  requestPasswordReset,
  confirmPasswordReset,
} from "@/services/authService";
import { extractErrorMessage } from "@/lib/apiClient";
import { toast } from "sonner-native";
import { AxiosError } from "axios";

export function useAuth() {
  // Constants
  const router = useRouter();
  const signUpSteps = useAuthStore((state) => state.signUpItems);
  const setSignUpItem = useAuthStore((s) => s.setSignUpItem);
  const login = useAuthStore((s) => s.login);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  // Mutations
  const loginMutation = useMutation({
    mutationFn: signIn,
    onSuccess: async (data) => {
      console.log({ dataFromSignIn: data });
      await login(data.user, data.tokens.access, data.tokens.refresh);
      if (!data.user.email_verified) {
        router.navigate({
          pathname: "/verify-email",
          params: { email: data.user.email },
        });
        return;
      }
      const userHasMenstrualProfile = !!data?.user.menstrual_profile_created;
      if (userHasMenstrualProfile) {
        router.navigate("/(tabs)/home");
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
    onSuccess: async (data, variables) => {
      toast.dismiss();
      console.log({ dataFromSignUp: data });
      toast.success("Your account was created successfully");
      router.navigate({
        pathname: "/verify-email",
        params: { email: data?.email ?? variables.email },
      });
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

  const verifyEmailMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      toast.dismiss();
      toast.success("Email verified successfully");
      if (token) {
        const userHasMenstrualProfile = !!user?.menstrual_profile_created;
        router.navigate(
          userHasMenstrualProfile ? "/(tabs)/home" : "/onboarding/persona",
        );
      } else {
        router.navigate("/signin");
      }
    },
    onError: (
      err: AxiosError<{ code?: string; message?: string; detail?: string }>,
    ) => {
      toast.dismiss();
      toast.error(extractErrorMessage(err, "Invalid or expired code"));
    },
  });

  const resendCodeMutation = useMutation({
    mutationFn: resendVerificationCode,
    onSuccess: () => {
      toast.dismiss();
      toast.success("A new code has been sent");
    },
    onError: (
      err: AxiosError<{ detail?: string; retry_after?: number }>,
    ) => {
      toast.dismiss();
      toast.error(
        err.response?.data?.detail ??
          extractErrorMessage(err, "Could not resend code, please try again"),
      );
    },
  });

  const requestPasswordResetMutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (data: { message?: string }) => {
      toast.dismiss();
      toast.success(data?.message ?? "Reset link sent");
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.dismiss();
      toast.error(
        extractErrorMessage(err, "Something went wrong, please try again"),
      );
    },
  });

  const confirmPasswordResetMutation = useMutation({
    mutationFn: confirmPasswordReset,
    onSuccess: () => {
      toast.dismiss();
      toast.success("Password changed successfully");
      router.navigate("/signin");
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.dismiss();
      toast.error(extractErrorMessage(err, "Invalid or expired reset link"));
    },
  });

  return {
    signUpSteps,
    setSignUpItem,
    register: registerMutation.mutate,
    registerPending: registerMutation.isPending,
    signIn: loginMutation.mutate,
    signInPending: loginMutation.isPending,
    verifyEmail: verifyEmailMutation.mutate,
    verifyEmailPending: verifyEmailMutation.isPending,
    resendCode: resendCodeMutation.mutate,
    resendCodePending: resendCodeMutation.isPending,
    requestPasswordReset: requestPasswordResetMutation.mutate,
    requestPasswordResetPending: requestPasswordResetMutation.isPending,
    requestPasswordResetSuccess: requestPasswordResetMutation.isSuccess,
    confirmPasswordReset: confirmPasswordResetMutation.mutate,
    confirmPasswordResetPending: confirmPasswordResetMutation.isPending,
  };
}
