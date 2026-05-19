import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { format, parseISO } from "date-fns";

export function DateInput({ value, onChange, error }) {
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
        <Text>{value ? format(value, "yyyy-MM-dd") : "Select date"}</Text>
      </Pressable>

      {/* Picker */}
      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="spinner" // 'spinner', 'calendar', 'default'
          onChange={(event, date) => {
            setShow(false);
            if (date) onChange(date);
          }}
          maximumDate={new Date()} // useful for date of birth
        />
      )}

      {error && <Text className={"text-sm text-red-500"}>{error}</Text>}
    </View>
  );
}
