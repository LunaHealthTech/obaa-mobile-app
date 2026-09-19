import { useEffect, useRef, useState } from "react";
import { View, Image, TextInput, Pressable, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AxiosError } from "axios";
import { appLogo } from "@/constants/assets";
import { useAuth } from "@/viewmodel/useAuth";
import { useAuthStore } from "@/repositories/useAuthStore";
import { Body, ButtonText, PageTitle } from "@/components/Typography";

const CODE_LENGTH = 4;
const RESEND_COOLDOWN_SECONDS = 60;

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const signUpEmail = useAuthStore((s) => s.signUpItems?.email);
  const userEmail = useAuthStore((s) => s.user?.email);
  const email = params.email ?? signUpEmail ?? userEmail ?? "";

  const { verifyEmail, verifyEmailPending, resendCode, resendCodePending } =
    useAuth();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(RESEND_COOLDOWN_SECONDS);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const handleChangeDigit = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const code = digits.join("");
  const isComplete = code.length === CODE_LENGTH;

  const handleVerify = () => {
    if (!isComplete || !email) return;
    verifyEmail({ email, code });
  };

  const handleResend = () => {
    if (seconds > 0 || resendCodePending || !email) return;
    resendCode(
      { email },
      {
        onSuccess: () => setSeconds(RESEND_COOLDOWN_SECONDS),
        onError: (err: AxiosError<{ retry_after?: number }>) => {
          const retryAfter = err.response?.data?.retry_after;
          if (typeof retryAfter === "number") setSeconds(retryAfter);
        },
      },
    );
  };

  return (
    <View className={"flex-1 w-full bg-white text-mainText"}>
      <Stack.Screen
        options={{
          headerShadowVisible: false,
          title: "",
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons name={"chevron-back"} size={24} color={"black"} />
            </Pressable>
          ),
        }}
      />

      <View className="flex flex-col gap-4 items-center my-10">
        <View className="bg-primary rounded-full w-[100px] h-[100px] flex items-center justify-center p-2">
          <Image
            source={appLogo}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        <PageTitle>Verification Code</PageTitle>
        <Body className="text-subText">Enter your code to verify your email</Body>
      </View>

      <View className={"px-8 flex gap-10"}>
        <View className="flex flex-row justify-between">
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(val) => handleChangeDigit(index, val)}
              onKeyPress={(e) => handleKeyPress(index, e)}
              keyboardType="number-pad"
              maxLength={1}
              className="border border-[#999999] rounded-md w-16 h-16 text-center text-xl text-mainText"
            />
          ))}
        </View>

        <View className="flex flex-col gap-2">
          {seconds > 0 && (
            <Body className="text-red-500">{formatCountdown(seconds)}</Body>
          )}
          <Body className="text-subText">
            We sent the verification code to {email || "your email"}
          </Body>
          <Body className="text-subText">
            Didn't receive the code?{" "}
            <Body
              onPress={handleResend}
              className={
                seconds > 0 ? "text-greyColor" : "text-primaryColor"
              }
            >
              Send again
            </Body>
          </Body>
        </View>
      </View>

      <View className={"absolute bottom-10 px-8 w-full"}>
        <Pressable
          onPress={handleVerify}
          disabled={!isComplete || verifyEmailPending}
          className={
            "bg-primaryColor text-white w-full h-[62px] rounded-full flex items-center justify-center active:opacity-80" +
            (!isComplete || verifyEmailPending ? " opacity-50" : "")
          }
        >
          <ButtonText className={"text-white"}>
            {verifyEmailPending ? "Verifying..." : "Verify"}
          </ButtonText>
        </Pressable>
      </View>
    </View>
  );
}
