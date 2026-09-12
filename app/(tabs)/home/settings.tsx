import { View } from "react-native";
import { useMenstrualProfileViewModel } from "@/viewmodel/useMenstrualProfile";
import { Body } from "@/components/Typography";
export default function SettingsPage() {
  const { data, isLoading, isError, error } = useMenstrualProfileViewModel();
  console.log({ data, isLoading });

  const handleShareClick = () => {
    // do nothing
  };

  if (isError) {
    console.log({ error });
  }

  if (isLoading) {
    return (
      <View>
        <Body>Loading</Body>
      </View>
    );
  }
  return (
    <View>
      <Body>Settings Pages</Body>
    </View>
  );
}
