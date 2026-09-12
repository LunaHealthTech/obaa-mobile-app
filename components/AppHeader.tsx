import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/repositories/useAuthStore";
import { Body, SectionHeading } from "@/components/Typography";
import CalendarIcon from "@/assets/icons/topCalendarIcon.svg";
import NotificationsIcon from "@/assets/icons/notificationIcon.svg";

const notificationCount = 5;

export function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();
  const avatarUri = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${user?.first_name}&size=24&backgroundColor=d1d4f9`;

  return (
    <View
      className={"flex-row items-center justify-between px-4 pb-2"}
      style={{ paddingTop: insets.top + 16 }}
    >
      <View className={"flex-row items-center gap-3"}>
        <Link href={"/home/settings"} asChild>
          <Pressable className={"rounded-full overflow-hidden w-[50px] h-[50px]"}>
            <Image
              source={{ uri: avatarUri }}
              style={{ width: 50, height: 50 }}
            />
          </Pressable>
        </Link>
        <View>
          <Body className={"text-greyColor"}>Welcome back</Body>
          <SectionHeading className={"text-mainText"}>
            {user?.first_name}
          </SectionHeading>
        </View>
      </View>
      <View className={"flex-row gap-2"}>
        <Pressable
          className={
            "border-2 border-borderGreyColor w-[44px] h-[44px] rounded-full items-center justify-center"
          }
        >
          <CalendarIcon width={18} height={18} color={"#3A3A3A"} />
        </Pressable>
        <Pressable
          className={
            "border-2 border-borderGreyColor w-[44px] h-[44px] rounded-full items-center justify-center relative"
          }
        >
          <NotificationsIcon width={18} height={18} />
          <View
            className={
              "absolute -top-1 -right-1 bg-[#E82A73] rounded-full w-[18px] h-[18px] items-center justify-center"
            }
          >
            <Text className={"text-white text-[10px] font-bold"}>
              {notificationCount}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
