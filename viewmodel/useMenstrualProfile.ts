import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  createMenstrualProfile,
  getMenstrualInfo,
  updateMenstrualInfo,
} from "@/services/menstrualService";
import { toast } from "sonner-native";
import { router } from "expo-router";
import { generateDays } from "@/lib/CalendarHelpers";

export function useMenstrualProfileViewModel() {
  const queryKey = ["/menstrual/profile/"];
  const { data, isLoading, error, isError } = useQuery({
    queryKey,
    queryFn: getMenstrualInfo,
    select: (data) => {
      let res = {
        general: {
          cycleLength: data.cycle_length,
          periodLength: data.period_length,
          status: data.status,
          yourPeriodStarted: "2 days ago", // TODO: fix this
          pregnancyProbability: data.current_cycle.pregnancy_probability,
        },
      };
      return res;
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: updateMenstrualInfo,
    onSuccess: () => {
      toast.dismiss();
      queryClient.invalidateQueries({ queryKey });
      toast.success("Successfully created profile");
    },
    onError: (error) => {
      toast.dismiss();
      toast.error("Error !");
    },
  });

  const createMutation = useMutation({
    mutationFn: createMenstrualProfile,
    onSuccess: () => {
      toast.dismiss();
      queryClient.invalidateQueries({ queryKey });
      toast.success("Successfully created profile");
      router.replace("/(tabs)/home");
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(
        "Something went wrong creating profile.\n Kindly restart app and try again.",
      );
    },
  });

  return {
    data,
    isLoading,
    createMenstrualProfile: createMutation.mutate,
    isCreating: createMutation.isPending,
    errorCreating: createMutation.isError,
    updateUserMenstrualInfo: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    error,
    isError,
  };
}
