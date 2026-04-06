import { z } from "zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "@/lib/auth";
import { isValidNumber } from "react-native-phone-entry";

export const SignUpSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/\d/, { message: "Password must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character",
    }),
  // confirm_password: z
  //   .string()
  //   .min(8, { message: "Password must be at least 8 characters long" })
  //   .regex(/[a-z]/, {
  //     message: "Password must contain at least one lowercase letter",
  //   })
  //   .regex(/[A-Z]/, {
  //     message: "Password must contain at least one uppercase letter",
  //   })
  //   .regex(/\d/, { message: "Password must contain at least one number" })
  //   .regex(/[^a-zA-Z0-9]/, {
  //     message: "Password must contain at least one special character",
  //   }),
  first_name: z.string().min(2, { message: "Invalid first name." }).trim(),
  last_name: z.string().min(2, { message: "Invalid last name." }).trim(),
  // phone_number: z.string().regex(/^\+\d{1,3}\d{7,14}$/, {
  //   message: "Please enter a valid phone number.",
  // }),
  date_of_birth: z.date().max(new Date(), "Date cannot be in the future"),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (val) => /^\+233[^0]\d{8}$/.test(val),
      "Enter a valid Ghanaian number",
    ),
  // phone_number: z
  //   .string()
  //   .refine(
  //     (val) => isValidNumber(val, "GH"),
  //     "Sorry, we are not available in your region yet",
  //   ),
});

export const loginSchema = z.object({
  email: z
    .email({ message: "Not a valid email" })
    .min(1, "too short for an email"),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/\d/, { message: "Password must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character",
    }),
});
