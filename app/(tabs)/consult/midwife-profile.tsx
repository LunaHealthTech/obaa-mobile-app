import { View, Text, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { midwives } from "@/constants/midwives";

export default function MidwifeProfilePage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const midwife = midwives.find((item) => item.id === id) ?? midwives[0];
  const avatarUri = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${midwife.name}&size=64&backgroundColor=d1d4f9`;

  const handleBookAppointment = () => {
    // do nothing - booking confirmation flow not built yet
  };

  return (
    <View className={"bg-white flex-1"}>
      <View
        className={
          "flex-row items-center gap-3 px-4 pt-4 pb-4 border-b border-borderGreyColor"
        }
      >
        <Pressable
          onPress={() => router.back()}
          className={
            "w-10 h-10 rounded-full border border-borderGreyColor items-center justify-center"
          }
        >
          <Ionicons name={"chevron-back"} size={20} color={"#17252A"} />
        </Pressable>
        <Text className={"text-mainText text-lg font-bold"}>
          Midwife Profile
        </Text>
      </View>

      <ScrollView className={"flex-1"}>
        <View className={"flex-row items-center gap-4 px-4 pt-5"}>
          <View
            className={"rounded-xl overflow-hidden w-16 h-16 bg-[#0F969C1A]"}
          >
            <Image
              source={{ uri: avatarUri }}
              style={{ width: 64, height: 64 }}
            />
          </View>
          <View>
            <View className={"flex-row items-center gap-1.5"}>
              <Text className={"text-mainText text-lg font-bold"}>
                {midwife.name}
              </Text>
              <Ionicons name={"checkmark-circle"} size={18} color={"#0F969C"} />
            </View>
            <Text className={"text-greyColor text-sm mt-0.5"}>
              {midwife.role}
            </Text>
          </View>
        </View>

        <View
          className={
            "flex-row items-center justify-between mx-4 mt-5 pt-4 border-t border-borderGreyColor"
          }
        >
          <View className={"items-center flex-1"}>
            <Text className={"text-primaryColor text-lg font-bold"}>
              {midwife.yearsExperience} Yrs
            </Text>
            <Text className={"text-greyColor text-xs mt-0.5"}>Experience</Text>
          </View>
          <View className={"w-px h-8 bg-borderGreyColor"} />
          <View className={"items-center flex-1"}>
            <Text className={"text-primaryColor text-lg font-bold"}>
              {midwife.consultationsCount}+
            </Text>
            <Text className={"text-greyColor text-xs mt-0.5"}>
              Consultations
            </Text>
          </View>
          <View className={"w-px h-8 bg-borderGreyColor"} />
          <View className={"items-center flex-1"}>
            <Text className={"text-primaryColor text-lg font-bold"}>
              {midwife.satisfactionRate}%
            </Text>
            <Text className={"text-greyColor text-xs mt-0.5"}>
              Satisfaction
            </Text>
          </View>
        </View>

        <View className={"px-4 mt-6"}>
          <Text className={"text-mainText text-lg font-bold mb-2"}>
            About
          </Text>
          <Text className={"text-greyColor text-sm leading-5"}>
            {midwife.about}
          </Text>
        </View>

        <View className={"px-4 mt-6"}>
          <Text className={"text-mainText text-lg font-bold mb-3"}>
            Area of Expertise
          </Text>
          <View className={"flex-row flex-wrap gap-2"}>
            {midwife.expertise.map((item) => (
              <View key={item} className={"bg-[#0F969C1A] rounded-full px-4 py-2"}>
                <Text className={"text-primaryColor text-sm font-medium"}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className={"px-4 mt-6"}>
          <Text className={"text-mainText text-lg font-bold mb-3"}>
            Languages
          </Text>
          <View className={"flex-row flex-wrap gap-2"}>
            {midwife.languages.map((language) => (
              <View
                key={language}
                className={"border border-borderGreyColor rounded-full px-4 py-2"}
              >
                <Text className={"text-mainText text-sm font-medium"}>
                  {language}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className={"px-4 mt-6"}>
          <Text className={"text-mainText text-lg font-bold mb-3"}>
            Education &amp; Certification
          </Text>
          <View className={"flex-row items-start gap-2"}>
            <View className={"w-1.5 h-1.5 rounded-full bg-primaryColor mt-2"} />
            <Text className={"text-mainText text-sm flex-1"}>
              {midwife.education}
            </Text>
          </View>
        </View>

        <View className={"px-4 mt-6"}>
          <Text className={"text-mainText text-lg font-bold mb-3"}>
            Available Consultation Types
          </Text>
          <View className={"gap-3"}>
            {midwife.consultationTypes.map((type, index) => (
              <View
                key={type.key}
                className={
                  index === 0
                    ? "flex-row items-center gap-3 bg-[#0F969C1A] rounded-xl px-4 py-3"
                    : "flex-row items-center gap-3 bg-[#F5F7F8] rounded-xl px-4 py-3"
                }
              >
                <Ionicons
                  name={type.key === "chat" ? "chatbubble-outline" : "call-outline"}
                  size={20}
                  color={"#455A64"}
                />
                <View>
                  <Text className={"text-mainText font-semibold text-sm"}>
                    {type.label}
                  </Text>
                  <Text className={"text-greyColor text-xs mt-0.5"}>
                    {type.duration}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={"h-6"} />
      </ScrollView>

      <View className={"px-4 py-4 border-t border-borderGreyColor"}>
        <Pressable
          onPress={handleBookAppointment}
          className={
            "bg-primaryColor rounded-full py-4 items-center justify-center active:opacity-80"
          }
        >
          <Text className={"text-white font-semibold"}>Book Appointment</Text>
        </Pressable>
      </View>
    </View>
  );
}
