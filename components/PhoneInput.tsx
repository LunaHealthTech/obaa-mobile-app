import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

type Props = {
  value: string;
  onChange: (val: string) => void;
  error?: string;
};

export const PhoneInput = ({ value, onChange, error }: Props) => {
  const [display, setDisplay] = useState("");

  const handleChange = (text: string) => {
    // Strip non-numeric characters
    const digits = text.replace(/\D/g, "");
    setDisplay(digits);
    // Pass E.164 upstream (Ghana prefix hardcoded)
    onChange(digits ? `+233${digits}` : "");
  };

  return (
    <View>
      <View style={[styles.row, error && styles.errorBorder]}>
        <Text style={styles.prefix}>🇬🇭 +233</Text>
        <TextInput
          style={styles.input}
          value={display}
          onChangeText={handleChange}
          keyboardType="phone-pad"
          placeholder="XX XXX XXXX"
          maxLength={10}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  errorBorder: { borderColor: "red" },
  prefix: { fontSize: 16, marginRight: 8, color: "#333" },
  input: { flex: 1, fontSize: 16 },
  errorText: { color: "red", fontSize: 12, marginTop: 4 },
});
