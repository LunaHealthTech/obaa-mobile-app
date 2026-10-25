import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import { Caption } from "@/components/Typography";
import { useNotifications } from "@/viewmodel/useNotifications";
import NotificationsIcon from "@/assets/icons/notificationIcon.svg";

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  return (
    <Link href={"/notifications"} asChild>
      <Pressable
        accessibilityRole={"button"}
        accessibilityLabel={
          unreadCount === 0 ? "Notifications" : `Notifications, ${unreadCount} unread`
        }
        className={
          "border-2 border-borderGreyColor w-[44px] h-[44px] rounded-full items-center justify-center relative"
        }
      >
        <NotificationsIcon width={18} height={18} />
        {unreadCount > 0 && (
          <View
            className={
              "absolute -top-1 -right-1 bg-[#E82A73] rounded-full min-w-[18px] h-[18px] px-1 items-center justify-center"
            }
          >
            <Caption className={"text-white text-[10px] font-sans-bold"}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </Caption>
          </View>
        )}
      </Pressable>
    </Link>
  );
}
