import { useState } from "react";
import { View, Image, TextInput, Pressable } from "react-native";
import { Stack, Link, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appLogo, eyeIcon } from "@/constants/assets";
import { resetPasswordSchema } from "@/lib/FormSchemas";
import { useAuth } from "@/viewmodel/useAuth";
import { Body, ButtonText, PageTitle } from "@/components/Typography";

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { confirmPasswordReset, confirmPasswordResetPending } = useAuth();
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [hideConfirmPassword, setHideConfirmPassword] =
    useState<boolean>(true);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
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

        <PageTitle>Reset Password</PageTitle>
        <Body className="text-subText text-center px-8">
          Choose a new password for your account
        </Body>
      </View>

      {!token ? (
        <View className={"px-8 flex items-center gap-4"}>
          <Body className="text-red-500 text-center">
            This reset link is invalid or has expired.
          </Body>
          <Link href={"/forgot-password"}>
            <Body className="text-primaryColor">Request a new link</Body>
          </Link>
        </View>
      ) : (
        <View className={"px-8 flex gap-10"}>
          <View>
            <Body>New Password</Body>
            <View
              className={
                "bg-white border border-[#999999] mt-2 rounded-md flex flex-row gap-2 items-center px-2"
              }
            >
              <MaterialIcons name="lock-outline" size={20} color="#999999" />
              <Controller
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    className={"bg-white flex-1 border-none"}
                    secureTextEntry={hidePassword}
                    placeholder={"••••••••••••••••"}
                  />
                )}
                name={"password"}
              />
              <Pressable
                className={"active:opacity-70"}
                onPress={() => setHidePassword(!hidePassword)}
              >
                <Image source={eyeIcon} height={20} width={20} />
              </Pressable>
            </View>
            {errors.password && (
              <Body className="text-red-500 mt-1">
                {errors.password.message}
              </Body>
            )}
          </View>

          <View>
            <Body>Confirm Password</Body>
            <View
              className={
                "bg-white border border-[#999999] mt-2 rounded-md flex flex-row gap-2 items-center px-2"
              }
            >
              <MaterialIcons name="lock-outline" size={20} color="#999999" />
              <Controller
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    className={"bg-white flex-1 border-none"}
                    secureTextEntry={hideConfirmPassword}
                    placeholder={"••••••••••••••••"}
                  />
                )}
                name={"confirmPassword"}
              />
              <Pressable
                className={"active:opacity-70"}
                onPress={() => setHideConfirmPassword(!hideConfirmPassword)}
              >
                <Image source={eyeIcon} height={20} width={20} />
              </Pressable>
            </View>
            {errors.confirmPassword && (
              <Body className="text-red-500 mt-1">
                {errors.confirmPassword.message}
              </Body>
            )}
          </View>

          <Pressable
            onPress={handleSubmit((data) =>
              confirmPasswordReset({ password: data.password, token }),
            )}
            disabled={confirmPasswordResetPending}
            className={
              "bg-primaryColor text-white w-[360px] h-[62px] rounded-full flex items-center justify-center active:opacity-80" +
              (confirmPasswordResetPending ? " opacity-50" : "")
            }
          >
            <ButtonText className={"text-white"}>
              {confirmPasswordResetPending
                ? "Resetting..."
                : "Reset Password"}
            </ButtonText>
          </Pressable>
        </View>
      )}
    </View>
  );
}
