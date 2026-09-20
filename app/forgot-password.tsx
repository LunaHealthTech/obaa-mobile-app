import { View, Image, TextInput, Pressable } from "react-native";
import { Stack, Link } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appLogo, messageIcon } from "@/constants/assets";
import { forgotPasswordSchema } from "@/lib/FormSchemas";
import { useAuth } from "@/viewmodel/useAuth";
import { Body, ButtonText, Caption, PageTitle } from "@/components/Typography";

export default function ForgotPasswordScreen() {
  const {
    requestPasswordReset,
    requestPasswordResetPending,
    requestPasswordResetSuccess,
  } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <View className={"flex-1 w-full bg-white text-mainText"}>
      <Stack.Screen
        options={{
          headerShadowVisible: false,
          title: "",
          headerLeft: () => (
            <Link href={"/signin"}>
              <Ionicons name={"chevron-back"} size={24} color={"black"} />
            </Link>
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

        <PageTitle>Forgot Password?</PageTitle>
        <Body className="text-subText text-center px-8">
          Enter the email tied to your account and we'll send you a link to
          reset your password
        </Body>
      </View>

      {requestPasswordResetSuccess ? (
        <View className={"px-8 flex items-center gap-4"}>
          <View className="bg-[#0F969C1A] rounded-full px-3 py-1">
            <Caption className="text-primaryColor">Reset link sent</Caption>
          </View>
          <Body className="text-subText text-center">
            Check your email for a link to reset your password.
          </Body>
          <Link href={"/signin"}>
            <Body className="text-primaryColor">Back to Sign In</Body>
          </Link>
        </View>
      ) : (
        <View className={"px-8 flex gap-10"}>
          <View>
            <Body>Email</Body>
            <View
              className={
                "bg-white border border-[#999999] mt-2 rounded-md flex flex-row gap-2 items-center px-2"
              }
            >
              <Image source={messageIcon} width={20} height={20} />
              <Controller
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className={"bg-white flex-1 border-none"}
                    placeholder={"Eg. jon@gmail.com"}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize={"none"}
                    keyboardType={"email-address"}
                  />
                )}
                name={"email"}
              />
            </View>
            {errors.email && (
              <Body className="text-red-500 mt-1">{errors.email.message}</Body>
            )}
          </View>

          <Pressable
            onPress={handleSubmit((data) => requestPasswordReset(data))}
            disabled={requestPasswordResetPending}
            className={
              "bg-primaryColor text-white w-[360px] h-[62px] rounded-full flex items-center justify-center active:opacity-80" +
              (requestPasswordResetPending ? " opacity-50" : "")
            }
          >
            <ButtonText className={"text-white"}>
              {requestPasswordResetPending ? "Sending..." : "Send Reset Link"}
            </ButtonText>
          </Pressable>
        </View>
      )}
    </View>
  );
}
