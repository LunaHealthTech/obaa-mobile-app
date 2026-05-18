import { Text, View } from "react-native";
import { useMenstrualProfileViewModel } from "@/viewmodel/useMenstrualProfile";
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
        <Text>Loading</Text>
      </View>
    );
  }
  return (
    <View>
      <Text>Settings Pages</Text>
    </View>
  );
}
