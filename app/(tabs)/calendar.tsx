import { View, ScrollView, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { Calendar } from "@/components/Calendar";
import { CircularProgress } from "@/components/CircularProgress";
import { DayDetailCard } from "@/components/DayDetailCard";
import { PeriodCheckInSheet } from "@/components/period-checkin/PeriodCheckInSheet";
import { FixCycleSheet } from "@/components/fix-cycle/FixCycleSheet";
import { useMenstrualProfileViewModel } from "@/viewmodel/useMenstrualProfile";
import { usePeriodCheckInStore } from "@/repositories/usePeriodCheckInStore";
import { useFixCycleStore } from "@/repositories/useFixCycleStore";
import type { DayMarking } from "@/types/menstrual.types";
import BlueOvulation from "@/assets/ovulation_blue.svg";
import PregnancyWhite from "@/assets/pregnancy_white.svg";
import { Body, Caption, PageTitle } from "@/components/Typography";

export default function CalendarPage() {
  const { data, isLoading, isError } = useMenstrualProfileViewModel();
  const startCheckIn = usePeriodCheckInStore((s) => s.start);
  const startFixCycle = useFixCycleStore((s) => s.start);
  const dismissedCycleId = useFixCycleStore((s) => s.dismissedCycleId);
  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    marking?: DayMarking;
  } | null>(null);

  const isCycleStale = data?.calendarPage.isCycleStale;

  useEffect(() => {
    if (isCycleStale && data?.currentCycleId !== dismissedCycleId) {
      startFixCycle({ cycleId: data?.currentCycleId ?? null });
    }
  }, [isCycleStale, data?.currentCycleId, dismissedCycleId, startFixCycle]);

  const handleDayPress = (date: string, marking?: DayMarking) => {
    if (marking?.category === "MENSTRUAL" && marking?.predicted) {
      const isCurrentCycle =
        marking.cycleId != null && marking.cycleId === data?.currentCycleId;
      startCheckIn({
        date,
        cycleId: isCurrentCycle ? marking.cycleId ?? null : null,
        assumedBleedEndDate: isCurrentCycle
          ? null
          : marking.cycleBleedEndDate ?? null,
        step: "quick-check-in",
      });
      return;
    }
    setSelectedDay({ date, marking });
  };

  const canEditSelectedDay =
    !!selectedDay &&
    selectedDay.marking?.category === "MENSTRUAL" &&
    !selectedDay.marking?.predicted &&
    selectedDay.marking?.cycleId === data?.currentCycleId;

  const handleEditSelectedDay = () => {
    if (!selectedDay) return;
    if (canEditSelectedDay) {
      startCheckIn({
        date: selectedDay.date,
        cycleId: selectedDay.marking?.cycleId ?? null,
        step: "end-date",
      });
    } else {
      router.push({
        pathname: "/(tabs)/logs",
        params: { date: selectedDay.date },
      });
    }
    setSelectedDay(null);
  };

  if (isLoading) {
    return <Body>Loading...</Body>;
  }

  if (isError) {
    console.error(isError);
  }
  return (
    <View className="flex-1 bg-white">
      <ScrollView className="bg-white">
      <AppHeader />
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
            <Caption className="w-fit">Predicted Period</Caption>
          </View>
          <View className={`flex-row items-center gap-2 w-fit`}>
            <View className={"w-4 h-4 bg-[#E82A73] rounded-full"}></View>
            <Caption className="w-fit line-clamp-2 wrap">Confirmed Period</Caption>
          </View>
        </View>
        <View className={"flex-row gap-4 w-fit px-4 .border-2"}>
          <View className={`flex-row gap-2 items-center `}>
            <View
              className={"w-4 h-4 flex-row bg-[#DEE4F5] rounded-full"}
            ></View>
            <Caption>Fertile Window</Caption>
          </View>
          <View className={`flex-row gap-2 items-center `}>
            <View className={"w-4 h-4 bg-[#07226B] rounded-full"}> </View>
            <Caption>Ovulation day</Caption>
          </View>
          <View className={`flex-row gap-2 items-center `}>
            <View className={"w-4 h-4 bg-[#3CB9FB50] rounded-full"}></View>
            <Caption>Safe days</Caption>
          </View>
        </View>
      </View>
      <Pressable
        className={"px-4 items-center mt-20"}
        onPress={() =>
          startFixCycle({ cycleId: data?.currentCycleId ?? null })
        }
      >
        <CircularProgress
          phase={data?.calendarPage.phase}
          day={data?.calendarPage.numberOfDaysIn}
          totalDays={data?.calendarPage.totalDays}
        />
      </Pressable>
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
            <Caption className={"text-greyColor"}>Next Ovulation</Caption>
            <PageTitle>15 Days</PageTitle>
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
            <Caption className={"text-greyColor"}>Pregnancy</Caption>
            <PageTitle className={"text-mainText"}>
              {data?.calendarPage?.pregnancyProbability}
            </PageTitle>
          </View>
        </View>
      </View>
      </ScrollView>
      <DayDetailCard
        date={selectedDay?.date ?? null}
        marking={selectedDay?.marking}
        onClose={() => setSelectedDay(null)}
        onEdit={handleEditSelectedDay}
      />
      <PeriodCheckInSheet />
      <FixCycleSheet />
    </View>
  );
}
