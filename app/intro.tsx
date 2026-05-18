import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function Intro() {
  return (
    <View>
      <Text>Obaa</Text>
      <Text>by Ergon Pulse</Text>
      <Link href={"/signin"}>
        {" "}
        <Text>Sign in</Text>{" "}
      </Link>
      <Link href={"/signup"}>
        {" "}
        <Text>Sign up</Text>{" "}
      </Link>
    </View>
  );
}
