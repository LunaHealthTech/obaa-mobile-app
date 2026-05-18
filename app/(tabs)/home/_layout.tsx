import { Link, Stack, useRouter } from "expo-router";
import { View, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuthStore } from "@/repositories/useAuthStore";

export default function HomeLayout() {
  const userInfo = useAuthStore((state) => state.user);
  const router = useRouter();
  let src = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${userInfo?.first_name}&size=24&backgroundColor=d1d4f9`;
  // let src = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=S&size=24&backgroundColor=d1d4f9`;
  // console.log({ userInfo });
  // if (userInfo) {
  //   if (userInfo?.status === "UNASSIGNED") {
  //     router.navigate("/onboarding/persona");
  //   }
  // }

  return (
    <Stack>
      <Stack.Screen
        name={"index"}
        options={{
          title: userInfo?.first_name,
          headerShadowVisible: false,
          headerLeft: () => (
            <View className={"border rounded-full bg-blue-600 mr-2"}>
              <Link href={"/home/settings"}>
                <Image source={{ uri: src }} width={50} height={50} />
              </Link>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name={"settings"}
        options={{
          title: "Settings",
          headerLeft: () => (
            <Link href={"/home"}>
              <Ionicons name="chevron-back" size={24} color="black" />
            </Link>
          ),
        }}
      />
    </Stack>
  );
}
