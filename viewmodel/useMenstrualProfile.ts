import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  createMenstrualProfile,
  getMenstrualInfo,
  updateMenstrualInfo,
} from "@/services/menstrualService";
import { toast } from "sonner-native";
import { router } from "expo-router";
import { differenceInDays, isAfter, isBefore } from "date-fns";
import { useConfirmedCycleStore } from "@/repositories/useConfirmedCycleStore";

export function useMenstrualProfileViewModel() {
  const assumedRanges = useConfirmedCycleStore((s) => s.ranges);
  const queryKey = ["/menstrual/profile/"];
  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey,
    queryFn: getMenstrualInfo,
    select: (data) => {
      const yourPeriodStartedCount = differenceInDays(
        new Date(),
        data.current_cycle.start_date,
      );
      const assumedRange = assumedRanges[data.current_cycle.id];
      const isWithinAssumedBleed =
        !!assumedRange &&
        !isAfter(new Date(), new Date(assumedRange.bleedEndDate));
      let res = {
        currentCycleId: data.current_cycle.id,
        general: {
          cycleLength: data.cycle_length,
          periodLength: data.period_length,
          status: data.status,
          yourPeriodStarted: `${yourPeriodStartedCount} day${yourPeriodStartedCount > 1 && "s"} ago`,
          pregnancyProbability: data.current_cycle.pregnancy_probability,
        },
        calendarPage: {
          isCycleStale: isWithinAssumedBleed
            ? false
            : data.current_cycle.current_phase === "completed",
          isWithinCycleStartWindow: !isBefore(
            new Date(),
            new Date(data.next_cycle_start_window.lower),
          ),
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
    refetch,
  };
}
