import { useEffect, useState } from "react";
import { View, Pressable, TextInput, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import {
  Body,
  ButtonText,
  CardTitle,
  Caption,
  Label,
} from "@/components/Typography";
import { MidwifeAvatar } from "@/components/MidwifeAvatar";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Icon } from "@/components/icons/Icon";
import { IconBadge } from "@/components/icons/IconBadge";
import { VerifiedMark, consultationTypeIcon } from "@/components/AppointmentSummary";
import { theme } from "@/constants/theme";
import {
  midwifeFilters,
  midwifeQuery,
  type MidwifeFilterLabel,
} from "@/lib/appointments/filters";
import { nextAvailableLabel } from "@/lib/appointments/format";
import { useMidwives } from "@/viewmodel/useAppointments";

const SEARCH_DEBOUNCE_MS = 300;

export default function ChooseMidwifePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<MidwifeFilterLabel>("All");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const { data: midwives, isLoading, isError, refetch } = useMidwives(
    midwifeQuery(selectedFilter, debouncedQuery),
  );
  const now = new Date();

  const handleViewProfile = (midwifeId: number) => {
    router.push({
      pathname: "/consult/midwife-profile",
      params: { id: String(midwifeId) },
    });
  };

  const handleQuickBook = (midwifeId: number) => {
    router.push({
      pathname: "/consult/book-midwife",
      params: { midwifeId: String(midwifeId) },
    });
  };

  return (
    <View className={"bg-white flex-1"}>
      <ScreenHeader
        title={"Choose a midwife"}
        subtitle={"All midwives are certified professionals"}
      />

      <View className={"px-4"}>
        <View
          className={
            "flex-row items-center gap-2 bg-white border border-borderGreyColor rounded-xl px-4 py-3"
          }
        >
          <Icon name={"search"} size={18} color={theme.greyColor} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={"Search by name or specialty..."}
            placeholderTextColor={"#72777A"}
            accessibilityLabel={"Search midwives"}
            className={"flex-1 text-mainText"}
          />
        </View>
      </View>

      <View className={"mt-4"}>
        <FlatList
          horizontal={true}
          data={midwifeFilters}
          keyExtractor={(item) => item.label}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          renderItem={({ item }) => {
            const isSelected = item.label === selectedFilter;
            return (
              <Pressable
                onPress={() => setSelectedFilter(item.label)}
                accessibilityRole={"button"}
                accessibilityState={{ selected: isSelected }}
                className={
                  isSelected
                    ? "bg-primaryColor rounded-full px-4 py-2"
                    : "bg-white border border-borderGreyColor rounded-full px-4 py-2"
                }
              >
                <Label className={isSelected ? "text-white" : "text-mainText"}>
                  {item.label}
                </Label>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={midwives ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View className={"items-center mt-10"}>
            {isLoading ? (
              <ActivityIndicator color={"#0F969C"} />
            ) : isError ? (
              <Pressable onPress={() => refetch()} accessibilityRole={"button"}>
                <Body className={"text-greyColor"}>
                  Couldn&apos;t load midwives.{" "}
                  <Label className={"text-primaryColor"}>Try again</Label>
                </Body>
              </Pressable>
            ) : (
              <>
                <IconBadge name={"search"} size={"lg"} tone={"neutral"} />
                <Body className={"text-greyColor mt-3"}>No midwives match your search</Body>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View className={"bg-white rounded-xl border border-borderGreyColor p-4"}>
            <View className={"flex-row items-center gap-3"}>
              <MidwifeAvatar midwife={item} />
              <View className={"flex-1"}>
                <View className={"flex-row items-center gap-1.5"}>
                  <CardTitle className={"text-mainText"}>{item.display_name}</CardTitle>
                  <VerifiedMark verified={item.verified} />
                </View>
                <Caption className={"text-greyColor mt-0.5"}>
                  {item.years_of_experience} years
                  {item.specialties[0] ? ` · ${item.specialties[0].label}` : ""}
                </Caption>
              </View>
            </View>

            <View className={"flex-row flex-wrap gap-2 mt-3"}>
              {item.consultation_types.map((type) => (
                <View
                  key={type.type}
                  className={"flex-row items-center gap-1.5 bg-[#455A640D] rounded-full px-3 py-1.5"}
                >
                  <Icon name={consultationTypeIcon[type.type]} size={13} color={theme.subText} />
                  <Caption className={"text-subText"}>{type.label}</Caption>
                </View>
              ))}
            </View>

            <View className={"flex-row items-center gap-1.5 mt-3 pt-3 border-t border-borderGreyColor"}>
              <Icon
                name={"clock"}
                size={14}
                color={item.is_available_today ? theme.primaryColor : theme.greyColor}
              />
              <Caption className={item.is_available_today ? "text-primaryColor" : "text-greyColor"}>
                {item.next_available_start
                  ? `Next available ${nextAvailableLabel(item.next_available_start, now)}`
                  : nextAvailableLabel(null, now)}
              </Caption>
            </View>

            <View className={"flex-row gap-3 mt-3"}>
              <Pressable
                onPress={() => handleViewProfile(item.id)}
                accessibilityRole={"button"}
                accessibilityLabel={`View ${item.display_name}'s profile`}
                className={
                  "flex-1 bg-white border-2 border-primaryColor rounded-full py-3 items-center justify-center active:opacity-80"
                }
              >
                <ButtonText className={"text-primaryColor"}>View Profile</ButtonText>
              </Pressable>
              <Pressable
                onPress={() => handleQuickBook(item.id)}
                disabled={!item.next_available_start}
                accessibilityRole={"button"}
                accessibilityLabel={`Book ${item.display_name}`}
                accessibilityState={{ disabled: !item.next_available_start }}
                className={`flex-1 rounded-full py-3 items-center justify-center active:opacity-80 ${
                  item.next_available_start ? "bg-primaryColor" : "bg-borderGreyColor"
                }`}
              >
                <ButtonText className={"text-white"}>Quick Book</ButtonText>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}
