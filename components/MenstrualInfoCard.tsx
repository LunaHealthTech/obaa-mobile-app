import { View } from "react-native";
import { CardTitle, Caption } from "@/components/Typography";

export function MenstrualInfoCard({
  children,
  text,
  subText,
}: {
  children: React.ReactNode;
  text: string;
  subText: string;
}) {
  return (
    <View
      className={
        "bg-white rounded-lg text-sm w-full h-20 drop-shadow-sm border border-borderGreyColor my-2 flex flex-row items-center py-2 px-4"
      }
    >
      <View className={"flex items-center flex-row gap-4 "}>
        {children}
        <View>
          <CardTitle>{text}</CardTitle>
          <Caption className={"text-greyColor"}>{subText}</Caption>
        </View>
      </View>
    </View>
  );
}
