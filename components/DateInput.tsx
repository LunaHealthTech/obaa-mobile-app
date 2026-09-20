import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { format, parseISO } from "date-fns";
import { Body } from "@/components/Typography";

type DateInputProps = {
  value?: Date;
  onChange: (date: Date) => void;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
};

export function DateInput({
  value,
  onChange,
  error,
  minimumDate,
  maximumDate = new Date(),
}: DateInputProps) {
  const [show, setShow] = useState(false);
  console.log("Date input" ,{ value });
  return (
    <View>
      {/* Trigger */}
      <Pressable
        onPress={() => setShow(true)}
        className={
          "bg-white border border-[#999999] mt-2 rounded-md flex flex-row gap-2 items-center p-3"
        }
      >
        <Body>{value ? format(value, "yyyy-MM-dd") : "Select date"}</Body>
      </Pressable>

      {/* Picker */}
      {show && (
        <DateTimePicker
          value={value || maximumDate}
          mode="date"
          display="spinner" // 'spinner', 'calendar', 'default'
          onChange={(event, date) => {
            setShow(false);
            if (date) onChange(date);
          }}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {error && <Body className={"text-red-500"}>{error}</Body>}
    </View>
  );
}
