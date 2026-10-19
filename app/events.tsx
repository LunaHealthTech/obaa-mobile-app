import { useState } from "react";
import { FlatList, Linking, Pressable, View } from "react-native";
import { parseISO } from "date-fns";
import { Body, ButtonText, CardTitle, Label } from "@/components/Typography";
import { ContentPhoto } from "@/components/content/ContentPhoto";
import {
  ContentEmpty,
  ContentFailureView,
  ContentLoading,
  StaleBanner,
} from "@/components/content/ContentStatus";
import { useEvents } from "@/viewmodel/useContent";
import type { ContentEvent } from "@/services/contentService";

type Scope = "upcoming" | "past";

const SCOPES: { scope: Scope; label: string }[] = [
  { scope: "upcoming", label: "Upcoming" },
  { scope: "past", label: "Past" },
];

function formatStart(startsAt: string | null) {
  if (!startsAt) return null;
  const date = parseISO(startsAt);
  const day = date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
}

const open = (url: string) => Linking.openURL(url).catch(() => {});

function EventCard({ event, scope }: { event: ContentEvent; scope: Scope }) {
  const when = formatStart(event.starts_at);
  const { venue, online_link } = event;

  return (
    <View className={"bg-white rounded-xl border border-borderGreyColor overflow-hidden"}>
      {event.flyer && <ContentPhoto image={event.flyer} />}
      <View className={"p-3 gap-2"}>
        {event.name && <CardTitle className={"text-mainText"}>{event.name}</CardTitle>}
        {when && <Label className={"text-primaryColor"}>{when}</Label>}
        {event.description && <Body className={"text-greyColor"}>{event.description}</Body>}
        {(venue || online_link) && (
          <View className={"flex-row gap-3 mt-1"}>
            {venue && (
              <Pressable
                onPress={() =>
                  open(
                    `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lon}`,
                  )
                }
                accessibilityRole={"link"}
                className={
                  "flex-1 bg-white border-2 border-primaryColor rounded-full h-[44px] items-center justify-center active:opacity-80"
                }
              >
                <ButtonText className={"text-primaryColor"}>Open map</ButtonText>
              </Pressable>
            )}
            {online_link && (
              <Pressable
                onPress={() => open(online_link)}
                accessibilityRole={"link"}
                className={
                  "flex-1 bg-primaryColor rounded-full h-[44px] items-center justify-center active:opacity-80"
                }
              >
                <ButtonText className={"text-white"}>
                  {scope === "past" ? "View event page" : "Join online"}
                </ButtonText>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

export default function EventsPage() {
  const [scope, setScope] = useState<Scope>("upcoming");
  const list = useEvents(scope);

  return (
    <View className={"flex-1 bg-white"}>
      <View className={"flex-row bg-[#72777A1A] rounded-full p-1 mx-4 mt-3"}>
        {SCOPES.map((s) => {
          const selected = s.scope === scope;
          return (
            <Pressable
              key={s.scope}
              onPress={() => setScope(s.scope)}
              accessibilityRole={"tab"}
              accessibilityState={{ selected }}
              className={`flex-1 h-[40px] rounded-full items-center justify-center ${selected ? "bg-white" : ""}`}
            >
              <Label className={selected ? "text-mainText" : "text-greyColor"}>{s.label}</Label>
            </Pressable>
          );
        })}
      </View>
      {list.refreshFailedWithCache && <StaleBanner onRetry={list.refresh} />}
      <FlatList
        data={list.events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} scope={scope} />}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        refreshing={list.isRefreshing}
        onRefresh={list.refresh}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          list.isLoading ? (
            <ContentLoading />
          ) : list.failure ? (
            <ContentFailureView failure={list.failure} onRetry={list.refresh} />
          ) : scope === "upcoming" ? (
            <ContentEmpty
              icon={"calendar-outline"}
              title={"No upcoming events yet"}
              body={
                "We're planning midwife-led sessions on cycles, pregnancy and sexual health. Check back soon."
              }
            >
              <Pressable
                onPress={() => setScope("past")}
                accessibilityRole={"button"}
                className={
                  "bg-white border-2 border-primaryColor rounded-full px-6 h-[48px] items-center justify-center mt-5 active:opacity-80"
                }
              >
                <ButtonText className={"text-primaryColor"}>See past events</ButtonText>
              </Pressable>
            </ContentEmpty>
          ) : (
            <ContentEmpty
              icon={"calendar-outline"}
              title={"No past events"}
              body={"Events you can look back on will appear here."}
            />
          )
        }
        ListFooterComponent={
          list.isLoadingMore ? (
            <ContentLoading />
          ) : list.loadMoreFailed ? (
            <Pressable onPress={list.retryLoadMore} className={"items-center py-3"}>
              <Label className={"text-primaryColor"}>Couldn&apos;t load more. Retry</Label>
            </Pressable>
          ) : null
        }
      />
    </View>
  );
}
