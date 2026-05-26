import { KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView } from "react-native";

export function ScreenContainer({ children }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>{children}</ScrollView>
    </KeyboardAvoidingView>
  );
}
