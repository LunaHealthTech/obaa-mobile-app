import { Pressable, View } from "react-native";
import { Label, SectionHeading } from "@/components/Typography";

type Props = { title: string; actionLabel?: string; onAction?: () => void };

export function SectionHeader({ title, actionLabel, onAction }: Props) {
  return (
    <View className={"flex-row items-center justify-between mb-3"}>
      <SectionHeading className={"text-mainText"}>{title}</SectionHeading>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole={"link"}>
          <Label className={"text-primaryColor"}>{actionLabel}</Label>
        </Pressable>
      )}
    </View>
  );
}