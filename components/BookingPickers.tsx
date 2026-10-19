import { Pressable, View } from "react-native";
import { theme } from "@/constants/theme";
import { Icon } from "@/components/icons/Icon";
import { consultationTypeIcon } from "@/components/AppointmentSummary";
import { Caption, Label } from "@/components/Typography";
import type { Concern, ConsultationType } from "@/types/appointment.types";

type ConcernPickerProps = {
  options: readonly { code: Concern; label: string }[];
  value: Concern;
  onChange: (concern: Concern) => void;
};

export function ConcernPicker({ options, value, onChange }: ConcernPickerProps) {
  return (
    <View className={"flex-row flex-wrap gap-2"}>
      {options.map((option) => {
        const isSelected = option.code === value;
        return (
          <Pressable
            key={option.code}
            onPress={() => onChange(option.code)}
            accessibilityRole={"button"}
            accessibilityState={{ selected: isSelected }}
            className={
              isSelected
                ? "flex-row items-center gap-1.5 bg-primaryColor rounded-full px-4 py-2"
                : "flex-row items-center gap-1.5 bg-white border border-borderGreyColor rounded-full px-4 py-2"
            }
          >
            {isSelected && <Icon name={"check"} size={14} color={"#FFFFFF"} strokeWidth={2} />}
            <Label className={isSelected ? "text-white" : "text-mainText"}>{option.label}</Label>
          </Pressable>
        );
      })}
    </View>
  );
}

type TypePickerProps = {
  options: readonly { type: ConsultationType; label: string; duration_minutes?: number }[];
  value: ConsultationType;
  onChange: (type: ConsultationType) => void;
};

export function ConsultationTypePicker({ options, value, onChange }: TypePickerProps) {
  return (
    <View className={"flex-row gap-3"}>
      {options.map((option) => {
        const isSelected = option.type === value;
        return (
          <Pressable
            key={option.type}
            onPress={() => onChange(option.type)}
            accessibilityRole={"button"}
            accessibilityState={{ selected: isSelected }}
            className={
              isSelected
                ? "flex-1 bg-[#0F969C0D] border-2 border-primaryColor rounded-xl py-4 items-center gap-2"
                : "flex-1 bg-white border border-borderGreyColor rounded-xl py-4 items-center gap-2"
            }
          >
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isSelected ? "bg-primaryColor" : "bg-[#455A641A]"
              }`}
            >
              <Icon
                name={consultationTypeIcon[option.type]}
                size={20}
                color={isSelected ? "#FFFFFF" : theme.subText}
              />
            </View>
            <Label className={isSelected ? "text-primaryColor" : "text-mainText"}>
              {option.label}
            </Label>
            {option.duration_minutes !== undefined && (
              <Caption className={"text-greyColor"}>{option.duration_minutes} min</Caption>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
