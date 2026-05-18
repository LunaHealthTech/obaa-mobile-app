import { View, Text, Pressable } from "react-native";
import { useAuthStore } from "@/repositories/useAuthStore";

export default function Logs() {
  const logout = useAuthStore((state) => state.logout);
  return (
    <View>
      <Text>Logs page</Text>
      <Pressable onPress={() => logout()}>
        <Text>Logout</Text>
      </Pressable>
    </View>
  );
}
