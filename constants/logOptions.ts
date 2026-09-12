export interface LogOption {
  emoji: string;
  label: string;
}

export const MOOD_OPTIONS: LogOption[] = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😴", label: "Tired" },
  { emoji: "⚡", label: "Energetic" },
  { emoji: "😠", label: "Irritated" },
  { emoji: "💗", label: "Horny" },
  { emoji: "😔", label: "Depressed" },
  { emoji: "🌀", label: "Mood Swings" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😟", label: "Uneasy" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "😕", label: "Mixed Feelings" },
];

export const SYMPTOM_OPTIONS: LogOption[] = [
  { emoji: "👍", label: "Fine" },
  { emoji: "🥱", label: "Fatigue" },
  { emoji: "🌙", label: "Insomnia" },
  { emoji: "😖", label: "Cramps" },
  { emoji: "🤕", label: "Headache" },
  { emoji: "🤰", label: "Abdominal Pain" },
  { emoji: "🌸", label: "Acne" },
  { emoji: "😣", label: "Tender Breast" },
  { emoji: "💧", label: "Swelling" },
  { emoji: "🍫", label: "Cravings" },
  { emoji: "🤢", label: "Nausea" },
  { emoji: "🔥", label: "Heartburn" },
  { emoji: "🐌", label: "Constipation" },
  { emoji: "💦", label: "Diarrhea" },
  { emoji: "🩸", label: "Vaginal Discharge" },
  { emoji: "😵", label: "Dizziness" },
  { emoji: "🚻", label: "Frequent Urination" },
  { emoji: "😮‍💨", label: "Shortness of Breath" },
  { emoji: "🤮", label: "Morning Sickness" },
];

export function findLogEmoji(label: string): string | undefined {
  return [...MOOD_OPTIONS, ...SYMPTOM_OPTIONS].find((o) => o.label === label)
    ?.emoji;
}
