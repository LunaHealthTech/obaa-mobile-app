import { View, Text, Pressable } from "react-native";
import { EmoticonData } from "@/types/emotion.types";
import { Caption } from "@/components/Typography";

interface EmotionCardProps {
  emotion: EmoticonData;
  onPress: (capturedEmotion: EmoticonData) => void;
}

export function EmotionCard({ emotion, onPress }: EmotionCardProps) {
  return (
    <Pressable
      style={({ pressed }) => ({ opacity: pressed ? 0 : 1 })}
      onPress={() => {
        onPress(emotion);
      }}
    >
      {({ pressed }) => (
        <View
          className={`flex items-center justify-center p-2 gap-3 border border-borderGreyColor rounded-xl w-[70px] h-[90px]`}
          style={{ opacity: pressed ? 0.5 : 1 }}
        >
          <Text className={"text-2xl"}>{emotion.emoji}</Text>
          <Caption className={"capitalize"}>{emotion.name}</Caption>
        </View>
      )}
    </Pressable>
  );
}
