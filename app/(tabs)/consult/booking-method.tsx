import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const matchBenefits = ["Faster booking", "Less searching", "Best available match"];

export default function BookingMethodPage() {
  const router = useRouter();

  const handleMatchMe = () => {
    router.push("/consult/match-preferences");
  };

  const handleChooseMidwife = () => {
    router.push("/consult/choose-midwife");
  };

  return (
    <ScrollView className={"bg-white flex-1"}>
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
            How would you like to book?
          </Text>
          <Text className={"text-greyColor text-sm mt-1"}>
            Choose how you&apos;d prefer to connect with your midwife
          </Text>
        </View>
      </View>

      <View
        className={
          "mx-4 mt-6 rounded-2xl border-2 border-primaryColor p-4"
        }
      >
        <View className={"flex-row items-start justify-between"}>
          <View
            className={
              "bg-[#0F969C1A] rounded-xl w-12 h-12 items-center justify-center"
            }
          >
            <FontAwesome name={"random"} size={20} color={"#0F969C"} />
          </View>
          <View className={"bg-primaryColor rounded-full px-3 py-1"}>
            <Text className={"text-white text-xs font-semibold"}>
              Recommended
            </Text>
          </View>
        </View>
        <Text className={"text-mainText text-lg font-bold mt-3"}>
          Let Obaa+ Match You
        </Text>
        <Text className={"text-greyColor text-sm mt-1"}>
          Tell us your preferred date, time and consultation type and
          we&apos;ll match you with the best available certified midwife.
        </Text>
        <View className={"mt-3 gap-2"}>
          {matchBenefits.map((benefit) => (
            <View key={benefit} className={"flex-row items-center gap-2"}>
              <FontAwesome name={"check-circle"} size={16} color={"#0F969C"} />
              <Text className={"text-mainText text-sm"}>{benefit}</Text>
            </View>
          ))}
        </View>
        <Pressable
          onPress={handleMatchMe}
          className={
            "bg-primaryColor rounded-full py-4 items-center justify-center mt-4 active:opacity-80"
          }
        >
          <Text className={"text-white font-semibold"}>Continue</Text>
        </Pressable>
      </View>

      <View
        className={
          "mx-4 mt-4 rounded-2xl border border-borderGreyColor p-4"
        }
      >
        <View
          className={
            "bg-[#F5F7F8] rounded-xl w-12 h-12 items-center justify-center"
          }
        >
          <FontAwesome name={"id-card-o"} size={20} color={"#455A64"} />
        </View>
        <Text className={"text-mainText text-lg font-bold mt-3"}>
          Choose a Midwife Yourself
        </Text>
        <Text className={"text-greyColor text-sm mt-1"}>
          Browse certified midwives and choose who you&apos;d like to consult
          with directly
        </Text>
        <Pressable
          onPress={handleChooseMidwife}
          className={
            "bg-white border-2 border-primaryColor rounded-full py-4 items-center justify-center mt-4 active:opacity-80"
          }
        >
          <Text className={"text-primaryColor font-semibold"}>Continue</Text>
        </Pressable>
      </View>

      <View className={"h-10"} />
    </ScrollView>
  );
}
