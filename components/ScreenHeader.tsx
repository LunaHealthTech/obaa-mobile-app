import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icons/Icon";
import { Body, PageTitle } from "@/components/Typography";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backDisabled?: boolean;
  right?: React.ReactNode;
  bordered?: boolean;
};

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backDisabled,
  right,
  bordered = false,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`flex-row items-start gap-3 px-4 pb-4 ${bordered ? "border-b border-borderGreyColor" : ""}`}
      style={{ paddingTop: insets.top + 16 }}
    >
      <Pressable
        onPress={onBack ?? (() => router.back())}
        disabled={backDisabled}
        accessibilityRole={"button"}
        accessibilityLabel={"Back"}
        hitSlop={8}
        className={
          "border-2 border-borderGreyColor w-[44px] h-[44px] rounded-full items-center justify-center active:opacity-70"
        }
      >
        <Icon name={"chevron-left"} size={20} />
      </Pressable>
      <View className={"flex-1 min-h-[44px] justify-center"}>
        <PageTitle className={"text-mainText"}>{title}</PageTitle>
        {subtitle && <Body className={"text-greyColor mt-1"}>{subtitle}</Body>}
      </View>
      {right && <View className={"min-h-[44px] justify-center"}>{right}</View>}
    </View>
  );
}
