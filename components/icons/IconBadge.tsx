import { View } from "react-native";
import { theme } from "@/constants/theme";
import { Icon, type IconName } from "@/components/icons/Icon";

const tones = {
  primary: { box: "bg-[#0F969C1A]", color: theme.primaryColor },
  neutral: { box: "bg-[#455A641A]", color: theme.subText },
  inverse: { box: "bg-[rgba(255,255,255,0.18)]", color: "#FFFFFF" },
  urgent: { box: "bg-[#D32F2F1A]", color: theme.urgentColor },
};

const sizes = {
  sm: { box: "w-9 h-9", icon: 18 },
  md: { box: "w-12 h-12", icon: 22 },
  lg: { box: "w-16 h-16", icon: 28 },
};

type Props = {
  name: IconName;
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
  shape?: "circle" | "rounded";
};

export function IconBadge({ name, tone = "primary", size = "md", shape = "circle" }: Props) {
  const t = tones[tone];
  const s = sizes[size];
  return (
    <View
      className={`${s.box} ${t.box} ${shape === "circle" ? "rounded-full" : "rounded-xl"} items-center justify-center`}
    >
      <Icon name={name} size={s.icon} color={t.color} />
    </View>
  );
}
