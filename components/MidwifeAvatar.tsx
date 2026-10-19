import { View } from "react-native";
import { Image } from "expo-image";
import { apiOrigin } from "@/lib/apiClient";
import type { MidwifeSummary } from "@/types/appointment.types";

type Props = {
  midwife: Pick<MidwifeSummary, "display_name" | "profile_pic">;
  size?: number;
  shape?: "circle" | "rounded";
};

export function MidwifeAvatar({ midwife, size = 48, shape = "circle" }: Props) {
  const uri = midwife.profile_pic
    ? `${apiOrigin}${midwife.profile_pic}`
    : `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${encodeURIComponent(midwife.display_name)}&size=${size}&backgroundColor=d1d4f9`;

  return (
    <View
      className={`overflow-hidden bg-[#0F969C1A] ${shape === "circle" ? "rounded-full" : "rounded-xl"}`}
      style={{ width: size, height: size }}
    >
      <Image source={{ uri }} style={{ width: size, height: size }} />
    </View>
  );
}
