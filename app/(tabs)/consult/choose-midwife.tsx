import { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { midwives } from "@/constants/midwives";

const filters = ["All", "Available Today", "Pregnancy", "Menstrual Health"];

export default function ChooseMidwifePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);

  const filteredMidwives = useMemo(() => {
    return midwives.filter((midwife) => {
      const matchesFilter =
        selectedFilter === "All" || midwife.tags.includes(selectedFilter);
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        query.length === 0 ||
        midwife.name.toLowerCase().includes(query) ||
        midwife.specialty.toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
  }, [searchQuery, selectedFilter]);

  const handleViewProfile = (midwifeId: string) => {
    router.push({
      pathname: "/consult/midwife-profile",
      params: { id: midwifeId },
    });
  };

  const handleQuickBook = (midwifeId: string) => {
    // do nothing - quick book flow not built yet
  };

  return (
    <View className={"bg-white flex-1"}>
      <View className={"flex-row items-start gap-3 px-4 pt-4"}>
        <Pressable
          onPress={() => router.back()}
          className={
            "w-10 h-10 rounded-full border border-borderGreyColor items-center justify-center"
          }
        >
          <Ionicons name={"chevron-back"} size={20} color={"#17252A"} />
        </Pressable>
        <View className={"flex-1 mt-1"}>
          <Text className={"text-mainText text-xl font-bold"}>
            Choose a midwife
          </Text>
          <Text className={"text-greyColor text-sm mt-1"}>
            All midwives are certified professionals
          </Text>
        </View>
      </View>

      <View className={"px-4 mt-4"}>
        <View
          className={
            "flex-row items-center gap-2 bg-[#F5F7F8] rounded-xl px-4 py-3"
          }
        >
          <Ionicons name={"search"} size={18} color={"#72777A"} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={"Search by name or specialty..."}
            placeholderTextColor={"#72777A"}
            className={"flex-1 text-mainText"}
          />
        </View>
      </View>

      <View className={"mt-4"}>
        <FlatList
          horizontal={true}
          data={filters}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          renderItem={({ item }) => {
            const isSelected = item === selectedFilter;
            return (
              <Pressable
                onPress={() => setSelectedFilter(item)}
                className={
                  isSelected
                    ? "bg-primaryColor rounded-full px-4 py-2"
                    : "bg-white border border-borderGreyColor rounded-full px-4 py-2"
                }
              >
                <Text
                  className={
                    isSelected
                      ? "text-white text-sm font-medium"
                      : "text-mainText text-sm font-medium"
                  }
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredMidwives}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View className={"items-center mt-10"}>
            <Text className={"text-greyColor text-sm"}>
              No midwives match your search
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const avatarUri = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${item.name}&size=48&backgroundColor=d1d4f9`;
          const isAvailableToday = item.availability.status === "today";
          return (
            <View
              className={"bg-white rounded-xl border border-borderGreyColor p-4"}
            >
              <View className={"flex-row items-center gap-3"}>
                <View
                  className={"rounded-full overflow-hidden w-12 h-12 bg-[#F5F7F8]"}
                >
                  <Image
                    source={{ uri: avatarUri }}
                    style={{ width: 48, height: 48 }}
                  />
                </View>
                <View className={"flex-1"}>
                  <View className={"flex-row items-center gap-1"}>
                    <Text className={"text-mainText font-semibold"}>
                      {item.name}
                    </Text>
                    <Ionicons
                      name={"checkmark-circle"}
                      size={16}
                      color={"#0F969C"}
                    />
                  </View>
                  <Text className={"text-greyColor text-xs mt-0.5"}>
                    {item.yearsExperience} years · {item.specialty}
                  </Text>
                </View>
              </View>

              <View className={"flex-row items-center justify-between mt-3"}>
                <View className={"flex-row gap-2"}>
                  <View
                    className={
                      "border border-borderGreyColor rounded-full px-3 py-1.5"
                    }
                  >
                    <Text className={"text-mainText text-xs font-medium"}>
                      Chat
                    </Text>
                  </View>
                  <View
                    className={
                      "border border-borderGreyColor rounded-full px-3 py-1.5"
                    }
                  >
                    <Text className={"text-mainText text-xs font-medium"}>
                      Audio
                    </Text>
                  </View>
                </View>
                <View className={"flex-row items-center gap-1.5"}>
                  <View
                    className={
                      isAvailableToday
                        ? "w-2 h-2 rounded-full bg-[#2FA84F]"
                        : "w-2 h-2 rounded-full bg-[#E8A72A]"
                    }
                  />
                  <Text className={"text-greyColor text-xs"}>
                    {item.availability.label}
                  </Text>
                </View>
              </View>

              <View className={"flex-row gap-3 mt-3"}>
                <Pressable
                  onPress={() => handleViewProfile(item.id)}
                  className={
                    "flex-1 bg-white border-2 border-primaryColor rounded-full py-3 items-center justify-center active:opacity-80"
                  }
                >
                  <Text className={"text-primaryColor font-semibold text-sm"}>
                    View Profile
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleQuickBook(item.id)}
                  className={
                    "flex-1 bg-primaryColor rounded-full py-3 items-center justify-center active:opacity-80"
                  }
                >
                  <Text className={"text-white font-semibold text-sm"}>
                    Quick Book
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
