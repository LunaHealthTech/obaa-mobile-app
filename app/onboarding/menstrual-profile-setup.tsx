import { View, Text } from "react-native";
import { useState } from "react";
import { useForm, Controller, Control, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MenstrualProfileSchema } from "@/lib/FormSchemas";
import WheelPicker from "@quidone/react-native-wheel-picker";
import { MultiStepButton } from "@/components/MultiStepButton";
import { toast } from "sonner-native";
import { DateInput } from "@/components/DateInput";
import { useMenstrualProfileViewModel } from "@/viewmodel/useMenstrualProfile";

interface FormValues {
  cycle_length: number;
  period_length: number;
  cycle_pattern?: boolean;
  last_period_start: Date;
  notification_pref?: number;
}

interface QuestionProps {
  control: Control<FormValues>;
  errors?: FieldErrors<FormValues>;
}

interface QuestionHeaderProps {
  mainText: string;
  subText: string;
}

const QuestionData = [
  {
    main: "How long does your cycle usually last",
    desc: "Most women’s cycles last between 26–32 days, with 28 being the average",
  },
  {
    main: "How many days does your period usually last",
    desc: "Most periods last 3–7 days. If yours is sometimes shorter or longer, just choose the number that feels most typical for you.",
  },
  // {
  //   main: "Tell us about your cycle pattern",
  //   desc: "Cycles can be regular or irregular, and both are completely normal.",
  // },
  {
    main: "When did your last period start?",
    desc: "Think back to the first day of bleeding. If you don’t remember exactly, it’s okay. Just give your best estimate.",
  },
];

export default function MenstrualProfileSetup() {
  const [step, setStep] = useState(0);
  const { createMenstrualProfile, isCreating } = useMenstrualProfileViewModel();
  const maxSteps = QuestionData.length - 1;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(MenstrualProfileSchema),
    defaultValues: {
      cycle_length: 28,
      period_length: 5,
      last_period_start: new Date(),
    },
  });

  const forwardPress = () => {
    if (step < maxSteps) {
      setStep((s) => s + 1);
    } else {
      handleSubmit(
        (data) => {
          toast.loading("Creating profile");
          console.log("Profile data", { data });
          return createMenstrualProfile(data);
        },
        (errs) => {
          // Client side error display: more like input error handling
          toast.dismiss();
          if (step >= 2) {
            // console.log({ errs });
            for (const err in errs) {
              toast.error(errs[err].message);
            }
          }
        },
      )();
    }
  };

  const backPress = () => {
    if (step >= 1) setStep((s) => s - 1);
  };

  const onboardingFlow = [
    <CycleLengthQuestion control={control} errors={errors} />,
    <PeriodLengthQuestion control={control} errors={errors} />,
    <LastPeriodStart control={control} errors={errors} />,
    <NotificationPrefQuestion control={control} errors={errors} />,
  ];

  return (
    <View className={"px-8 flex-1"}>
      <View className={"flex-1 my-10 justify-between"}>
        <QuestionHeader
          mainText={QuestionData[step]["main"]}
          subText={QuestionData[step]["desc"]}
        />

        <View className={"justify-between h-[70%]"}>
          {onboardingFlow[step]}

          <MultiStepButton
            maxSteps={maxSteps}
            step={step}
            forwardPress={forwardPress}
            backPress={backPress}
            completionMsg={"Create your profile"}
          />
        </View>
      </View>
    </View>
  );
}

function QuestionHeader({ mainText, subText }: QuestionHeaderProps) {
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
    <>
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
    </>
  );
}

function PeriodLengthQuestion({ control, errors }: QuestionProps) {
  const data = [...Array(40).keys()].map((index) => ({
    value: index,
    label: index.toString(),
  }));
  return (
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
  );
}

function CycleRegularityQuestion({ control }: QuestionProps) {
  return (
    <View>
      <View>
        <Text>Something</Text>
        <Text>Something</Text>
      </View>
    </View>
  );
}

function LastPeriodStart({ control }: QuestionProps) {
  return (
    <View>
      <Text>Last Menstrual Period Date</Text>
      <Controller
        name="last_period_start"
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <>
            <DateInput
              value={value}
              onChange={(val: string) => {
                // console.log({ signUpSteps });
                // setSignUpItem({ ...signUpSteps, date_of_birth: val });
                onChange(val);
              }}
              error={error?.message}
            />
          </>
        )}
      />
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
