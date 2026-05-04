import { View, Text } from "react-native";

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
      <View className={"flex flex-row gap-4 "}>
        {children}
        <View>
          <Text className={"text-lg"}>{text}</Text>
          <Text className={"text-sm text-greyColor"}>{subText}</Text>
        </View>
      </View>
    </View>
  );
}
