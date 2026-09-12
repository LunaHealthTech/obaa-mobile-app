import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
} from "@expo/ui/community/bottom-sheet";
import type { DayMarking } from "@/types/menstrual.types";
import { useDayLog } from "@/viewmodel/useDayLog";
import { findLogEmoji } from "@/constants/logOptions";
import { Body, Caption, SectionHeading } from "@/components/Typography";

interface DayDetailCardProps {
  date: string | null;
  marking?: DayMarking;
  onClose: () => void;
  onEdit?: () => void;
}

const MAX_VISIBLE_EMOJI = 5;

export function DayDetailCard({
  date,
  marking,
  onClose,
  onEdit,
}: DayDetailCardProps) {
  const { log, isLoadingLog } = useDayLog(date);
  const sheetRef = useRef<BottomSheetModal>(null);
  const pendingEditRef = useRef(false);
  const [revealedTag, setRevealedTag] = useState<string | null>(null);

  const handleEditPress = () => {
    pendingEditRef.current = true;
    sheetRef.current?.dismiss();
  };

  useEffect(() => {
    if (date) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
    setRevealedTag(null);
  }, [date]);

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

  return (
    <BottomSheetModal
      ref={sheetRef}
      onDismiss={() => {
        onClose();
        if (pendingEditRef.current) {
          pendingEditRef.current = false;
          onEdit?.();
        }
      }}
      enableDynamicSizing
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: "#fff" }}
    >
      <BottomSheetView>
        {date && displayDate && (
          <View className="p-5 pb-8">
            <View className="flex-row items-start justify-between">
              <View>
                <SectionHeading className="text-mainText">
                  {format(displayDate, "d MMM")}
                  {marking?.cycleDay ? ` - Cycle Day ${marking.cycleDay}` : ""}
                </SectionHeading>
                {marking?.phase && (
                  <Body className="text-subText mt-1">
                    {marking.phase} phase
                  </Body>
                )}
              </View>
              <Pressable
                onPress={onClose}
                className="bg-[#00000010] rounded-full p-1"
              >
                <Ionicons name="close" size={18} color="#3A3A3A" />
              </Pressable>
            </View>

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
                  {isLoadingLog && (
                    <Body className="text-subText px-2">Loading…</Body>
                  )}
                  {!isLoadingLog && !log && (
                    <Body className="text-subText px-2">
                      No log for this day yet
                    </Body>
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
                onPress={handleEditPress}
                className="bg-primaryColor rounded-full w-14 h-14 items-center justify-center ml-2"
              >
                <Ionicons name="add" size={22} color="white" />
              </Pressable>
            </View>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
