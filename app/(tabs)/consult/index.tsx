import { View, Text, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuthStore } from "@/repositories/useAuthStore";
import { RadialBackground } from "@/components/RadialBackground";
import CalendarIcon from "@/assets/icons/topCalendarIcon.svg";
import NotificationsIcon from "@/assets/icons/notificationIcon.svg";

const notificationCount = 5;

const helpTopics = [
  "Pregnancy Questions",
  "Missed Period",
  "Menstrual Concerns",
  "Teen Health",
  "Symptoms",
  "Emotional Support",
];

const steps = [
  {
    title: "Book a consultation",
    description: "Choose how and when you'd like to connect.",
  },
  {
    title: "Speak with a midwife",
    description: "Talk via chat, audio or video with a certified professional.",
  },
  {
    title: "Receive guidance",
    description: "Get personalized advice and follow-up support.",
  },
];

export default function ConsultPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const avatarUri = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${user?.first_name}&size=24&backgroundColor=d1d4f9`;

  const handleBookConsultation = () => {
    router.push("/consult/booking-method");
  };

  const handleViewAllConsultations = () => {
    // do nothing - consultation history not built yet
  };

  return (
    <ScrollView className={"bg-white flex-1"}>
      <View
        className={"flex-row items-center justify-between px-4 pt-4 pb-2"}
      >
        <View className={"flex-row items-center gap-3"}>
          <View
            className={"rounded-full overflow-hidden w-[50px] h-[50px]"}
          >
            <Image
              source={{ uri: avatarUri }}
              style={{ width: 50, height: 50 }}
            />
          </View>
          <View>
            <Text className={"text-greyColor text-sm"}>Welcome back</Text>
            <Text className={"text-mainText text-lg font-semibold"}>
              {user?.first_name}
            </Text>
          </View>
        </View>
        <View className={"flex-row gap-2"}>
          <Pressable
            className={
              "border-2 border-borderGreyColor w-[44px] h-[44px] rounded-full items-center justify-center"
            }
          >
            <CalendarIcon width={18} height={18} color={"#3A3A3A"} />
          </Pressable>
          <Pressable
            className={
              "border-2 border-borderGreyColor w-[44px] h-[44px] rounded-full items-center justify-center relative"
            }
          >
            <NotificationsIcon width={18} height={18} />
            <View
              className={
                "absolute -top-1 -right-1 bg-[#E82A73] rounded-full w-[18px] h-[18px] items-center justify-center"
              }
            >
              <Text className={"text-white text-[10px] font-bold"}>
                {notificationCount}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View className={"px-4 mt-2"}>
        <Text
          className={
            "text-primaryColor text-xs font-semibold tracking-widest uppercase"
          }
        >
          Obaa + Consult
        </Text>
        <Text className={"text-mainText text-2xl font-bold mt-1"}>
          Need Help Today?
        </Text>
        <Text className={"text-greyColor text-sm mt-2"}>
          Talk to a certified midwife for trusted maternal and reproductive
          healthcare support
        </Text>
      </View>

      <View
        className={"mx-4 mt-5 rounded-2xl overflow-hidden relative h-[210px]"}
      >
        <RadialBackground colors={["#0FCAD2CC", "#015364"]} />
        <View className={"p-5 flex-1 justify-between"}>
          <View
            className={
              "bg-[rgba(255,255,255,0.2)] w-12 h-12 rounded-full items-center justify-center"
            }
          >
            <FontAwesome name={"user-md"} size={22} color={"#fff"} />
          </View>
          <View className={"mt-3"}>
            <Text className={"text-white text-lg font-semibold"}>
              Talk To a Certified Midwife
            </Text>
            <Text className={"text-[#CCDDE0] text-sm mt-1"}>
              Get support for pregnancy, menstrual health, symptoms,
              emotional wellbeing and more.
            </Text>
          </View>
          <Pressable
            onPress={handleBookConsultation}
            className={
              "bg-white rounded-full py-3 items-center justify-center mt-4 active:opacity-80"
            }
          >
            <Text className={"text-primaryColor font-semibold"}>
              Book a Consultation
            </Text>
          </Pressable>
        </View>
      </View>

      <View className={"px-4 mt-6"}>
        <Text className={"text-mainText font-semibold text-lg mb-3"}>
          What We Help With
        </Text>
        <View className={"flex-row flex-wrap gap-2"}>
          {helpTopics.map((topic) => (
            <View key={topic} className={"bg-[#0F969C1A] rounded-full px-4 py-2"}>
              <Text className={"text-primaryColor text-sm font-medium"}>
                {topic}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={"px-4 mt-6"}>
        <Text className={"text-mainText font-semibold text-lg mb-3"}>
          How it works
        </Text>
        <View className={"gap-4"}>
          {steps.map((step, index) => (
            <View key={step.title} className={"flex-row gap-3"}>
              <View
                className={
                  "w-8 h-8 rounded-full border border-primaryColor bg-[#0F969C1A] items-center justify-center"
                }
              >
                <Text className={"text-primaryColor font-semibold"}>
                  {index + 1}
                </Text>
              </View>
              <View className={"flex-1"}>
                <Text className={"text-mainText font-semibold"}>
                  {step.title}
                </Text>
                <Text className={"text-greyColor text-sm mt-0.5"}>
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={"px-4 mt-6 flex-row justify-between"}>
        <View className={"items-center w-[100px]"}>
          <View
            className={
              "bg-[#0F969C1A] w-14 h-14 rounded-full items-center justify-center"
            }
          >
            <FontAwesome name={"check-circle"} size={20} color={"#0F969C"} />
          </View>
          <Text className={"text-mainText text-xs text-center mt-2"}>
            Verified Professionals
          </Text>
        </View>
        <View className={"items-center w-[100px]"}>
          <View
            className={
              "bg-[#0F969C1A] w-14 h-14 rounded-full items-center justify-center"
            }
          >
            <FontAwesome name={"lock"} size={20} color={"#0F969C"} />
          </View>
          <Text className={"text-mainText text-xs text-center mt-2"}>
            Private & Secure
          </Text>
        </View>
        <View className={"items-center w-[100px]"}>
          <View
            className={
              "bg-[#0F969C1A] w-14 h-14 rounded-full items-center justify-center"
            }
          >
            <FontAwesome name={"calendar"} size={20} color={"#0F969C"} />
          </View>
          <Text className={"text-mainText text-xs text-center mt-2"}>
            Flexible Scheduling
          </Text>
        </View>
      </View>

      <View className={"px-4 mt-8"}>
        <View className={"flex-row justify-between items-center mb-3"}>
          <Text className={"text-mainText font-semibold text-lg"}>
            My Consultations
          </Text>
          <Pressable onPress={handleViewAllConsultations}>
            <Text className={"text-primaryColor font-semibold"}>
              View all
            </Text>
          </Pressable>
        </View>
        <View className={"bg-[#F5F7F8] rounded-xl p-6 items-center"}>
          <View
            className={
              "bg-[#0F969C1A] w-16 h-16 rounded-full items-center justify-center mb-3"
            }
          >
            <FontAwesome name={"calendar"} size={24} color={"#0F969C"} />
          </View>
          <Text className={"text-mainText font-semibold"}>
            No consultations yet
          </Text>
          <Text className={"text-greyColor text-sm text-center mt-1"}>
            When you schedule a consultation, it&apos;ll appear here
          </Text>
          <Pressable onPress={handleBookConsultation} className={"mt-3"}>
            <Text className={"text-primaryColor font-semibold"}>
              Book your first consultation
            </Text>
          </Pressable>
        </View>
      </View>

      <View className={"h-10"} />
    </ScrollView>
  );
}
