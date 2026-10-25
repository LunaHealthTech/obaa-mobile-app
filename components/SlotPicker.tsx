import { useEffect } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { addDays, format } from "date-fns";
import {
  Body,
  Caption,
  Label,
  SectionHeading,
} from "@/components/Typography";
import { extractErrorMessage } from "@/lib/apiClient";
import { isMidwifeGone, useSlots } from "@/viewmodel/useAppointments";
import type { SlotQuery } from "@/types/appointment.types";

const BOOKING_WINDOW_DAYS = 10;

export const bookingDays = Array.from({ length: BOOKING_WINDOW_DAYS + 1 }, (_, index) => {
  const date = addDays(new Date(), index);
  return {
    iso: format(date, "yyyy-MM-dd"),
    weekday: format(date, "EEE"),
    day: format(date, "d"),
  };
});

type Props = {
  query: Omit<SlotQuery, "date"> | null;
  date: string;
  onDateChange: (date: string) => void;
  selectedStart: string | null;
  onSelect: (start: string) => void;
  onMidwifeGone?: () => void;
};

export function SlotPicker({
  query,
  date,
  onDateChange,
  selectedStart,
  onSelect,
  onMidwifeGone,
}: Props) {
  const { data: slots, isLoading, error, refetch } = useSlots(
    query ? ({ ...query, date } as SlotQuery) : null,
  );
  const midwifeGone = isMidwifeGone(error);

  useEffect(() => {
    if (midwifeGone) onMidwifeGone?.();
  }, [midwifeGone, onMidwifeGone]);

  return (
    <View>
      <SectionHeading className={"text-mainText mb-3 px-4"}>Preferred day</SectionHeading>
      <FlatList
        horizontal={true}
        data={bookingDays}
        keyExtractor={(item) => item.iso}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
        renderItem={({ item }) => {
          const isSelected = item.iso === date;
          return (
            <Pressable
              onPress={() => onDateChange(item.iso)}
              accessibilityRole={"button"}
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={format(new Date(`${item.iso}T00:00:00`), "EEEE d MMMM")}
              className={
                isSelected
                  ? "bg-primaryColor rounded-xl items-center justify-center w-14 h-16"
                  : "bg-white border border-borderGreyColor rounded-xl items-center justify-center w-14 h-16"
              }
            >
              <Caption className={isSelected ? "text-white" : "text-greyColor"}>
                {item.weekday}
              </Caption>
              <SectionHeading className={isSelected ? "text-white mt-1" : "text-mainText mt-1"}>
                {item.day}
              </SectionHeading>
            </Pressable>
          );
        }}
      />

      <View className={"px-4 mt-6"}>
        <SectionHeading className={"text-mainText mb-3"}>Preferred time</SectionHeading>
        {isLoading && <ActivityIndicator color={"#0F969C"} />}
        {error && !midwifeGone && (
          <Pressable onPress={() => refetch()} accessibilityRole={"button"}>
            <Body className={"text-greyColor"}>
              {extractErrorMessage(error, "Couldn't load times.")}{" "}
              <Label className={"text-primaryColor"}>Try again</Label>
            </Body>
          </Pressable>
        )}
        {slots && slots.every((slot) => !slot.available) && (
          <Body className={"text-greyColor mb-3"}>
            No times left on this day. Try another day.
          </Body>
        )}
        {slots && (
          <View className={"flex-row flex-wrap gap-2"}>
            {slots.map((slot) => {
              const isSelected = slot.start === selectedStart;
              const label = format(new Date(slot.start), "hh:mm a");
              return (
                <Pressable
                  key={slot.start}
                  disabled={!slot.available}
                  onPress={() => onSelect(slot.start)}
                  accessibilityRole={"button"}
                  accessibilityState={{ selected: isSelected, disabled: !slot.available }}
                  className={
                    isSelected
                      ? "bg-primaryColor rounded-full px-4 py-2"
                      : !slot.available
                        ? "bg-borderGreyColor rounded-full px-4 py-2"
                        : "bg-white border border-borderGreyColor rounded-full px-4 py-2"
                  }
                >
                  <Label
                    className={
                      isSelected
                        ? "text-white"
                        : !slot.available
                          ? "text-greyColor line-through"
                          : "text-mainText"
                    }
                  >
                    {label}
                  </Label>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
