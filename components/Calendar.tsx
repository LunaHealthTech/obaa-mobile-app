import { Text, Pressable, View } from "react-native";
import { useState } from "react";
import { CalendarProvider, ExpandableCalendar } from "react-native-calendars";
import CalendarIcon from "@/assets/icons/topCalendarIcon.svg";
import { Image } from "expo-image";
import { flowers } from "@/constants/assets";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMenstrualCycles } from "@/viewmodel/useCycles";
import { format } from "date-fns";

export function Calendar() {
  const { menstrualCycles, isLoadingMenstrualCycles } = useMenstrualCycles();
  const [currentDate, setCurrentDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );

  const shiftMonth = (delta: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + delta);
    setCurrentDate(format(d, "yyyy-MM-dd"));
  };

  if (isLoadingMenstrualCycles) {
    return "loading...";
  }
  console.log({ menstrualCycles });
  return (
    <>
      <CalendarProvider
        date={currentDate}
        onDateChanged={(date) => setCurrentDate(date)}
      >
        <ExpandableCalendar
          theme={{
            stylesheet: {
              expandable: {
                main: {
                  reservedHeight: 500,
                },
              },
            },
          }}
          markingType={"custom"}
          style={{
            shadowColor: "transparent",
            paddingBottom: 10,
          }}
          markedDates={menstrualCycles}
          hideArrows={true}
          renderHeader={(date) => {
            return (
              <View
                className={
                  "flex flex-1 flex-row space-between items-center border-amber-500"
                }
              >
                <View
                  className={"flex flex-row flex-1 gap-3 items-center my-5"}
                >
                  <CalendarIcon width={25} height={25} color={"#3A3A3A"} />
                  <Text className={"font-bold"}>
                    {format(currentDate, "MMMM yyyy")}
                  </Text>
                  <Image source={flowers} width={25} height={25} />
                </View>
                <View className={"flex flex-row gap-3 .border-2"}>
                  <Pressable onPress={() => shiftMonth(-1)}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                  </Pressable>
                  <Pressable onPress={() => shiftMonth(1)}>
                    <Ionicons name="chevron-forward" size={24} color="black" />
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      </CalendarProvider>
    </>
  );
}
