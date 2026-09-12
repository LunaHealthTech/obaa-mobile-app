import { View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { Body } from "@/components/Typography";

export default function Community() {
  return (
    <View className={"flex-1 bg-white"}>
      <AppHeader />
      <View className={"px-4"}>
        <Body>Community page</Body>
      </View>
    </View>
  );
}
