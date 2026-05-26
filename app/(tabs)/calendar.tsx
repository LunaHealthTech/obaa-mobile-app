import { View, Text, ScrollView, KeyboardAvoidingView } from "react-native";
import { SharedNav } from "@/components/SharedNav";
import { Calendar } from "@/components/Calendar";

export default function CalendarPage() {
  return (
    <ScrollView>
      <View className={"bg-white .px-4 flex-1 w-full"}>
        <View className={"px-4"}>
          <SharedNav />
        </View>
        <Calendar />
        <View
          className={
            "flex flex-row flex-wrap text-[#72777A]. text-mainText text-[10px] px-4 w-full h-[50px] gap-2 .border-2"
          }
        >
          <View className={`flex-row items-center gap-1 w-fit .border-2`}>
            <View
              className={
                "w-4 h-4 border border-dashed border-[#E82A73] rounded-full"
              }
            ></View>
            <Text className="w-fit">Predicted Blood Flow</Text>
          </View>
          <View className={`flex-row items-center gap-2 w-fit`}>
            <View className={"w-4 h-4 bg-[#E82A73] rounded-full"}></View>
            <Text className="w-fit line-clamp-2 wrap">
              Confirmed Blood Flow
            </Text>
          </View>
        </View>
        <View className={"flex-row items-center gap-5 w-fit px-4 .border-2"}>
          <View className={`flex-row gap-2 items-center `}>
            <View
              className={"w-4 h-4 flex-row bg-[#DEE4F5] rounded-full"}
            ></View>
            <Text>Fertile Window</Text>
          </View>
          <View className={`flex-row gap-2 items-center `}>
            <View className={"w-4 h-4 bg-[#07226B] rounded-full"}> </View>
            <Text>Ovulation day</Text>
          </View>
          <View className={`flex-row gap-2 items-center `}>
            <View className={"w-4 h-4 bg-[#3CB9FB50] rounded-full"}></View>
            <Text>Safe days</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
