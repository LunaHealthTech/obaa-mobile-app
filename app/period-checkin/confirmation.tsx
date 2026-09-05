import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function CheckInConfirmation() {
  const router = useRouter();
  return (
    <View className="bg-white items-center px-8 py-8">
      <Text className="text-xl font-semibold text-mainText text-center mb-2">
        💞 All Set for Today
      </Text>
      <Text className="text-subText text-center mb-8">
        Thank you for checking in. Your period details have been saved, and
        we'll take it from here 🤟
      </Text>
      <Pressable
        onPress={() => router.dismissAll()}
        className="bg-primaryColor rounded-full w-full py-4 items-center"
      >
        <Text className="text-white font-semibold">Done</Text>
      </Pressable>
    </View>
  );
}
