import { View, Text, Pressable, Image } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { Stack } from "expo-router";
import CalendarIcon from "@/assets/icons/topCalendarIcon.svg";
import NotificationsIcon from "@/assets/icons/notificationIcon.svg";
import PinkFlowerIcon from "@/assets/icons/flowers-1.svg";
import DrippingBloodIcon from "@/assets/icons/drippingBlood.svg";
import ClockIcon from "@/assets/icons/clock.svg";
import SyncIcon from "@/assets/icons/sync.svg";
import PregnancyIcon from "@/assets/icons/pregnancy.svg";

import { flowers } from "@/constants/assets";
import { StatusBar } from "expo-status-bar";
import { MenstrualInfoCard } from "@/components/MenstrualInfoCard";
import { ShareCard } from "@/components/ShareCard";

export default function HomeScreen() {
  const logout = useAuthStore((state) => state.logout);
  const handleShareClick = () => {
    // do nothing
  };
  return (
    <View className={"bg-white px-8"}>
      <StatusBar style={"dark"} />
      <Stack.Screen
        options={{
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
      <View className={"flex flex-row gap-3 items-center my-5"}>
        <CalendarIcon width={25} height={25} color={"#3A3A3A"} />
        <Text className={"font-bold"}>September 2026</Text>
        <Image source={flowers} width={25} height={25} />
      </View>

      {/*  Today's update */}
      <View>
        <View className={"flex flex-row justify-between items-center"}>
          <Text className={"font-semibold"}>Today&apos;s Update</Text>
          <PinkFlowerIcon width={55} height={55} />
        </View>
        {/*    Cards go here */}
        <MenstrualInfoCard
          text={"You are currently in: Menstrual Phase"}
          subText={"Period started 2 days ago"}
        >
          <DrippingBloodIcon width={35} height={35} />
        </MenstrualInfoCard>
        <MenstrualInfoCard text={"Period Length: 5 days"} subText={"Normal"}>
          <ClockIcon width={35} height={35} />
        </MenstrualInfoCard>

        <MenstrualInfoCard text={"Cycle Length: 28 days"} subText={"Normal"}>
          <SyncIcon width={35} height={35} />
        </MenstrualInfoCard>
        <MenstrualInfoCard text={"Pregnancy"} subText={"Low"}>
          <PregnancyIcon width={35} height={35} />
        </MenstrualInfoCard>
      </View>

      <View>
        <ShareCard handleClick={handleShareClick} />
      </View>

      {/*How do you feel today*/}
      <View></View>
      <Pressable onPress={() => logout()}>
        <Text>Logout</Text>
      </Pressable>
    </View>
  );
}
