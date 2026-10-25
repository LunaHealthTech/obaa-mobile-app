import { useCallback } from "react";
import { ActivityIndicator, SectionList, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Body, SectionHeading } from "@/components/Typography";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ConsultationRow } from "@/components/ConsultationRow";
import { useAppointments } from "@/viewmodel/useAppointments";

export default function ConsultationsPage() {
  const upcoming = useAppointments("upcoming");
  const past = useAppointments("past");
  const { refetch: refetchUpcoming } = upcoming;
  const { refetch: refetchPast } = past;

  useFocusEffect(
    useCallback(() => {
      refetchUpcoming();
      refetchPast();
    }, [refetchUpcoming, refetchPast]),
  );

  const sections = [
    { title: "Upcoming", data: upcoming.data ?? [], empty: "No upcoming consultations" },
    { title: "Past", data: past.data ?? [], empty: "No past consultations" },
  ];
  const isLoading = upcoming.isLoading || past.isLoading;

  return (
    <View className={"bg-white flex-1"}>
      <ScreenHeader title={"My Consultations"} bordered={true} />

      {isLoading ? (
        <View className={"flex-1 items-center justify-center"}>
          <ActivityIndicator color={"#0F969C"} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View className={"mt-2"}>
              <SectionHeading className={"text-mainText"}>{section.title}</SectionHeading>
              {section.data.length === 0 && (
                <Body className={"text-greyColor mt-2"}>{section.empty}</Body>
              )}
            </View>
          )}
          renderItem={({ item }) => <ConsultationRow appointment={item} />}
        />
      )}
    </View>
  );
}
