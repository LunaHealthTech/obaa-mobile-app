import { useEffect, useRef, useState } from "react";
import { View, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { format, parseISO } from "date-fns";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { midwives } from "@/constants/midwives";
import {
  Body,
  ButtonText,
  CardTitle,
  Caption,
  Label,
  PageTitle,
  SectionHeading,
} from "@/components/Typography";

const CONSULTATION_TYPE_LABELS: Record<string, string> = {
  chat: "Chat Consultation",
  audio: "Audio Call",
  video: "Video Call",
};

// Placeholder flat fee — replace once a real PSP and pricing model are integrated.
const CONSULTATION_FEE = "GHS 150.00";

const paymentMethods = [
  { key: "momo", label: "Mobile Money", icon: "phone" as const },
  { key: "card", label: "Debit / Credit Card", icon: "credit-card" as const },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { topic, consultationType, date, time, midwifeId } =
    useLocalSearchParams<{
      topic: string;
      consultationType: string;
      date: string;
      time: string;
      midwifeId: string;
    }>();

  const midwife = midwives.find((item) => item.id === midwifeId) ?? midwives[0];
  const avatarUri = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${midwife.name}&size=48&backgroundColor=d1d4f9`;
  const typeLabel = CONSULTATION_TYPE_LABELS[consultationType] ?? "Consultation";
  const formattedDate = date ? format(parseISO(date), "EEEE, d MMMM yyyy") : "";

  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].key);
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handlePayNow = () => {
    setIsProcessing(true);
    // Simulated payment call — replace with the real PSP charge once integrated.
    timeoutRef.current = setTimeout(() => {
      router.replace({
        pathname: "/consult/booking-confirmation",
        params: { topic, consultationType, date, time, midwifeId },
      });
    }, 1200);
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
          disabled={isProcessing}
          className={
            "w-10 h-10 rounded-full border border-borderGreyColor items-center justify-center"
          }
        >
          <Ionicons name={"chevron-back"} size={20} color={"#17252A"} />
        </Pressable>
        <PageTitle className={"text-mainText"}>Checkout</PageTitle>
      </View>

      <ScrollView className={"flex-1"}>
        <View className={"px-4 mt-6"}>
          <SectionHeading className={"text-mainText mb-3"}>
            Appointment Summary
          </SectionHeading>
          <View
            className={
              "bg-white rounded-xl border border-borderGreyColor p-4"
            }
          >
            <View className={"flex-row items-center gap-3"}>
              <View
                className={
                  "rounded-full overflow-hidden w-12 h-12 bg-[#0F969C1A]"
                }
              >
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: 48, height: 48 }}
                />
              </View>
              <View>
                <View className={"flex-row items-center gap-1.5"}>
                  <CardTitle className={"text-mainText"}>
                    {midwife.name}
                  </CardTitle>
                  <Ionicons
                    name={"checkmark-circle"}
                    size={16}
                    color={"#0F969C"}
                  />
                </View>
                <Caption className={"text-greyColor mt-0.5"}>
                  {midwife.role}
                </Caption>
              </View>
            </View>

            <View className={"mt-4 pt-4 border-t border-borderGreyColor gap-3"}>
              <View className={"flex-row items-center justify-between"}>
                <Body className={"text-greyColor"}>Date</Body>
                <Label className={"text-mainText"}>
                  {formattedDate}
                </Label>
              </View>
              <View className={"flex-row items-center justify-between"}>
                <Body className={"text-greyColor"}>Time</Body>
                <Label className={"text-mainText"}>
                  {time}
                </Label>
              </View>
              <View className={"flex-row items-center justify-between"}>
                <Body className={"text-greyColor"}>Type</Body>
                <Label className={"text-mainText"}>
                  {typeLabel}
                </Label>
              </View>
              {!!topic && (
                <View className={"flex-row items-center justify-between"}>
                  <Body className={"text-greyColor"}>Support Topic</Body>
                  <Label className={"text-mainText"}>
                    {topic}
                  </Label>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className={"px-4 mt-6"}>
          <SectionHeading className={"text-mainText mb-3"}>
            Payment Method
          </SectionHeading>
          <View className={"gap-3"}>
            {paymentMethods.map((method) => {
              const isSelected = method.key === selectedMethod;
              return (
                <Pressable
                  key={method.key}
                  onPress={() => setSelectedMethod(method.key)}
                  className={
                    isSelected
                      ? "flex-row items-center gap-3 bg-[#0F969C1A] border-2 border-primaryColor rounded-xl px-4 py-4"
                      : "flex-row items-center gap-3 bg-white border border-borderGreyColor rounded-xl px-4 py-4"
                  }
                >
                  <FontAwesome
                    name={method.icon}
                    size={18}
                    color={isSelected ? "#0F969C" : "#72777A"}
                  />
                  <Label
                    className={
                      isSelected ? "flex-1 text-primaryColor" : "flex-1 text-mainText"
                    }
                  >
                    {method.label}
                  </Label>
                  <Ionicons
                    name={isSelected ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={isSelected ? "#0F969C" : "#DADADA"}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className={"px-4 mt-6"}>
          <View
            className={
              "flex-row items-center justify-between bg-[#F5F7F8] rounded-xl px-4 py-4"
            }
          >
            <Label className={"text-mainText"}>
              Consultation Fee
            </Label>
            <CardTitle className={"text-mainText"}>
              {CONSULTATION_FEE}
            </CardTitle>
          </View>
        </View>

        <View className={"h-6"} />
      </ScrollView>

      <View className={"px-4 py-4 border-t border-borderGreyColor"}>
        <Pressable
          onPress={handlePayNow}
          disabled={isProcessing}
          className={
            "bg-primaryColor rounded-full py-4 flex-row items-center justify-center gap-2 active:opacity-80"
          }
          style={isProcessing ? { opacity: 0.7 } : undefined}
        >
          {isProcessing && <ActivityIndicator color={"#fff"} size={"small"} />}
          <ButtonText className={"text-white"}>
            {isProcessing ? "Processing..." : `Pay ${CONSULTATION_FEE}`}
          </ButtonText>
        </Pressable>
      </View>
    </View>
  );
}
