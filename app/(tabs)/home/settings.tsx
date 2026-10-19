import { Pressable, View } from "react-native";
import { router, type Href } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/constants/theme";
import { Label } from "@/components/Typography";

type Row = { label: string; icon: keyof typeof Ionicons.glyphMap; href: Href };

const ROWS: Row[] = [
  { label: "Bookmarks", icon: "bookmark-outline", href: "/bookmarks" },
  { label: "Events", icon: "calendar-outline", href: "/events" },
  { label: "Privacy policy", icon: "shield-checkmark-outline", href: "/privacy-policy" },
];

export default function SettingsPage() {
  return (
    <View className={"flex-1 bg-white px-4 pt-2"}>
      {ROWS.map((row) => (
        <Pressable
          key={row.label}
          onPress={() => router.push(row.href)}
          accessibilityRole={"link"}
          className={
            "flex-row items-center gap-3 py-4 border-b border-borderGreyColor active:opacity-70"
          }
        >
          <Ionicons name={row.icon} size={22} color={theme.primaryColor} />
          <Label className={"text-mainText flex-1"}>{row.label}</Label>
          <Ionicons name={"chevron-forward"} size={18} color={theme.greyColor} />
        </Pressable>
      ))}
    </View>
  );
}
