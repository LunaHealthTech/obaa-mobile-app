import { Linking, Pressable, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Caption, Label } from "@/components/Typography";
import { ContentPhoto } from "@/components/content/ContentPhoto";
import { reportContentFailure } from "@/viewmodel/useContent";
import type { Video } from "@/services/contentService";

export const VIDEO_CARD_WIDTH = 140;
const VIDEO_CARD_HEIGHT = 200;

export function VideoCard({ video }: { video: Video }) {
  const author = video.author;
  const open = () => {
    if (!video.reel) return;
    const url = video.reel.url.startsWith("//") ? `https:${video.reel.url}` : video.reel.url;
    Linking.openURL(url).catch(() => reportContentFailure("unknown"));
  };

  return (
    <Pressable
      onPress={open}
      accessibilityRole={"button"}
      accessibilityLabel={video.title ?? video.caption ?? "Play video"}
      style={{ width: VIDEO_CARD_WIDTH, height: VIDEO_CARD_HEIGHT }}
      className={"rounded-xl overflow-hidden bg-primaryColor active:opacity-80"}
    >
      {video.thumbnail && (
        <ContentPhoto image={video.thumbnail} aspectRatio={VIDEO_CARD_WIDTH / VIDEO_CARD_HEIGHT} />
      )}
      {!video.thumbnail && (
        <View className={"flex-1 items-center justify-center"}>
          <Ionicons name={"play-circle"} size={40} color={"#FFFFFF"} />
        </View>
      )}
      <View className={"absolute bottom-0 left-0 right-0 p-2 gap-1 bg-black/50"}>
        {author?.name && (
          <View className={"flex-row items-center gap-2"}>
            <View className={"w-5 h-5 rounded-full overflow-hidden bg-white"}>
              {author.profile_image && (
                <ContentPhoto image={author.profile_image} aspectRatio={1} />
              )}
            </View>
            <Caption className={"text-white flex-1"} numberOfLines={1}>
              {author.name}
            </Caption>
          </View>
        )}
        {(video.caption ?? video.title) && (
          <Label className={"text-white"} numberOfLines={2}>
            {video.caption ?? video.title}
          </Label>
        )}
      </View>
    </Pressable>
  );
}