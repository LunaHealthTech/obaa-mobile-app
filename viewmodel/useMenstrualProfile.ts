import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  createMenstrualProfile,
  getMenstrualInfo,
  updateMenstrualInfo,
} from "@/services/menstrualService";
import { toast } from "sonner-native";

export function useMenstrualProfileViewModel() {
  const queryKey = ["/menstrual/profile/"];
  const { data, isLoading, error, isError } = useQuery({
    queryKey,
    queryFn: getMenstrualInfo,
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
      toast.error("Error !");
    },
  });

  const createMutation = useMutation({
    mutationFn: createMenstrualProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error) => {
      console.log(`Error in createMutation: Profile creation`, error);
      toast.error("Error !");
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
