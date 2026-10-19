import { useState } from "react";
import { PixelRatio, View } from "react-native";
import { Image } from "expo-image";
import { sizedImageUrl } from "@/lib/content/image";
import type { ContentImage } from "@/services/contentService";

type Props = {
  image: ContentImage;
  aspectRatio?: number;
  className?: string;
};

// Requests the image at the width it is laid out at, never the original.
export function ContentPhoto({ image, aspectRatio = 16 / 9, className = "" }: Props) {
  const [width, setWidth] = useState(0);

  return (
    <View
      className={`overflow-hidden bg-[#72777A1A] ${className}`}
      style={{ aspectRatio }}
      onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
    >
      {width > 0 && (
        <Image
          source={{ uri: sizedImageUrl(image.url, width, PixelRatio.get()) }}
          style={{ width: "100%", height: "100%" }}
          contentFit={"cover"}
          transition={200}
          alt={image.description ?? undefined}
        />
      )}
    </View>
  );
}
