import { Pressable, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { CalendarProvider, ExpandableCalendar } from "react-native-calendars";
import CalendarIcon from "@/assets/icons/topCalendarIcon.svg";
import { Image } from "expo-image";
import { flowers } from "@/constants/assets";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMenstrualCycles } from "@/viewmodel/useCycles";
import { format } from "date-fns";
import { DayMarking } from "@/types/menstrual.types";
import { Body, CardTitle } from "@/components/Typography";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface CalendarProps {
  onDayPress?: (dateString: string, marking?: DayMarking) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ArrowButton({
  name,
  onPress,
}: {
  name: "chevron-back" | "chevron-forward";
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={pressStyle}
      onPressIn={() => {
        scale.value = withTiming(0.85, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      }}
      onPress={onPress}
    >
      <Ionicons name={name} size={24} color="black" />
    </AnimatedPressable>
  );
}

function AnimatedMonthHeader({ monthLabel }: { monthLabel: string }) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = 0;
    translateY.value = 6;
    opacity.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    translateY.value = withTiming(0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthLabel]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={style}
      className={"flex flex-row flex-1 gap-3 items-center my-5"}
    >
      <CalendarIcon width={25} height={25} color={"#3A3A3A"} />
      <CardTitle>{monthLabel}</CardTitle>
      <Image source={flowers} width={25} height={25} />
    </Animated.View>
  );
}

// Static across the component's lifetime — hoisted so ExpandableCalendar
// doesn't see a new theme/style object (and re-render every month page) on
// every parent render.
const CALENDAR_THEME = {
  stylesheet: {
    expandable: {
      main: {
        reservedHeight: 500,
      },
    },
  },
};

const CALENDAR_STYLE = {
  shadowColor: "transparent",
  paddingBottom: 10,
};

export function Calendar({ onDayPress }: CalendarProps) {
  const { menstrualCycles, isLoadingMenstrualCycles } = useMenstrualCycles();
  const [currentDate, setCurrentDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );

  const shiftMonth = useCallback((delta: number) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + delta);
      return format(d, "yyyy-MM-dd");
    });
  }, []);

  const handleDayPress = useCallback(
    (day: { dateString: string }) => {
      const today = format(new Date(), "yyyy-MM-dd");
      if (day.dateString > today) return;
      onDayPress?.(day.dateString, menstrualCycles?.[day.dateString]);
    },
    [onDayPress, menstrualCycles],
  );

  const renderHeader = useCallback(() => {
    return (
      <View
        className={
          "flex flex-1 flex-row space-between items-center border-amber-500"
        }
      >
        <AnimatedMonthHeader monthLabel={format(currentDate, "MMMM yyyy")} />
        <View className={"flex flex-row gap-3 .border-2"}>
          <ArrowButton name="chevron-back" onPress={() => shiftMonth(-1)} />
          <ArrowButton name="chevron-forward" onPress={() => shiftMonth(1)} />
        </View>
      </View>
    );
  }, [currentDate, shiftMonth]);

  if (isLoadingMenstrualCycles) {
    return <Body>Loading...</Body>;
  }
  return (
    <>
      <CalendarProvider
        date={currentDate}
        onDateChanged={(date) => setCurrentDate(date)}
      >
        <ExpandableCalendar
          theme={CALENDAR_THEME}
          markingType={"custom"}
          style={CALENDAR_STYLE}
          markedDates={menstrualCycles}
          maxDate={format(new Date(), "yyyy-MM-dd")}
          hideArrows={true}
          animateScroll={true}
          pastScrollRange={3}
          futureScrollRange={1}
          onDayPress={handleDayPress}
          renderHeader={renderHeader}
        />
      </CalendarProvider>
    </>
  );
}
