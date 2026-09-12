import Svg, { Circle, G } from "react-native-svg";
import { View, Text } from "react-native";
import FollicularPhase from "@/assets/follicular.svg";
import LutealPhase from "@/assets/luteal.svg";
import OvulationPhase from "@/assets/ovulation.svg";
import PeriodPhase from "@/assets/period_phase.svg";
import { CardTitle, Caption } from "@/components/Typography";

const SIZE = 300;
const STROKE_WIDTH = 24;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const GAP = 0;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PhaseImagePair = {
  MENSTRUATING: <PeriodPhase />,
  OVULATING: <OvulationPhase />,
  LUTEAL: <LutealPhase />,
  FOLLICULAR: <FollicularPhase />,
};

const PhaseWordPair = {
  MENSTRUATING: "Menstrual",
  OVULATING: "Ovulation",
  LUTEAL: "Luteal",
  FOLLICULAR: "Follicular",
};
export function CircularProgress({
  day = 2,
  totalDays = 25,
  phase = "FOLLICULAR",
}) {
  const progress = day / totalDays;
  const trackLength = CIRCUMFERENCE * (1 - GAP);
  const progressLength = trackLength * progress;
  const startAngle = -90 + (GAP / 2) * 360;
  const progressAngle =
    (startAngle + progress * (1 - GAP) * 360) * (Math.PI / 180);
  const dotX = SIZE / 2 + RADIUS * Math.cos(progressAngle);
  const dotY = SIZE / 2 + RADIUS * Math.sin(progressAngle);

  return (
    <View
      className="items-center justify-center"
      style={{ width: SIZE, height: SIZE }}
    >
      <Svg width={SIZE} height={SIZE} style={{ position: "absolute" }}>
        <G rotation={startAngle} origin={`${SIZE / 2}, ${SIZE / 2}`}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#F5F5F5"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${trackLength} ${CIRCUMFERENCE - trackLength}`}
            strokeLinecap="round"
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#0d6e7a"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${progressLength} ${CIRCUMFERENCE - progressLength}`}
            strokeLinecap="round"
            fill="none"
          />
        </G>
        <Circle
          cx={dotX}
          cy={dotY}
          r={STROKE_WIDTH / 2 + 4}
          fill="white"
          stroke="#0d6e7a"
          strokeWidth={2}
        />
      </Svg>
      <>
        <View className="items-center relative">
          <Caption className="text-gray-400">Cycle</Caption>
          <Text className="text-5xl font-display-bold text-gray-900">Day {day}</Text>
          <CardTitle className="text-gray-900">
            {PhaseWordPair[phase]} Phase
          </CardTitle>
        </View>
        {/*  background image */}
        <View
          className={
            "bg-[#0F969C1A] w-[230px] h-[230px] rounded-full absolute top-10 -z-10 items-center justify-center"
          }
        >
          {PhaseImagePair[phase]}
        </View>
      </>
    </View>
  );
}
