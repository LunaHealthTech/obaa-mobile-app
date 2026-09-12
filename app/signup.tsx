import { View, Text, Image, TextInput, Pressable } from "react-native";
import { Stack, Link } from "expo-router";
import { appLogo, eyeIcon, messageIcon, ProfileIcon } from "@/constants/assets";
import { useForm, Controller, Control, FieldErrors } from "react-hook-form";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { toast } from "sonner-native";
import { PhoneInput } from "@/components/PhoneInput";
import { SignUpSchema } from "@/lib/FormSchemas";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DateInput } from "@/components/DateInput";
import { useAuth } from "@/viewmodel/useAuth";
import { AuthState } from "@/types/auth.types";
import { Body, ButtonText, PageTitle } from "@/components/Typography";

type FormValues = {
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  password: string;
  email: string;
  phone_number: string;
};

type StepProps = {
  control: Control<FormValues>;
  signUpSteps: AuthState["signUpItems"];
  setSignUpItem: AuthState["setSignUpItem"];
  errors?: FieldErrors<FormValues>;
};

export default function SignUp() {
  const maxSteps = 2;
  const { register, registerPending, signUpSteps, setSignUpItem } = useAuth();
  const [step, setStep] = useState<number>(0);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone_number: "+233",
      date_of_birth: new Date(),
    },
  });
  // @ts-ignore
  const steps = [
    <Step1
      control={control}
      signUpSteps={signUpSteps}
      setSignUpItem={setSignUpItem}
      errors={errors}
    />,
    <Step2
      control={control}
      signUpSteps={signUpSteps}
      setSignUpItem={setSignUpItem}
      errors={errors}
    />,
    <Step3
      control={control}
      signUpSteps={signUpSteps}
      setSignUpItem={setSignUpItem}
      // @ts-ignore
      errors={errors}
    />,
  ];

  return (
    <View className={"flex-1 w-full bg-white text-mainText"}>
      <Stack.Screen
        options={{
          headerShadowVisible: false,
          title: "",
          headerLeft: () => (
            <Link href={"/intro"}>
              <Ionicons name={"chevron-back"} size={24} color={"black"} />
            </Link>
          ),
        }}
      />
      {/*  The header */}
      <View>
        <View className="flex flex-col gap-4 items-center my-10">
          {/* Logo circle */}
          <View className="bg-primary rounded-full w-[100px] h-[100px] flex items-center justify-center p-2">
            <Image
              source={appLogo}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>

          <PageTitle>Register with us</PageTitle>
          <Body className="text-subText">
            Sign up to be able to access your page
          </Body>
        </View>
      </View>

      {/*    The Form  */}
      <View className={"px-8 flex gap-10"}>{steps[step]}</View>
      {/*  Terms and Conditions */}
      <View className={"absolute bottom-10 px-8 flex gap-5"}>
        <View className={"flex gap-4"}>
          <Pressable
            onPress={() => {
              if (step < maxSteps) {
                setStep((s) => s + 1);
              } else {
                handleSubmit(
                  (data) => {
                    register(data);
                  },
                  (errs) => {
                    // Client side error display
                    if (step >= 2) {
                      for (const err in errs) {
                        toast.error(errs[err].message);
                      }
                    }
                  },
                )();
              }
            }}
            className={
              "bg-primaryColor text-white w-[360px] h-[62px] rounded-full flex items-center justify-center active:opacity-80"
            }
          >
            <ButtonText className={"text-white"}>
              {step === maxSteps ? "Create your account" : "Next"}
            </ButtonText>
          </Pressable>

          {step !== 0 && (
            <Pressable
              onPress={() => {
                if (step >= 1) setStep((s) => s - 1);
              }}
              className={
                "bg-white w-[360px] h-[62px] border-2 border-primaryColor rounded-full flex items-center justify-center active:opacity-80"
              }
            >
              <View
                className={" flex flex-row items-center justify-center gap-2"}
              >
                <FontAwesome name="long-arrow-left" size={24} color="#0F969C" />
                <ButtonText className={"text-primaryColor"}>back</ButtonText>
              </View>
            </Pressable>
          )}
        </View>
        <Body className={"text-center"}>
          By submitting this form to create a TTYM Global account, you agree to
          the <Text className={"text-primaryColor"}>Terms and Conditions</Text>{" "}
          and <Text className={"text-primaryColor"}>Privacy Policy</Text>
        </Body>
      </View>
    </View>
  );
}

function Step1({ control, signUpSteps, setSignUpItem, errors }: StepProps) {
  return (
    <>
      <View>
        <Body>First Name</Body>
        <View
          className={
            "bg-white border border-[#999999] mt-2 rounded-md flex flex-row gap-2 items-center px-2"
          }
        >
          <Image source={ProfileIcon} width={20} height={20} />
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                placeholder={"First Name"}
                value={value}
                onChangeText={(val: string) => {
                  console.log({ signUpSteps });
                  setSignUpItem({ ...signUpSteps, first_name: val });
                  onChange(val);
                }}
                onBlur={onBlur}
              />
            )}
            name={"first_name"}
          />
          {errors?.first_name && <Body>{errors?.first_name.message}</Body>}
        </View>
      </View>
      <View>
        <Body>Last Name</Body>
        <View
          className={
            "bg-white border border-[#999999] mt-2 rounded-md flex flex-row gap-2 items-center px-2"
          }
        >
          <Controller
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <>
                <TextInput
                  placeholder="Last Name"
                  value={value}
                  onChangeText={(val: string) => {
                    console.log({ signUpSteps });
                    setSignUpItem({ ...signUpSteps, last_name: val });
                    onChange(val);
                  }}
                  onBlur={onBlur}
                />
                {errors?.last_name && (
                  <Body className={"text-red-500"}>
                    {errors?.last_name.message}
                  </Body>
                )}
              </>
            )}
            name={"last_name"}
          />
        </View>
      </View>
    </>
  );
}

function Step2({ control, signUpSteps, setSignUpItem }: StepProps) {
  return (
    <>
      <View>
        <Body>Date of Birth</Body>
        <Controller
          name="date_of_birth"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <>
              <DateInput
                value={value}
                onChange={(val: string) => {
                  console.log({ signUpSteps });
                  setSignUpItem({ ...signUpSteps, date_of_birth: val });
                  onChange(val);
                }}
                error={error?.message}
              />
            </>
          )}
        />
      </View>
      <View>
        <Body>Email</Body>
        <View
          className={
            "bg-white border border-[#999999] mt-2 rounded-md flex flex-row gap-2 items-center px-2"
          }
        >
          <Image source={messageIcon} width={20} height={20} />
          <Controller
            control={control}
            render={({
              field: { value, onChange, onBlur },
              fieldState: { error },
            }) => (
              <>
                <TextInput
                  placeholder="Eg. jon@gmail.com"
                  value={value}
                  onChangeText={(val: string) => {
                    console.log({ signUpSteps });
                    setSignUpItem({ ...signUpSteps, email: val });
                    onChange(val);
                  }}
                  onBlur={onBlur}
                />
                <Body>{error?.message}</Body>
              </>
            )}
            name={"email"}
          />
        </View>
      </View>
    </>
  );
}

function Step3({ control, signUpSteps, setSignUpItem, errors }: StepProps) {
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  return (
    <>
      <View>
        <Body>Phone number</Body>
        <View>
          <Controller
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <>
                <PhoneInput
                  value={value}
                  onChange={(val: string) => {
                    console.log({ signUpSteps });
                    setSignUpItem({ ...signUpSteps, phone_number: val });
                    onChange(val);
                  }}
                  error={error?.message}
                />
              </>
            )}
            name={"phone_number"}
          />
        </View>
      </View>
      <View>
        <Body>Password</Body>
        <View
          className={
            "bg-white border border-[#999999] mt-2 rounded-md flex flex-row gap-2 items-center px-2"
          }
        >
          <MaterialIcons name="lock-outline" size={20} color="#999999" />
          <Controller
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  className={"bg-white flex-1 border-none"}
                  secureTextEntry={hidePassword}
                  placeholder={"••••••••••••••••"}
                />
              </>
            )}
            name={"password"}
          />

          <Pressable
            className={"active:opacity-70"}
            onPress={() => {
              setHidePassword(!hidePassword);
            }}
          >
            <Image source={eyeIcon} height={20} width={20} />
          </Pressable>
        </View>
        {errors?.password?.message && (
          <Body className="text-red-500 mt-6">
            {errors?.password.message}
          </Body>
        )}
      </View>
    </>
  );
}
