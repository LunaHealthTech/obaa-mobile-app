import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { RadialBackground } from "@/components/RadialBackground";
import { AppHeader } from "@/components/AppHeader";
import {
  Body,
  ButtonText,
  CardTitle,
  Caption,
  Label,
  PageTitle,
  SectionHeading,
} from "@/components/Typography";

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

  const handleBookConsultation = () => {
    router.push("/consult/booking-method");
  };

  const handleViewAllConsultations = () => {
    // do nothing - consultation history not built yet
  };

  return (
    <ScrollView className={"bg-white flex-1"}>
      <AppHeader />

      <View className={"px-4 mt-2"}>
        <Text
          className={
            "text-primaryColor text-xs font-sans-semibold tracking-widest uppercase"
          }
        >
          Obaa + Consult
        </Text>
        <PageTitle className={"text-mainText mt-1"}>
          Need Help Today?
        </PageTitle>
        <Body className={"text-greyColor mt-2"}>
          Talk to a certified midwife for trusted maternal and reproductive
          healthcare support
        </Body>
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
            <SectionHeading className={"text-white"}>
              Talk To a Certified Midwife
            </SectionHeading>
            <Body className={"text-[#CCDDE0] mt-1"}>
              Get support for pregnancy, menstrual health, symptoms,
              emotional wellbeing and more.
            </Body>
          </View>
          <Pressable
            onPress={handleBookConsultation}
            className={
              "bg-white rounded-full py-3 items-center justify-center mt-4 active:opacity-80"
            }
          >
            <ButtonText className={"text-primaryColor"}>
              Book a Consultation
            </ButtonText>
          </Pressable>
        </View>
      </View>

      <View className={"px-4 mt-6"}>
        <SectionHeading className={"text-mainText mb-3"}>
          What We Help With
        </SectionHeading>
        <View className={"flex-row flex-wrap gap-2"}>
          {helpTopics.map((topic) => (
            <View key={topic} className={"bg-[#0F969C1A] rounded-full px-4 py-2"}>
              <Label className={"text-primaryColor"}>
                {topic}
              </Label>
            </View>
          ))}
        </View>
      </View>

      <View className={"px-4 mt-6"}>
        <SectionHeading className={"text-mainText mb-3"}>
          How it works
        </SectionHeading>
        <View className={"gap-4"}>
          {steps.map((step, index) => (
            <View key={step.title} className={"flex-row gap-3"}>
              <View
                className={
                  "w-8 h-8 rounded-full border border-primaryColor bg-[#0F969C1A] items-center justify-center"
                }
              >
                <Label className={"text-primaryColor"}>
                  {index + 1}
                </Label>
              </View>
              <View className={"flex-1"}>
                <CardTitle className={"text-mainText"}>
                  {step.title}
                </CardTitle>
                <Body className={"text-greyColor mt-0.5"}>
                  {step.description}
                </Body>
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
          <Caption className={"text-mainText text-center mt-2"}>
            Verified Professionals
          </Caption>
        </View>
        <View className={"items-center w-[100px]"}>
          <View
            className={
              "bg-[#0F969C1A] w-14 h-14 rounded-full items-center justify-center"
            }
          >
            <FontAwesome name={"lock"} size={20} color={"#0F969C"} />
          </View>
          <Caption className={"text-mainText text-center mt-2"}>
            Private & Secure
          </Caption>
        </View>
        <View className={"items-center w-[100px]"}>
          <View
            className={
              "bg-[#0F969C1A] w-14 h-14 rounded-full items-center justify-center"
            }
          >
            <FontAwesome name={"calendar"} size={20} color={"#0F969C"} />
          </View>
          <Caption className={"text-mainText text-center mt-2"}>
            Flexible Scheduling
          </Caption>
        </View>
      </View>

      <View className={"px-4 mt-8"}>
        <View className={"flex-row justify-between items-center mb-3"}>
          <SectionHeading className={"text-mainText"}>
            My Consultations
          </SectionHeading>
          <Pressable onPress={handleViewAllConsultations}>
            <Label className={"text-primaryColor"}>
              View all
            </Label>
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
          <CardTitle className={"text-mainText"}>
            No consultations yet
          </CardTitle>
          <Body className={"text-greyColor text-center mt-1"}>
            When you schedule a consultation, it&apos;ll appear here
          </Body>
          <Pressable onPress={handleBookConsultation} className={"mt-3"}>
            <Label className={"text-primaryColor"}>
              Book your first consultation
            </Label>
          </Pressable>
        </View>
      </View>

      <View className={"h-10"} />
    </ScrollView>
  );
}
