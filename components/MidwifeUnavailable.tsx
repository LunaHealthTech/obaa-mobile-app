import { Pressable, View } from "react-native";
import { IconBadge } from "@/components/icons/IconBadge";
import { Body, ButtonText, SectionHeading } from "@/components/Typography";

type Props = { actionLabel: string; onAction: () => void };

export function MidwifeUnavailable({ actionLabel, onAction }: Props) {
  return (
    <View className={"flex-1 items-center justify-center px-8"}>
      <IconBadge name={"user-x"} size={"lg"} />
      <SectionHeading className={"text-mainText mt-6 text-center"}>
        This midwife isn&apos;t available anymore
      </SectionHeading>
      <Body className={"text-greyColor mt-2 text-center"}>
        She may have stopped taking bookings. Pick another certified midwife instead.
      </Body>
      <Pressable
        onPress={onAction}
        accessibilityRole={"button"}
        className={"bg-primaryColor rounded-full py-4 px-8 mt-8 self-stretch items-center active:opacity-80"}
      >
        <ButtonText className={"text-white"}>{actionLabel}</ButtonText>
      </Pressable>
    </View>
  );
}
