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
import { CtaBanner } from "@/components/CtaBanner";
import { useMenstrualProfileViewModel } from "@/viewmodel/useMenstrualProfile";
import { EmotionCard } from "@/components/EmotionCard";
import ScrollView = Animated.ScrollView;
import { EmoticonData } from "@/types/emotion.types";
import { useState } from "react";
import { SentimentCard } from "@/components/SentimentCard";
import { ArticleCardSM } from "@/components/ArticleCardSM";
import { AppHeader } from "@/components/AppHeader";
import { Body, CardTitle, Label, SectionHeading } from "@/components/Typography";
import { NotificationCard } from "@/components/NotificationCard";
import { useNotifications } from "@/viewmodel/useNotifications";
import { useArticleFeed } from "@/viewmodel/useContent";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/constants/theme";

const HOME_ARTICLE_COUNT = 6;

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
  const { newestUnreadUrgent, readNotification, openNotificationCta } =
    useNotifications();
  const articles = useArticleFeed({}).articles.slice(0, HOME_ARTICLE_COUNT);
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

            {newestUnreadUrgent && (
              <View className={"mb-5"}>
                <NotificationCard
                  notification={newestUnreadUrgent}
                  expanded={true}
                  onBook={() => openNotificationCta(newestUnreadUrgent)}
                  onDismiss={() => readNotification(newestUnreadUrgent)}
                />
              </View>
            )}

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
              <CtaBanner
                eyebrow={"Share the Love"}
                body={"Know someone who\u2019d love a midwife-in-their-pocket?"}
                actionLabel={"Share App"}
                onPress={handleShareClick}
              />
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

            {articles.length > 0 && (
              <View className={"mt-5"}>
                <View className={"flex flex-row justify-between items-center mb-3"}>
                  <SectionHeading>Articles</SectionHeading>
                  <Link href={"/articles"}>
                    <Label className={"text-primaryColor"}>See all</Label>
                  </Link>
                </View>
                <View className={"flex flex-1"}>
                  <FlatList
                    horizontal={true}
                    contentContainerStyle={{
                      gap: 10,
                    }}
                    data={articles}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ArticleCardSM article={item} />}
                  />
                </View>
              </View>
            )}

            <Link href={"/events"} asChild>
              <Pressable
                accessibilityRole={"link"}
                className={
                  "mt-5 flex flex-row items-center gap-3 bg-white rounded-xl border border-borderGreyColor p-3 active:opacity-80"
                }
              >
                <View
                  className={
                    "bg-[#0F969C1A] w-10 h-10 rounded-full items-center justify-center"
                  }
                >
                  <Ionicons name={"calendar-outline"} size={20} color={theme.primaryColor} />
                </View>
                <View className={"flex-1"}>
                  <CardTitle className={"text-mainText"}>Events</CardTitle>
                  <Body className={"text-greyColor"}>Midwife-led sessions and talks</Body>
                </View>
                <Ionicons name={"chevron-forward"} size={18} color={theme.greyColor} />
              </Pressable>
            </Link>
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
