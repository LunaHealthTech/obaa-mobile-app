import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function NotYet() {
  const router = useRouter();
  return (
    <View className="bg-white items-center px-8 py-8">
      <Text className="text-xl font-semibold text-mainText text-center mb-2">
        🤍 That's perfectly okay
      </Text>
      <Text className="text-subText text-center mb-8">
        Bodies aren't always predictable. We'll keep an eye on things and let
        you know when it's time. You can check in anytime if something
        changes.
      </Text>
      <Pressable
        onPress={() => router.dismissAll()}
        className="bg-primaryColor rounded-full w-full py-4 items-center"
      >
        <Text className="text-white font-semibold">Continue</Text>
      </Pressable>
    </View>
  );
}
