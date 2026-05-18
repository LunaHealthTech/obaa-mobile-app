import { View, Text } from "react-native";

export function EmotionCard() {
  return (
    <View
      className={
        "flex items-center justify-center p-2 gap-3 border border-borderGreyColor rounded-md"
      }
    >
      <Text className={"text-2xl"}>😊</Text>
      <Text>Happy</Text>
    </View>
  );
}
