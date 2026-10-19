import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { Stack } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/constants/theme";
import { NotificationCard } from "@/components/NotificationCard";
import { Body, CardTitle, Label } from "@/components/Typography";
import { useNotifications } from "@/viewmodel/useNotifications";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    readNotification,
    readAllNotifications,
    openNotificationCta,
  } = useNotifications();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <View className={"flex-1 bg-white"}>
      <Stack.Screen
        options={{
          title: "Notifications",
          headerRight: () => (
            <Pressable
              onPress={readAllNotifications}
              disabled={unreadCount === 0}
              accessibilityRole={"button"}
              accessibilityState={{ disabled: unreadCount === 0 }}
              hitSlop={8}
            >
              <Label
                className={
                  unreadCount === 0 ? "text-greyColor" : "text-primaryColor"
                }
              >
                Mark all as read
              </Label>
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            expanded={expandedId === item.id}
            onPress={() => {
              setExpandedId(expandedId === item.id ? null : item.id);
              readNotification(item);
            }}
            onBook={() => openNotificationCta(item)}
          />
        )}
        ListEmptyComponent={
          isLoading ? null : (
            <View className={"flex-1 items-center justify-center px-6"}>
              <View
                className={
                  "bg-[#0F969C1A] w-16 h-16 rounded-full items-center justify-center mb-3"
                }
              >
                <Ionicons
                  name={"notifications-outline"}
                  size={26}
                  color={theme.primaryColor}
                />
              </View>
              <CardTitle className={"text-mainText"}>No notifications yet</CardTitle>
              <Body className={"text-greyColor text-center mt-1"}>
                We&apos;ll let you know if anything in your cycle looks unusual.
              </Body>
            </View>
          )
        }
      />
    </View>
  );
}
