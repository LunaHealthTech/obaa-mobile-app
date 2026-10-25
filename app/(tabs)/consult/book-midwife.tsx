import { useCallback, useEffect, useState } from "react";
import { View, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { format } from "date-fns";
import {
  ButtonText,
  SectionHeading,
} from "@/components/Typography";
import { ScreenHeader } from "@/components/ScreenHeader";
import { MidwifeHeader } from "@/components/AppointmentSummary";
import { ConcernPicker, ConsultationTypePicker } from "@/components/BookingPickers";
import { SlotPicker, bookingDays } from "@/components/SlotPicker";
import { routeForAppointment } from "@/lib/appointments/status";
import { MidwifeUnavailable } from "@/components/MidwifeUnavailable";
import {
  forgetMidwives,
  isMidwifeGone,
  reactToBookingError,
  useAppointment,
  useBookAppointment,
  useMidwife,
  useRescheduleAppointment,
} from "@/viewmodel/useAppointments";
import type { Concern, ConsultationType } from "@/types/appointment.types";

export default function BookMidwifePage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ midwifeId: string; rescheduleId?: string }>();
  const midwifeId = Number(params.midwifeId);
  const rescheduleId = params.rescheduleId ? Number(params.rescheduleId) : null;

  const { data: midwife, error: midwifeError } = useMidwife(midwifeId);
  const { data: existing } = useAppointment(rescheduleId ?? NaN);
  const book = useBookAppointment();
  const reschedule = useRescheduleAppointment(rescheduleId ?? NaN);

  const [slotsSaidGone, setSlotsSaidGone] = useState(false);
  const midwifeGone = slotsSaidGone || isMidwifeGone(midwifeError);
  const markMidwifeGone = useCallback(() => setSlotsSaidGone(true), []);

  useEffect(() => {
    if (midwifeGone) forgetMidwives();
  }, [midwifeGone]);

  const [chosenType, setChosenType] = useState<ConsultationType | null>(null);
  const [chosenConcern, setChosenConcern] = useState<Concern | null>(null);
  const [chosenDate, setChosenDate] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);

  const nextAvailableDay = midwife?.next_available_start
    ? format(new Date(midwife.next_available_start), "yyyy-MM-dd")
    : null;
  const date =
    chosenDate ??
    bookingDays.find((day) => day.iso === nextAvailableDay)?.iso ??
    bookingDays[0].iso;

  const consultationType =
    existing?.consultation_type ?? chosenType ?? midwife?.consultation_types[0]?.type ?? null;
  const concern = existing?.concern ?? chosenConcern ?? midwife?.specialties[0]?.code ?? null;
  const isPending = book.isPending || reschedule.isPending;
  const freeRebook = existing?.status === "MIDWIFE_NO_SHOW";

  const onBookingError = (error: unknown) => {
    if (isMidwifeGone(error)) return markMidwifeGone();
    const action = reactToBookingError(error, "Couldn't book this time");
    if (action.kind === "refresh-slots") setSelectedStart(null);
  };

  const handleSubmit = () => {
    if (!selectedStart || !consultationType || !concern) return;
    if (rescheduleId !== null) {
      reschedule.mutate(selectedStart, {
        onSuccess: (updated) =>
          router.replace({
            pathname: "/consult/appointment",
            params: { appointmentId: String(updated.id) },
          }),
        onError: onBookingError,
      });
      return;
    }
    book.mutate(
      {
        concern,
        consultation_type: consultationType,
        scheduled_start: selectedStart,
        midwife_id: midwifeId,
      },
      {
        onSuccess: (appointment) =>
          router.replace(routeForAppointment(appointment, new Date())),
        onError: onBookingError,
      },
    );
  };

  const canSubmit = !!selectedStart && !!consultationType && !!concern && !isPending;

  return (
    <View className={"bg-white flex-1"}>
      <ScreenHeader
        title={rescheduleId !== null ? "Pick a new time" : "Book a consultation"}
        subtitle={
          freeRebook
            ? "Your rebooking is free. Pick a new time with the same midwife."
            : rescheduleId !== null
            ? "Same midwife, same consultation, new time."
            : "Choose how and when you'd like to meet."
        }
      />

      {midwifeGone ? (
        rescheduleId !== null ? (
          <MidwifeUnavailable
            actionLabel={"Back to appointment"}
            onAction={() => router.back()}
          />
        ) : (
          <MidwifeUnavailable
            actionLabel={"Choose another midwife"}
            onAction={() => router.replace("/consult/choose-midwife")}
          />
        )
      ) : !midwife || !consultationType || !concern ? (
        <View className={"flex-1 items-center justify-center"}>
          <ActivityIndicator color={"#0F969C"} />
        </View>
      ) : (
        <>
          <ScrollView className={"flex-1"}>
            <View className={"px-4"}>
              <View className={"bg-white rounded-xl border border-borderGreyColor p-4"}>
                <MidwifeHeader midwife={midwife} />
              </View>
            </View>

            {rescheduleId === null && (
              <>
                <View className={"px-4 mt-6"}>
                  <SectionHeading className={"text-mainText mb-3"}>
                    Consultation Type
                  </SectionHeading>
                  <ConsultationTypePicker
                    options={midwife.consultation_types}
                    value={consultationType}
                    onChange={(type) => {
                      setChosenType(type);
                      setSelectedStart(null);
                    }}
                  />
                </View>

                <View className={"px-4 mt-6"}>
                  <SectionHeading className={"text-mainText mb-3"}>
                    What do you need support with?
                  </SectionHeading>
                  <ConcernPicker
                    options={midwife.specialties}
                    value={concern}
                    onChange={setChosenConcern}
                  />
                </View>
              </>
            )}

            <View className={"mt-6"}>
              <SlotPicker
                query={{ consultation_type: consultationType, midwife_id: midwifeId }}
                date={date}
                onDateChange={(next) => {
                  setChosenDate(next);
                  setSelectedStart(null);
                }}
                selectedStart={selectedStart}
                onSelect={setSelectedStart}
                onMidwifeGone={markMidwifeGone}
              />
            </View>

            <View className={"h-6"} />
          </ScrollView>

          <View className={"px-4 py-4 border-t border-borderGreyColor"}>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              accessibilityRole={"button"}
              accessibilityState={{ disabled: !canSubmit, busy: isPending }}
              className={`rounded-full py-4 flex-row items-center justify-center gap-2 active:opacity-80 ${
                canSubmit ? "bg-primaryColor" : "bg-borderGreyColor"
              }`}
            >
              {isPending && <ActivityIndicator color={"#fff"} size={"small"} />}
              <ButtonText className={"text-white"}>
                {!selectedStart
                  ? "Pick a time to continue"
                  : freeRebook
                    ? "Confirm free rebooking"
                    : rescheduleId !== null
                    ? "Confirm new time"
                    : "Continue"}
              </ButtonText>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
