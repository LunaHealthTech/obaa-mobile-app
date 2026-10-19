import Svg, { Path } from "react-native-svg";
import { theme } from "@/constants/theme";
import { iconPaths, type IconName } from "@/components/icons/paths";

export type { IconName };

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({
  name,
  size = 20,
  color = theme.mainText,
  strokeWidth = 1.5,
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={"0 0 24 24"}
      fill={"none"}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap={"round"}
      strokeLinejoin={"round"}
    >
      {iconPaths[name].map((d) => (
        <Path key={d} d={d} />
      ))}
    </Svg>
  );
}
