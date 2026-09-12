import {
  View,
  Pressable,
  FlatList,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useAuthStore } from "@/repositories/useAuthStore";
import { Link } from "expo-router";
import CalendarIcon from "@/assets/icons/topCalendarIcon.svg";
import NotificationsIcon from "@/assets/icons/notificationIcon.svg";
import PinkFlowerIcon from "@/assets/icons/flowers-1.svg";
import DrippingBloodIcon from "@/assets/icons/drippingBlood.svg";
import ClockIcon from "@/assets/icons/clock.svg";
import SyncIcon from "@/assets/icons/sync.svg";
import PregnancyIcon from "@/assets/icons/pregnancy.svg";
import { flowers } from "@/constants/assets";
import { StatusBar } from "expo-status-bar";
import { MenstrualInfoCard } from "@/components/MenstrualInfoCard";
import { ShareCard } from "@/components/ShareCard";
import { useMenstrualProfileViewModel } from "@/viewmodel/useMenstrualProfile";
import { EmotionCard } from "@/components/EmotionCard";
import ScrollView = Animated.ScrollView;
import { EmoticonData } from "@/types/emotion.types";
import { useState } from "react";
import { SentimentCard } from "@/components/SentimentCard";
import { ArticleCardSM } from "@/components/ArticleCardSM";
import { AppHeader } from "@/components/AppHeader";
import { Body, CardTitle, Label, SectionHeading } from "@/components/Typography";

const emoticonData: EmoticonData[] = [
  { emoji: "😊", name: "happy" },
  { emoji: "😔", name: "sad" },
  { emoji: "😌", name: "calm" },
  { emoji: "😡 ", name: "irritated" },
  { emoji: "😰", name: "anxious" },
];

export default function HomePage() {
  const logout = useAuthStore((state) => state.logout);
  const [showShareSentiment, setShowShareSentiment] = useState<boolean>(false);
  const [currentSentiment, setCurrentSentiment] = useState<EmoticonData>(
    emoticonData[0],
  );
  const { data, isLoading, error, isError } = useMenstrualProfileViewModel();
  console.log({ data, isLoading, error, isError });

  const handleShareClick = () => {
    // do nothing
  };

  const handleSentimentClick = (capturedEmotion: EmoticonData) => {
    setShowShareSentiment(!showShareSentiment);
    setCurrentSentiment(capturedEmotion);
  };

  if (isLoading) {
    return (
      <View>
        <Body>Loading</Body>
      </View>
    );
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <View className={"bg-white"}>
          <StatusBar style={"dark"} />
          <AppHeader />
          <View className={"px-4"}>
            <View className={"flex flex-row gap-3 items-center my-5"}>
              <CalendarIcon width={25} height={25} color={"#3A3A3A"} />
              <CardTitle>September 2026</CardTitle>
              <Image source={flowers} width={25} height={25} />
            </View>

            {/*  Today's update */}
            <View>
              <View className={"flex flex-row justify-between items-center"}>
                <SectionHeading>Today&apos;s Update</SectionHeading>
                <PinkFlowerIcon width={55} height={55} />
              </View>
              {/*    Cards go here */}
              <MenstrualInfoCard
                text={`You are currently ${data?.general?.status}`}
                subText={`Period started ${data?.general?.yourPeriodStarted}`}
              >
                <DrippingBloodIcon width={25} height={25} />
              </MenstrualInfoCard>
              <MenstrualInfoCard
                text={`Period Length: ${data?.general?.periodLength} ${data?.general?.periodLength > 1 ? "days" : "day"}`}
                subText={"Normal"}
              >
                <ClockIcon width={25} height={25} />
              </MenstrualInfoCard>

              <MenstrualInfoCard
                text={`Cycle Length: ${data?.general?.cycleLength} ${data?.general?.cycleLength > 1 ? "days" : "day"}`}
                subText={"Normal"}
              >
                <SyncIcon width={25} height={25} />
              </MenstrualInfoCard>
              <MenstrualInfoCard
                text={"Pregnancy"}
                subText={`${data?.general?.pregnancyProbability}`}
              >
                <PregnancyIcon width={25} height={25} />
              </MenstrualInfoCard>
            </View>

            <View className={"mt-5"}>
              <ShareCard handleClick={handleShareClick} />
            </View>

            {/*How do you feel today*/}
            <View className={"mt-5"}>
              <SectionHeading className={"mb-3"}>How do you feel today?</SectionHeading>
              <View className={"flex flex-1"}>
                {!showShareSentiment ? (
                  <FlatList
                    data={emoticonData}
                    horizontal={true}
                    keyExtractor={(item) => item.name}
                    contentContainerStyle={{
                      gap: 10,
                    }}
                    renderItem={({ item }) => (
                      <EmotionCard
                        emotion={item}
                        onPress={handleSentimentClick}
                      />
                    )}
                  />
                ) : (
                  <SentimentCard sentiment={currentSentiment} />
                )}
              </View>
            </View>

            {/* Article */}
            <View className={"mt-5"}>
              <SectionHeading className={"mb-3"}>How do you feel today?</SectionHeading>
              <View className={"flex flex-1"}>
                <FlatList
                  horizontal={true}
                  contentContainerStyle={{
                    gap: 10,
                  }}
                  data={["som", "an", "tow", "son"]}
                  keyExtractor={(item) => item}
                  renderItem={(article) => <ArticleCardSM />}
                />
              </View>
            </View>
            <Pressable onPress={() => logout()}>
              <Label>Logout</Label>
            </Pressable>
            <Link href={"/onboarding/persona"}>Onboarding</Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
