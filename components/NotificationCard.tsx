import { View, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDistanceToNow, parseISO } from "date-fns";
import { theme } from "@/constants/theme";
import {
  Body,
  ButtonText,
  Caption,
  CardTitle,
} from "@/components/Typography";
import { ctaLabel } from "@/lib/notifications/cta";
import type { AppNotification, Severity } from "@/types/notification.types";

const severityStyles: Record<
  Severity | "NEUTRAL",
  {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    badge: string;
    border: string;
    label: string | null;
  }
> = {
  INFO: {
    icon: "information-circle",
    color: theme.primaryColor,
    badge: "bg-[#0F969C1A]",
    border: "border-borderGreyColor",
    label: null,
  },
  WARNING: {
    icon: "warning",
    color: theme.warningColor,
    badge: "bg-[#B26B001A]",
    border: "border-borderGreyColor",
    label: "Needs attention",
  },
  URGENT: {
    icon: "alert-circle",
    color: theme.urgentColor,
    badge: "bg-[#D32F2F1A]",
    border: "border-urgentColor",
    label: "Urgent",
  },
  NEUTRAL: {
    icon: "notifications",
    color: theme.greyColor,
    badge: "bg-[#72777A1A]",
    border: "border-borderGreyColor",
    label: null,
  },
};

const DISCLAIMER =
  "This is not a diagnosis. If you're in pain, bleeding heavily or feel unwell, seek care right away.";

type Props = {
  notification: AppNotification;
  expanded: boolean;
  onPress?: () => void;
  onBook: () => void;
  onDismiss?: () => void;
};

export function NotificationCard({
  notification,
  expanded,
  onPress,
  onBook,
  onDismiss,
}: Props) {
  const style = severityStyles[notification.severity ?? "NEUTRAL"];
  const unread = !notification.readAt;
  const Title = unread ? CardTitle : Body;
  const timestamp = formatDistanceToNow(parseISO(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <View className={`bg-white rounded-xl border ${style.border} p-4`}>
      <View className={"flex-row items-start gap-3"}>
        <Pressable
          onPress={onPress}
          disabled={!onPress}
          accessibilityRole={onPress ? "button" : "summary"}
          accessibilityState={onPress ? { expanded } : undefined}
          accessibilityLabel={[
            style.label,
            notification.title,
            unread ? "unread" : null,
            timestamp,
          ]
            .filter(Boolean)
            .join(", ")}
          accessibilityHint={
            onPress && !expanded ? "Shows the full message" : undefined
          }
          className={"flex-1 flex-row items-start gap-3"}
        >
          <View
            className={`${style.badge} w-10 h-10 rounded-full items-center justify-center`}
          >
            <Ionicons name={style.icon} size={22} color={style.color} />
          </View>
          <View className={"flex-1"}>
            {style.label && (
              <Caption style={{ color: style.color }} className={"uppercase"}>
                {style.label}
              </Caption>
            )}
            <Title className={"text-mainText"}>{notification.title}</Title>
            {!expanded && (
              <Body className={"text-greyColor mt-1"} numberOfLines={2}>
                {notification.body}
              </Body>
            )}
            <Caption className={"text-greyColor mt-1"}>{timestamp}</Caption>
          </View>
          {unread && (
            <View className={"w-2.5 h-2.5 rounded-full bg-primaryColor mt-2"} />
          )}
        </Pressable>
        {onDismiss && (
          <Pressable
            onPress={onDismiss}
            accessibilityRole={"button"}
            accessibilityLabel={"Dismiss"}
            hitSlop={8}
          >
            <Ionicons name={"close"} size={20} color={theme.greyColor} />
          </Pressable>
        )}
      </View>

      {expanded && (
        <View className={"mt-3 gap-3"}>
          <Body className={"text-mainText"}>{notification.body}</Body>
          {notification.cta && (
            <Pressable
              onPress={onBook}
              accessibilityRole={"button"}
              className={
                "bg-primaryColor rounded-full py-3 items-center justify-center active:opacity-80"
              }
            >
              <ButtonText className={"text-white"}>
                {ctaLabel(notification.cta)}
              </ButtonText>
            </Pressable>
          )}
          <Caption className={"text-greyColor"}>{DISCLAIMER}</Caption>
        </View>
      )}
    </View>
  );
}
