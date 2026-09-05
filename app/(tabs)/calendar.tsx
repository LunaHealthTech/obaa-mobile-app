import { View, Text, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SharedNav } from "@/components/SharedNav";
import { Calendar } from "@/components/Calendar";
import { CircularProgress } from "@/components/CircularProgress";
import { DayDetailCard } from "@/components/DayDetailCard";
import { useMenstrualProfileViewModel } from "@/viewmodel/useMenstrualProfile";
import { usePeriodCheckInStore } from "@/repositories/usePeriodCheckInStore";
import type { DayMarking } from "@/types/menstrual.types";
import BlueOvulation from "@/assets/ovulation_blue.svg";
import PregnancyWhite from "@/assets/pregnancy_white.svg";

export default function CalendarPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useMenstrualProfileViewModel();
  const startCheckIn = usePeriodCheckInStore((s) => s.start);
  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    marking?: DayMarking;
  } | null>(null);

  const handleDayPress = (date: string, marking?: DayMarking) => {
    if (marking?.category === "MENSTRUAL" && marking?.predicted) {
      router.push({
        pathname: "/period-checkin/quick-check-in",
        params: {
          date,
          cycleId: marking.cycleId ? String(marking.cycleId) : undefined,
        },
      });
      return;
    }
    setSelectedDay({ date, marking });
  };

  const handleEditCurrentCycle = () => {
    if (!selectedDay) return;
    startCheckIn({
      mode: "edit",
      date: selectedDay.date,
      cycleId: selectedDay.marking?.cycleId ?? null,
    });
    setSelectedDay(null);
    router.push("/period-checkin/date");
  };

  const canEditSelectedDay =
    !!selectedDay &&
    selectedDay.marking?.category === "MENSTRUAL" &&
    !selectedDay.marking?.predicted &&
    selectedDay.marking?.cycleId === data?.currentCycleId;

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (isError) {
    console.error(isError);
  }
  return (
    <View className="flex-1 bg-white">
      <ScrollView className="bg-white">
      <View className={"px-4"}>
        <SharedNav />
      </View>
      <View className={"bg-white flex-1 w-full"}>
        <Calendar onDayPress={handleDayPress} />
        <View
          className={
            "flex flex-row flex-wrap text-mainText text-[10px] px-4 w-full h-[25px] gap-2 .border-2"
          }
        >
          <View className={`flex-row items-center gap-1 w-fit .border-2`}>
            <View
              className={
                "w-4 h-4 border border-dashed border-[#E82A73] rounded-full"
              }
            ></View>
            <Text className="w-fit">Predicted Period</Text>
          </View>
          <View className={`flex-row items-center gap-2 w-fit`}>
            <View className={"w-4 h-4 bg-[#E82A73] rounded-full"}></View>
            <Text className="w-fit line-clamp-2 wrap">Confirmed Period</Text>
          </View>
        </View>
        <View className={"flex-row gap-4 w-fit px-4 .border-2"}>
          <View className={`flex-row gap-2 items-center `}>
            <View
              className={"w-4 h-4 flex-row bg-[#DEE4F5] rounded-full"}
            ></View>
            <Text>Fertile Window</Text>
          </View>
          <View className={`flex-row gap-2 items-center `}>
            <View className={"w-4 h-4 bg-[#07226B] rounded-full"}> </View>
            <Text>Ovulation day</Text>
          </View>
          <View className={`flex-row gap-2 items-center `}>
            <View className={"w-4 h-4 bg-[#3CB9FB50] rounded-full"}></View>
            <Text>Safe days</Text>
          </View>
        </View>
      </View>
      <View className={"px-4 items-center mt-20"}>
        <CircularProgress
          phase={data?.calendarPage.phase}
          day={data?.calendarPage.numberOfDaysIn}
          totalDays={data?.calendarPage.totalDays}
        />
      </View>
      <View
        className={"flex-1 flex-row items-start justify-between mt-10 px-4"}
      >
        <View
          className={
            "border-2 border-[#07226B] flex-row rounded-xl p-4 w-[188px] items-center gap-5"
          }
        >
          <View
            className={
              "bg-[#07226B30] rounded-full w-[50px] h-[50px] items-center justify-center"
            }
          >
            <BlueOvulation />
          </View>
          <View>
            <Text className={"text-greyColor"}>Next Ovulation</Text>
            <Text className={"text-2xl font-semibold"}>15 Days</Text>
          </View>
        </View>
        <View
          className={
            "border-2 border-[#AF52DE] flex-row items-center rounded-xl p-4 gap-4"
          }
        >
          <View className={"bg-[#AF52DE] w-[50px] h-[50px] p-2 rounded-full"}>
            <PregnancyWhite />
          </View>
          <View>
            <Text className={"text-greyColor"}>Pregnancy</Text>
            <Text className={"text-2xl font-semibold text-mainText"}>
              {data?.calendarPage?.pregnancyProbability}
            </Text>
          </View>
        </View>
      </View>
      </ScrollView>
      {selectedDay && (
        <DayDetailCard
          date={selectedDay.date}
          marking={selectedDay.marking}
          onClose={() => setSelectedDay(null)}
          onEdit={canEditSelectedDay ? handleEditCurrentCycle : undefined}
        />
      )}
    </View>
  );
}
