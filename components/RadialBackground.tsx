import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

interface RadialBackgroundProps {
  colors: string[];
}

export function RadialBackground({ colors }: RadialBackgroundProps) {
  return (
    <Svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
      }}
      height={"100%"}
      width={"100%"}
    >
      <Defs>
        <RadialGradient id={"grad"} cx={"50%"} cy={"100%"} rx={"40%"}>
          {colors.map((color, i) => (
            <Stop
              key={i}
              offset={`${(i / (colors.length - 1)) * 100}%`}
              stopColor={color}
            />
          ))}
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#grad)" rx={"15"} ry={"15"} />
    </Svg>
  );
}
