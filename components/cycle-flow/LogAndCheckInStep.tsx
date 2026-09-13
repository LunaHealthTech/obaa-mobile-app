import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import { BottomSheetScrollView } from "@expo/ui/community/bottom-sheet";
import { useCycleFlowStore } from "@/repositories/useCycleFlowStore";
import { useConfirmedCycleStore } from "@/repositories/useConfirmedCycleStore";
import { useCycleList } from "@/viewmodel/useCycles";
import { useSaveCycleDate } from "@/viewmodel/usePeriodCheckIn";
import { useDayLog } from "@/viewmodel/useDayLog";
import { computeCycleDay, computeCyclePhase, isAssumedRangeActive } from "@/lib/CalendarHelpers";
import { findLogEmoji } from "@/constants/logOptions";
import { Body, ButtonText, Caption, SectionHeading } from "@/components/Typography";

const MAX_VISIBLE_EMOJI = 5;

export function LogAndCheckInStep() {
  const date = useCycleFlowStore((s) =>
    s.state.mode === "current-cycle" ? s.state.date : "",
  );
  const cycleId = useCycleFlowStore((s) =>
    s.state.mode === "current-cycle" ? s.state.cycleId : null,
  );
  const advance = useCycleFlowStore((s) => s.advance);
  const { log, isLoadingLog } = useDayLog(date || null);
  const { sortedCycles } = useCycleList();
  const assumedRanges = useConfirmedCycleStore((s) => s.ranges);
  const { save: saveCycleDate, isSaving } = useSaveCycleDate();
  const [revealedTag, setRevealedTag] = useState<string | null>(null);

  const cycle = sortedCycles.find((c) => c.id === cycleId);
  const assumedRange = cycleId != null ? assumedRanges[cycleId] : undefined;
  const isWithinActiveAssumedRange =
    !!assumedRange &&
    !!date &&
    isAssumedRangeActive(assumedRange, cycle) &&
    date >= assumedRange.startDate &&
    date <= assumedRange.bleedEndDate;
  const isConfirmedBleedDay =
    (!!cycle && !!date && date >= cycle.start_date && date <= cycle.bleed_end_date) ||
    isWithinActiveAssumedRange;

  const displayDate = date
    ? (() => {
        const [y, m, d] = date.split("-").map(Number);
        return new Date(y, m - 1, d);
      })()
    : null;

  const tags = [
    ...(log?.mood ? log.mood.split(", ").filter(Boolean) : []),
    ...(log?.symptoms ?? []),
  ];
  const knownTags = tags.filter((t) => findLogEmoji(t));
  const unknownTags = tags.filter((t) => !findLogEmoji(t));
  const visibleKnown = knownTags.slice(0, MAX_VISIBLE_EMOJI);
  const overflowCount = knownTags.length - visibleKnown.length;

  const onSeeingBlood = () => {
    saveCycleDate(date, { onSuccess: () => advance("flow-intensity") });
  };

  if (!date || !displayDate) return null;

  return (
    <View className="p-5 pb-8">
      <SectionHeading className="text-mainText">
        {format(displayDate, "d MMM")}
        {cycle ? ` - Cycle Day ${computeCycleDay(date, cycle)}` : ""}
      </SectionHeading>
      {cycle && (
        <Body className="text-subText mt-1">
          {computeCyclePhase(date, cycle)} phase
        </Body>
      )}

      <SectionHeading className="text-mainText mt-5 mb-3">
        Mood and Symptoms
      </SectionHeading>
      {revealedTag && (
        <View className="self-start bg-mainText rounded-full px-3 py-1 mb-2">
          <Caption className="text-white">{revealedTag}</Caption>
        </View>
      )}
      <View className="flex-row items-center bg-[#F2F2F2] rounded-2xl p-3">
        <BottomSheetScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-1"
        >
          <View className="flex-row items-center gap-2">
            {isLoadingLog && <Body className="text-subText px-2">Loading…</Body>}
            {!isLoadingLog && !log && (
              <Body className="text-subText px-2">No log for this day yet</Body>
            )}
            {visibleKnown.map((tag, index) => (
              <Pressable
                key={`${tag}-${index}`}
                onPress={() =>
                  setRevealedTag((prev) => (prev === tag ? null : tag))
                }
                className="w-12 h-12 rounded-full bg-white items-center justify-center"
              >
                <Text className="text-xl">{findLogEmoji(tag)}</Text>
              </Pressable>
            ))}
            {overflowCount > 0 && (
              <View className="w-12 h-12 rounded-full bg-[#0F969C1A] border border-primaryColor items-center justify-center">
                <Text className="text-primaryColor font-semibold">
                  +{overflowCount}
                </Text>
              </View>
            )}
            {unknownTags.length > 0 && (
              <View
                className="bg-white rounded-2xl px-4 h-12 justify-center"
                style={{ maxWidth: 170 }}
              >
                <Caption
                  className="text-mainText"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {unknownTags.join(", ")}
                </Caption>
              </View>
            )}
          </View>
        </BottomSheetScrollView>
        <Pressable
          onPress={() => router.push({ pathname: "/(tabs)/logs", params: { date } })}
          className="bg-primaryColor rounded-full w-14 h-14 items-center justify-center ml-2"
        >
          <Ionicons name="add" size={22} color="white" />
        </Pressable>
      </View>

      {isConfirmedBleedDay ? (
        <Pressable
          onPress={() => advance("end-date")}
          className="border-2 border-primaryColor rounded-full w-full py-4 items-center mt-6"
        >
          <ButtonText className="text-primaryColor">
            Edit period end date
          </ButtonText>
        </Pressable>
      ) : (
        <>
          <SectionHeading className="text-mainText text-center mt-8 mb-4">
            Have you started your period or noticed any bleeding today?
          </SectionHeading>
          <Pressable
            onPress={onSeeingBlood}
            disabled={isSaving}
            className="border-2 border-primaryColor rounded-full w-full py-4 items-center mb-3"
          >
            <ButtonText className="text-primaryColor">
              {isSaving ? "Saving..." : "🩸 Yes, I'm seeing blood"}
            </ButtonText>
          </Pressable>
          <Pressable
            onPress={() => advance("not-yet")}
            disabled={isSaving}
            className="border-2 border-borderGreyColor rounded-full w-full py-4 items-center"
          >
            <ButtonText className="text-mainText">🌿 No, Not yet</ButtonText>
          </Pressable>
        </>
      )}
    </View>
  );
}
