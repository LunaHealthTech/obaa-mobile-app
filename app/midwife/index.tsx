import { useCallback } from "react";
import { ActivityIndicator, Pressable, SectionList, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Body, Caption, Label, PageTitle, SectionHeading } from "@/components/Typography";
import { ConsultationRow } from "@/components/ConsultationRow";
import { MidwifeAvatar } from "@/components/MidwifeAvatar";
import { NotificationBell } from "@/components/NotificationBell";
import { theme } from "@/constants/theme";
import { useAppointments } from "@/viewmodel/useAppointments";
import { useCurrentUser, useSignOut } from "@/viewmodel/useAuth";

export default function MidwifeHomePage() {
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const signOut = useSignOut();
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

  return (
    <View className={"bg-white flex-1"}>
      <View
        className={"flex-row items-center gap-3 px-4 pb-4 border-b border-borderGreyColor"}
        style={{ paddingTop: insets.top + 16 }}
      >
        {user && <MidwifeAvatar midwife={user} size={44} />}
        <View className={"flex-1"}>
          <Caption className={"text-primaryColor tracking-widest uppercase"}>Obaa + Consult</Caption>
          <PageTitle className={"text-mainText"}>My Consultations</PageTitle>
        </View>
        <NotificationBell />
        <Pressable onPress={signOut} accessibilityRole={"button"} hitSlop={8}>
          <Label className={"text-greyColor"}>Sign out</Label>
        </Pressable>
      </View>

      {upcoming.isLoading || past.isLoading ? (
        <View className={"flex-1 items-center justify-center"}>
          <ActivityIndicator color={theme.primaryColor} />
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
