import { View, ScrollView, Pressable } from "react-native";
import { useEffect } from "react";
import { format } from "date-fns";
import { AppHeader } from "@/components/AppHeader";
import { Calendar } from "@/components/Calendar";
import { CircularProgress } from "@/components/CircularProgress";
import { CycleFlowSheet } from "@/components/cycle-flow/CycleFlowSheet";
import { useMenstrualProfileViewModel } from "@/viewmodel/useMenstrualProfile";
import { useCycleList } from "@/viewmodel/useCycles";
import { useCycleFlowStore } from "@/repositories/useCycleFlowStore";
import { findNextCycle, findOwningCycle } from "@/lib/CalendarHelpers";
import BlueOvulation from "@/assets/ovulation_blue.svg";
import PregnancyWhite from "@/assets/pregnancy_white.svg";
import { Body, ButtonText, Caption, PageTitle } from "@/components/Typography";

export default function CalendarPage() {
  const {
    data,
    isLoading,
    isError,
    refetch: refetchProfile,
  } = useMenstrualProfileViewModel();
  const { sortedCycles, isCyclesError, refetchCycles } = useCycleList();
  const flowMode = useCycleFlowStore((s) => s.state.mode);
  const openForOldCycle = useCycleFlowStore((s) => s.openForOldCycle);
  const openForCurrentCycle = useCycleFlowStore((s) => s.openForCurrentCycle);
  const openForStaleFix = useCycleFlowStore((s) => s.openForStaleFix);
  const dismissedCycleId = useCycleFlowStore((s) => s.dismissedCycleId);

  const isCycleStale = data?.calendarPage.isCycleStale;
  const isWithinCycleStartWindow = data?.calendarPage.isWithinCycleStartWindow;

  useEffect(() => {
    if (
      isCycleStale &&
      isWithinCycleStartWindow &&
      data?.currentCycleId !== dismissedCycleId &&
      flowMode === "idle"
    ) {
      openForStaleFix({
        cycleId: data?.currentCycleId ?? null,
        cycleLength: data?.general.cycleLength ?? null,
      });
    }
  }, [
    isCycleStale,
    isWithinCycleStartWindow,
    data?.currentCycleId,
    dismissedCycleId,
    flowMode,
    openForStaleFix,
  ]);

  const handleDayPress = (date: string) => {
    const owner = findOwningCycle(date, sortedCycles);

    if (!owner) {
      // no cycle history at all yet — still show the log view, nothing to correct
      openForCurrentCycle({ date, cycleId: null, assumedBleedEndDate: null });
      return;
    }

    if (owner.id === data?.currentCycleId) {
      openForCurrentCycle({
        date,
        cycleId: owner.id,
        assumedBleedEndDate: owner.predicted ? owner.bleed_end_date : null,
      });
      return;
    }

    if (owner.id == null) {
      // virtual predicted continuation of the still-open cycle — no real id to updateCycle
      openForStaleFix({
        cycleId: data?.currentCycleId ?? null,
        cycleLength: data?.general.cycleLength ?? null,
      });
      return;
    }

    const next = findNextCycle(owner, sortedCycles);
    openForOldCycle({
      date,
      tappedCycleId: owner.id,
      nextCycleId: next?.id ?? data?.currentCycleId ?? null,
      seed: {
        periodStart: owner.start_date,
        bleedingEnd: owner.bleed_end_date,
        nextPeriodStart: next?.start_date ?? format(new Date(), "yyyy-MM-dd"),
      },
      cycleLength: data?.general.cycleLength ?? null,
    });
  };

  if (isLoading) {
    return <Body>Loading...</Body>;
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="bg-white">
      <AppHeader />
      {(isError || isCyclesError) && (
        <View className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex-row items-center justify-between gap-3">
          <Body className="text-red-600 flex-1">
            Couldn't load your cycle data. Please try again.
          </Body>
          <Pressable
            onPress={() => {
              refetchProfile();
              refetchCycles();
            }}
            className="bg-primaryColor rounded-full px-4 py-2"
          >
            <ButtonText className="text-white">Retry</ButtonText>
          </Pressable>
        </View>
      )}
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
        onPress={() => {
          if (flowMode === "idle") {
            openForStaleFix({
              cycleId: data?.currentCycleId ?? null,
              cycleLength: data?.general.cycleLength ?? null,
            });
          }
        }}
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
      <CycleFlowSheet />
    </View>
  );
}
