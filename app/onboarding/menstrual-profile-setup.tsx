import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { useForm, Controller, Control, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MenstrualProfileSchema } from "@/lib/FormSchemas";
import WheelPicker from "@quidone/react-native-wheel-picker";

interface FormValues {
  cycle_length: number;
  period_length: number;
}

interface QuestionProps {
  control: Control<FormValues>;
  errors?: FieldErrors<FormValues>;
}

export default function MenstrualProfileSetup() {
  const [step, setStep] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(MenstrualProfileSchema),
    defaultValues: {},
  });
  const onboardingFlow = [
    <CycleLengthQuestion control={control} errors={errors} />,
    <PeriodLengthQuestion control={control} errors={errors} />,
    <CycleRegularityQuestion control={control} errors={errors} />,
    <UsualSymptomsQuestion control={control} errors={errors} />,
    <NotificationPrefQuestion control={control} errors={errors} />,
  ];

  return <View className={"px-8"}>{onboardingFlow[step]}</View>;
}

function QuestionHeader({ mainText, subText }) {
  return (
    <View className={"items-center justify-center my-10"}>
      <Text className={"text-2xl font-bold flex items-center text-center "}>
        {mainText}
      </Text>
      <Text className={"flex text-center"}>{subText}</Text>
    </View>
  );
}

function CycleLengthQuestion({ control, errors }: QuestionProps) {
  const data = [...Array(40).keys()].map((index) => ({
    value: index,
    label: index.toString(),
  }));
  return (
    <View className={"my-10 justify-center"}>
      <View className={"items-center justify-center my-10"}>
        <Text className={"text-2xl font-bold flex items-center text-center "}>
          How long does your cycle usually last
        </Text>
        <Text className={"flex text-center"}>
          Most women’s cycles last between 26–32 days, with 28 being the average
        </Text>
      </View>

      <View>
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <WheelPicker
                data={data}
                value={value}
                onValueChanged={({ item: { value } }) => onChange(value)}
                enableScrollByTapOnItem={true}
              />
            );
          }}
          name={"cycle_length"}
        />
        {errors?.cycle_length && <Text>{errors?.cycle_length.message}</Text>}
        <View className={"flex"}>
          <Pressable
            onPress={() => {
              // router.navigate("/onboarding/menstrual-profile-setup");
            }}
            className={
              "bg-primaryColor text-white w-[360px] h-[62px] rounded-full flex items-center justify-center active:opacity-80"
            }
          >
            <Text className={"text-white text-lg font-semibold"}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function PeriodLengthQuestion({ control, errors }: QuestionProps) {
  const data = [...Array(40).keys()].map((index) => ({
    value: index,
    label: index.toString(),
  }));
  return (
    <View>
      <View>
        <QuestionHeader
          mainText={"How many days does your period usually last"}
          subText={
            "Most periods last 3–7 days. If yours is sometimes shorter or longer, just choose the number that feels most typical for you."
          }
        />
      </View>
      <View>
        <Controller
          name={"period_length"}
          control={control}
          render={({ field: { value, onChange } }) => {
            return (
              <WheelPicker
                data={data}
                value={value}
                onValueChanged={({ item: { value } }) => onChange(value)}
                enableScrollByTapOnItem={true}
              />
            );
          }}
        />
        {errors?.period_length && <Text>{errors?.period_length.message}</Text>}
      </View>
    </View>
  );
}

function CycleRegularityQuestion({ control }) {
  return (
    <View>
      <View>
        <Text>Something</Text>
        <Text>Something</Text>
      </View>
    </View>
  );
}

function UsualSymptomsQuestion() {
  return (
    <View>
      <View>
        <Text>Something</Text>
        <Text>Something</Text>
      </View>
    </View>
  );
}

function NotificationPrefQuestion() {
  return (
    <View>
      <View>
        <Text>Something</Text>
        <Text>Something</Text>
      </View>
    </View>
  );
}
