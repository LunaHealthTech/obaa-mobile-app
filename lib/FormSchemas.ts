import { z } from "zod";
import { subMonths, subYears } from "date-fns";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/repositories/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "@/services/authService";

export const passwordSchema = z
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
  });

export const SignUpSchema = z.object({
  email: z.email({ message: "Email is invalid" }),
  password: passwordSchema,
  first_name: z.string().min(2, { message: "Invalid first name." }).trim(),
  last_name: z.string().min(2, { message: "Invalid last name." }).trim(),
  date_of_birth: z
    .date()
    .max(subYears(new Date(), 13), "You must be at least 13 years old"),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (val) => /^\+233[^0]\d{8}$/.test(val),
      "Enter a valid Ghanaian number",
    ),
});

export const loginSchema = z.object({
  email: z
    .email({ message: "Not a valid email" })
    .min(1, "too short for an email"),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export const MenstrualProfileSchema = z.object({
  cycle_length: z.number().min(5, "Invalid cycle length"),
  period_length: z.number().min(1, "Invalid period length"),
  last_period_start: z
    .date()
    .max(new Date(), "Date cannot be in the future")
    .min(subMonths(new Date(), 2), "Date can't be more than 2 months ago"),
  // notification_pref: z.number().min(0, "Invalid notification pref"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .email({ message: "Not a valid email" })
    .min(1, "too short for an email"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
