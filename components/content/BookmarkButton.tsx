import { Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/constants/theme";
import { useToggleBookmark } from "@/viewmodel/useContent";
import type { Article } from "@/services/contentService";

export function BookmarkButton({ article, size = 22 }: { article: Article; size?: number }) {
  const toggle = useToggleBookmark();
  const bookmarked = !!article.bookmarked;

  return (
    <Pressable
      onPress={() => toggle(article)}
      hitSlop={10}
      accessibilityRole={"button"}
      accessibilityLabel={bookmarked ? "Remove bookmark" : "Bookmark this article"}
      accessibilityState={{ selected: bookmarked }}
      className={"active:opacity-60"}
    >
      <Ionicons
        name={bookmarked ? "bookmark" : "bookmark-outline"}
        size={size}
        color={bookmarked ? theme.primaryColor : theme.greyColor}
      />
    </Pressable>
  );
}
