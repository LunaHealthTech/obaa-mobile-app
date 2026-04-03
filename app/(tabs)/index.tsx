import { View, Text, Pressable } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";

export default function HomeScreen() {
  const logout = useAuthStore((state) => state.logout);
  return (
    <View>
      <Text>Do something</Text>
      <Pressable onPress={() => logout()}>
        <Text>Logout</Text>
      </Pressable>
    </View>
  );
}
