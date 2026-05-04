import { Tabs } from "expo-router";
import HomeIconSvg from "@/assets/icons/HomeIcon.svg";
import LogIcon from "@/assets/icons/logIcon.svg";
import CalendarIcon from "@/assets/icons/CalendarIcon.svg";
import ChatIcon from "@/assets/icons/ChatIcon.svg";
import CommunityIcon from "@/assets/icons/CommunityIcon.svg";
import { theme } from "@/constants/theme";

export default function HomeLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primaryColor,
        tabBarInactiveTintColor: theme.tabBarItemIconColor,
      }}
    >
      <Tabs.Screen
        name={"home"}
        options={{
          title: "home",
          headerShown: false,
          headerShadowVisible: false,
          tabBarIcon: ({ size, color }) => (
            <HomeIconSvg width={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name={"logs"}
        options={{
          title: "logs",
          tabBarIcon: ({ size, color }) => (
            <LogIcon width={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name={"calendar"}
        options={{
          title: "calendar",
          tabBarIcon: ({ size, color }) => (
            <CalendarIcon width={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name={"chat"}
        options={{
          title: "Chat",
          tabBarIcon: ({ size, color }) => (
            <ChatIcon width={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name={"community"}
        options={{
          title: "Community",
          tabBarIcon: ({ size, color }) => (
            <CommunityIcon width={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
