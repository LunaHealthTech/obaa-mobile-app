import { useAuthStore } from "@/repositories/useAuthStore";
import { Link, Stack } from "expo-router";
import { View } from "react-native";
import { Image } from "expo-image";
import CalendarIcon from "@/assets/icons/topCalendarIcon.svg";
import NotificationsIcon from "@/assets/icons/notificationIcon.svg";
import { JSX } from "react";

interface SharedNavProps {
  name?: string;
}

export function SharedNav({ name }: SharedNavProps): JSX.Element {
  const userInfo = useAuthStore((state) => state.user);
  let src = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${userInfo?.first_name}&size=24&backgroundColor=d1d4f9`;

  return (
    <Stack.Screen
      options={{
        title: userInfo?.first_name,
        headerShadowVisible: false,
        headerLeft: () => (
          <View
            className={"border rounded-full bg-blue-600 mr-2 overflow-hidden"}
          >
            <Link href={"/home/settings"}>
              <Image source={{ uri: src }} width={50} height={50} />
            </Link>
          </View>
        ),
        headerRight: () => (
          <View className={"flex flex-row gap-2"}>
            <View
              className={
                "border-2 border-[#DADADA] w-[50px] h-[50px] rounded-full flex items-center justify-center"
              }
            >
              <CalendarIcon width={20} height={20} color={"#3A3A3A"} />
            </View>
            <View
              className={
                "border-2 border-[#DADADA] w-[50px] h-[50px] rounded-full flex items-center justify-center"
              }
            >
              <NotificationsIcon width={20} height={20} />
            </View>
          </View>
        ),
      }}
    />
  );
}
