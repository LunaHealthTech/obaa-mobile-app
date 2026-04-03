import { View, Text, Image, Pressable, TextInput } from "react-native";
import { Stack, Link } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";

const appLogo = require("@/assets/icons/ObaaLogoCircularC1.png");
const messageIcon = require("@/assets/icons/message.png");
const eyeIcon = require("@/assets/icons/eye.png");
const facebookIcon = require("@/assets/icons/facebook.png");
const googleIcon = require("@/assets/icons/google.png");
const appleIcon = require("@/assets/icons/apple.png");

const loginSchema = z.object({
  email: z
    .email({ message: "Not a valid email" })
    .min(1, "too short for an email"),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/\d/, { message: "Password must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character",
    }),
});

export default function SignInScreen() {
  const router = useRouter();
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const login = useAuthStore((s) => s.login);

  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: async (data) => {
      console.log({ dataFromSignIn: data });
      await login(data.user, data.tokens.access, data.tokens.refresh);
      router.navigate("/(tabs)");
    },
    onError: (err) => {
      console.log({ err: err.message, setni: err.response.data });
    },
  });

  return (
    <View className={"flex-1 justify-between w-full bg-white text-mainText"}>
      <Stack.Screen
        options={{
          headerShadowVisible: false,
          title: "",

          headerLeft: () => (
            <Link href={"/intro"}>
              <Ionicons name="chevron-back" size={24} color="black" />
            </Link>
          ),
        }}
      />
      {/* Header top section */}
      <View>
        <View className="flex flex-col gap-4 items-center my-10">
          {/* Logo circle */}
          <View className="bg-primary rounded-full w-[100px] h-[100px] flex items-center justify-center p-2">
            <Image
              source={appLogo}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>

          <Text className="text-2xl font-semibold">Welcome back</Text>
          <Text className="text-subText">
            Sign in to be able to access your page
          </Text>
        </View>

        {/*Form*/}
        <View className={"px-8 flex gap-10"}>
          <View>
            <Text>Email</Text>
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
                    className={".bg-white .mt-2 border-none"}
                    placeholder={"Email goes here"}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
                name={"email"}
              />
            </View>
            {/* Email error message */}
            {errors.email && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </Text>
            )}
          </View>
          <View>
            <Text>Password</Text>
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
            <View className={"flex flex-row justify-end gap-4 space-between"}>
              <Text className={"text-primaryColor"}>Forgot Password?</Text>
            </View>
            {/* Password error message */}
            {errors.password && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/*Action section*/}
      <View className={"flex justify-center items-center "}>
        <Pressable
          onPress={handleSubmit((data) => mutation.mutate(data))}
          className={
            "bg-primaryColor text-white w-[360px] h-[62px] rounded-full flex items-center justify-center active:opacity-80"
          }
        >
          <Text className={"text-white text-lg font-semibold"}>Login</Text>
        </Pressable>

        <View className={"my-5 flex gap-5 items-center"}>
          <Text>Or Sign up with</Text>
          <View className={"flex flex-row gap-5"}>
            <Image source={facebookIcon} width={40} height={40} />
            <Image source={googleIcon} width={40} height={40} />
            <Image source={appleIcon} width={50} height={55} />
          </View>
          <Text>
            Don't have an account yet?{" "}
            <Text className={"text-primaryColor font-bold"}>Sign up</Text>{" "}
          </Text>
          <Text>
            Need help? Visit our{" "}
            <Text className={"text-primaryColor font-bold"}>
              help center
            </Text>{" "}
          </Text>
        </View>
      </View>
    </View>
  );
}
