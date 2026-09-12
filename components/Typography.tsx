import { Text, TextProps } from "react-native";

type AppTextProps = TextProps & { className?: string };

export function PageTitle({ className = "", ...props }: AppTextProps) {
  return <Text className={`text-2xl font-display-bold ${className}`} {...props} />;
}

export function SectionHeading({ className = "", ...props }: AppTextProps) {
  return <Text className={`text-lg font-display-semibold ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }: AppTextProps) {
  return <Text className={`text-base font-display-medium ${className}`} {...props} />;
}

export function Body({ className = "", ...props }: AppTextProps) {
  return <Text className={`text-sm font-sans ${className}`} {...props} />;
}

export function Label({ className = "", ...props }: AppTextProps) {
  return <Text className={`text-sm font-sans-medium ${className}`} {...props} />;
}

export function Caption({ className = "", ...props }: AppTextProps) {
  return <Text className={`text-xs font-sans ${className}`} {...props} />;
}

export function ButtonText({ className = "", ...props }: AppTextProps) {
  return <Text className={`text-base font-sans-semibold ${className}`} {...props} />;
}
