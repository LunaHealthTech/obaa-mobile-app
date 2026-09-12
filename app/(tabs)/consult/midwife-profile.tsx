import { View, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { midwives } from "@/constants/midwives";
import {
  Body,
  ButtonText,
  Caption,
  Label,
  PageTitle,
  SectionHeading,
} from "@/components/Typography";

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
        <PageTitle className={"text-mainText"}>
          Midwife Profile
        </PageTitle>
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
              <PageTitle className={"text-mainText"}>
                {midwife.name}
              </PageTitle>
              <Ionicons name={"checkmark-circle"} size={18} color={"#0F969C"} />
            </View>
            <Body className={"text-greyColor mt-0.5"}>
              {midwife.role}
            </Body>
          </View>
        </View>

        <View
          className={
            "flex-row items-center justify-between mx-4 mt-5 pt-4 border-t border-borderGreyColor"
          }
        >
          <View className={"items-center flex-1"}>
            <PageTitle className={"text-primaryColor"}>
              {midwife.yearsExperience} Yrs
            </PageTitle>
            <Caption className={"text-greyColor mt-0.5"}>Experience</Caption>
          </View>
          <View className={"w-px h-8 bg-borderGreyColor"} />
          <View className={"items-center flex-1"}>
            <PageTitle className={"text-primaryColor"}>
              {midwife.consultationsCount}+
            </PageTitle>
            <Caption className={"text-greyColor mt-0.5"}>
              Consultations
            </Caption>
          </View>
          <View className={"w-px h-8 bg-borderGreyColor"} />
          <View className={"items-center flex-1"}>
            <PageTitle className={"text-primaryColor"}>
              {midwife.satisfactionRate}%
            </PageTitle>
            <Caption className={"text-greyColor mt-0.5"}>
              Satisfaction
            </Caption>
          </View>
        </View>

        <View className={"px-4 mt-6"}>
          <SectionHeading className={"text-mainText mb-2"}>
            About
          </SectionHeading>
          <Body className={"text-greyColor leading-5"}>
            {midwife.about}
          </Body>
        </View>

        <View className={"px-4 mt-6"}>
          <SectionHeading className={"text-mainText mb-3"}>
            Area of Expertise
          </SectionHeading>
          <View className={"flex-row flex-wrap gap-2"}>
            {midwife.expertise.map((item) => (
              <View key={item} className={"bg-[#0F969C1A] rounded-full px-4 py-2"}>
                <Label className={"text-primaryColor"}>
                  {item}
                </Label>
              </View>
            ))}
          </View>
        </View>

        <View className={"px-4 mt-6"}>
          <SectionHeading className={"text-mainText mb-3"}>
            Languages
          </SectionHeading>
          <View className={"flex-row flex-wrap gap-2"}>
            {midwife.languages.map((language) => (
              <View
                key={language}
                className={"border border-borderGreyColor rounded-full px-4 py-2"}
              >
                <Label className={"text-mainText"}>
                  {language}
                </Label>
              </View>
            ))}
          </View>
        </View>

        <View className={"px-4 mt-6"}>
          <SectionHeading className={"text-mainText mb-3"}>
            Education &amp; Certification
          </SectionHeading>
          <View className={"flex-row items-start gap-2"}>
            <View className={"w-1.5 h-1.5 rounded-full bg-primaryColor mt-2"} />
            <Body className={"text-mainText flex-1"}>
              {midwife.education}
            </Body>
          </View>
        </View>

        <View className={"px-4 mt-6"}>
          <SectionHeading className={"text-mainText mb-3"}>
            Available Consultation Types
          </SectionHeading>
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
                  <Label className={"text-mainText"}>
                    {type.label}
                  </Label>
                  <Caption className={"text-greyColor mt-0.5"}>
                    {type.duration}
                  </Caption>
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
          <ButtonText className={"text-white"}>Book Appointment</ButtonText>
        </Pressable>
      </View>
    </View>
  );
}
