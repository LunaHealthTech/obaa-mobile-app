import { View, Text, Pressable, ScrollView, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import type { DayMarking } from "@/types/menstrual.types";
import { useDayLog } from "@/viewmodel/useDayLog";

interface DayDetailCardProps {
  date: string;
  marking?: DayMarking;
  onClose: () => void;
  onEdit?: () => void;
}

export function DayDetailCard({
  date,
  marking,
  onClose,
  onEdit,
}: DayDetailCardProps) {
  const { log, isLoadingLog } = useDayLog(date);

  return (
    <Modal
      transparent
      visible
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/40"
          onPress={onClose}
        />
        <View className="bg-white rounded-t-2xl p-5 pb-8 border border-borderGreyColor border-b-0">
          <View className="w-10 h-1 rounded-full bg-borderGreyColor self-center mb-4" />
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-lg font-semibold text-mainText">
                {format(new Date(date), "d MMM")}
                {marking?.cycleDay ? ` - Cycle Day ${marking.cycleDay}` : ""}
              </Text>
              {marking?.phase && (
                <Text className="text-subText mt-1">
                  {marking.phase} phase
                </Text>
              )}
            </View>
            <Pressable
              onPress={onClose}
              className="bg-[#00000010] rounded-full p-1"
            >
              <Ionicons name="close" size={18} color="#3A3A3A" />
            </Pressable>
          </View>

          <Text className="font-semibold text-mainText mt-4 mb-2">
            Mood and Symptoms
          </Text>
          <View className="flex-row items-center bg-[#F2F2F2] rounded-full px-2 py-1">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-1"
            >
              <View className="flex-row items-center gap-2 px-1">
                {isLoadingLog && (
                  <Text className="text-subText px-2">Loading…</Text>
                )}
                {!isLoadingLog && !log && (
                  <Text className="text-subText px-2">
                    No log for this day yet
                  </Text>
                )}
                {log?.mood ? (
                  <View className="w-8 h-8 rounded-full bg-white items-center justify-center">
                    <Text>{log.mood}</Text>
                  </View>
                ) : null}
                {log?.symptoms?.map((symptom) => (
                  <View
                    key={symptom}
                    className="bg-white rounded-full px-3 py-1"
                  >
                    <Text className="text-xs text-mainText">{symptom}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <Pressable
              onPress={onEdit}
              className="bg-primaryColor rounded-full w-9 h-9 items-center justify-center ml-2"
            >
              <Ionicons name="add" size={20} color="white" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
