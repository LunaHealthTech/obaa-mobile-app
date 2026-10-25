import { ActivityIndicator, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/constants/theme";
import { Body, ButtonText, CardTitle, Caption } from "@/components/Typography";
import { FAILURE_COPY, type ContentFailure } from "@/lib/content/errors";
import { useContentViewer } from "@/viewmodel/useContent";

type IconName = keyof typeof Ionicons.glyphMap;

const FAILURE_ICON: Record<ContentFailure, IconName> = {
  "not-found": "document-outline",
  unavailable: "cloud-offline-outline",
  throttled: "time-outline",
  offline: "cloud-offline-outline",
  "sign-in": "log-in-outline",
  "verify-email": "mail-outline",
  unknown: "alert-circle-outline",
};

function StatusLayout({
  icon,
  title,
  body,
  children,
}: {
  icon: IconName;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <View className={"flex-1 items-center justify-center px-6 py-10 bg-white"}>
      <View
        className={
          "bg-[#0F969C1A] w-16 h-16 rounded-full items-center justify-center mb-3"
        }
      >
        <Ionicons name={icon} size={26} color={theme.primaryColor} />
      </View>
      <CardTitle className={"text-mainText text-center"}>{title}</CardTitle>
      <Body className={"text-greyColor text-center mt-1"}>{body}</Body>
      {children}
    </View>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={"button"}
      className={"bg-primaryColor rounded-full px-6 h-[48px] items-center justify-center mt-5 active:opacity-80"}
    >
      <ButtonText className={"text-white"}>{label}</ButtonText>
    </Pressable>
  );
}

export function ContentLoading() {
  return (
    <View className={"flex-1 items-center justify-center py-10 bg-white"}>
      <ActivityIndicator color={theme.primaryColor} />
    </View>
  );
}

export function ContentFailureView({
  failure,
  onRetry,
}: {
  failure: ContentFailure;
  onRetry?: () => void;
}) {
  const { email } = useContentViewer();
  const { title, body, action } = FAILURE_COPY[failure];
  const nav = useRouter();

  return (
    <StatusLayout icon={FAILURE_ICON[failure]} title={title} body={body}>
      {action === "retry" && onRetry && <PrimaryButton label={"Try again"} onPress={onRetry} />}
      {action === "sign-in" && (
        <PrimaryButton label={"Sign in"} onPress={() => nav.push("/signin")} />
      )}
      {action === "verify-email" && (
        <PrimaryButton
          label={"Verify email"}
          onPress={() => nav.push({ pathname: "/verify-email", params: { email } })}
        />
      )}
      {action === null && nav.canGoBack() && (
        <PrimaryButton label={"Go back"} onPress={() => nav.back()} />
      )}
    </StatusLayout>
  );
}

export function ContentEmpty({
  icon,
  title,
  body,
  children,
}: {
  icon: IconName;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <StatusLayout icon={icon} title={title} body={body}>
      {children}
    </StatusLayout>
  );
}

export function StaleBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <View
      className={
        "flex-row items-center justify-between bg-[#B26B001A] rounded-lg px-3 py-2 mx-4 mt-2"
      }
    >
      <Caption className={"text-mainText flex-1"}>
        Couldn&apos;t refresh. Showing saved content.
      </Caption>
      <Pressable onPress={onRetry} hitSlop={8} accessibilityRole={"button"}>
        <Caption className={"text-primaryColor"}>Retry</Caption>
      </Pressable>
    </View>
  );
}
