import { useState } from "react";
import { View, Pressable, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Body,
  ButtonText,
  SectionHeading,
} from "@/components/Typography";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Icon } from "@/components/icons/Icon";
import { ConcernPicker, ConsultationTypePicker } from "@/components/BookingPickers";
import { SlotPicker, bookingDays } from "@/components/SlotPicker";
import { concernOptions, parseConcern } from "@/lib/appointments/concerns";
import { routeForAppointment } from "@/lib/appointments/status";
import { reactToBookingError, useBookAppointment } from "@/viewmodel/useAppointments";
import type { Concern, ConsultationType } from "@/types/appointment.types";

const consultationTypes: { type: ConsultationType; label: string }[] = [
  { type: "CHAT", label: "Chat" },
  { type: "AUDIO", label: "Audio" },
  { type: "VIDEO", label: "Video" },
];

export default function MatchPreferencesPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ concern?: string }>();
  const [concern, setConcern] = useState<Concern>(
    parseConcern(params.concern) ?? "MISSED_PERIOD",
  );
  const [consultationType, setConsultationType] = useState<ConsultationType>("CHAT");
  const [date, setDate] = useState(bookingDays[0].iso);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const book = useBookAppointment();

  const resetSlot = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setSelectedStart(null);
  };

  const handleFindMidwife = () => {
    if (!selectedStart) return;
    book.mutate(
      {
        concern,
        consultation_type: consultationType,
        scheduled_start: selectedStart,
        notes: notes.trim(),
      },
      {
        onSuccess: (appointment) =>
          router.replace(routeForAppointment(appointment, new Date())),
        onError: (error) => {
          const action = reactToBookingError(error, "Couldn't request a midwife");
          if (action.kind === "refresh-slots") setSelectedStart(null);
        },
      },
    );
  };

  return (
    <ScrollView className={"bg-white flex-1"}>
      <ScreenHeader
        title={"Let's find the right support"}
        subtitle={"Tell us what you need and we'll handle the rest."}
      />

      <View className={"px-4 mt-2"}>
        <SectionHeading className={"text-mainText mb-3"}>
          What do you need support with?
        </SectionHeading>
        <ConcernPicker
          options={concernOptions}
          value={concern}
          onChange={resetSlot(setConcern)}
        />
      </View>

      <View className={"px-4 mt-6"}>
        <SectionHeading className={"text-mainText mb-3"}>
          Consultation Type
        </SectionHeading>
        <ConsultationTypePicker
          options={consultationTypes}
          value={consultationType}
          onChange={resetSlot(setConsultationType)}
        />
      </View>

      <View className={"mt-6"}>
        <SlotPicker
          query={{ consultation_type: consultationType, concern }}
          date={date}
          onDateChange={resetSlot(setDate)}
          selectedStart={selectedStart}
          onSelect={setSelectedStart}
        />
      </View>

      <View className={"px-4 mt-6"}>
        <SectionHeading className={"text-mainText mb-3"}>
          Additional Notes <Body className={"text-greyColor"}>(optional)</Body>
        </SectionHeading>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline={true}
          numberOfLines={4}
          placeholder={"Briefly describe what you need help with..."}
          placeholderTextColor={"#72777A"}
          className={
            "border border-borderGreyColor rounded-xl p-4 text-mainText h-24"
          }
          textAlignVertical={"top"}
        />
      </View>

      <View className={"px-4 mt-6"}>
        <Pressable
          onPress={handleFindMidwife}
          disabled={!selectedStart || book.isPending}
          accessibilityRole={"button"}
          accessibilityState={{ disabled: !selectedStart || book.isPending }}
          className={`rounded-full py-4 flex-row items-center justify-center gap-2 active:opacity-80 ${
            selectedStart && !book.isPending ? "bg-primaryColor" : "bg-borderGreyColor"
          }`}
        >
          {book.isPending ? (
            <ActivityIndicator color={"#fff"} size={"small"} />
          ) : (
            selectedStart && <Icon name={"search"} size={18} color={"#FFFFFF"} />
          )}
          <ButtonText className={"text-white"}>
            {selectedStart ? "Find My Midwife" : "Pick a time to continue"}
          </ButtonText>
        </Pressable>
      </View>

      <View className={"h-10"} />
    </ScrollView>
  );
}
