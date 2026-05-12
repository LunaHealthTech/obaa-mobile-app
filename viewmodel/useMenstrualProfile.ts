import { useMutation, useQuery } from "@tanstack/react-query";
import { userRepository } from "@/repositories/userRepository";
import { queryClient } from "@/lib/queryClient";
import {
  getMenstrualInfo,
  updateMenstrualInfo,
} from "@/services/menstrualService";

export function useMenstrualProfileViewModel() {
  const queryKey = ["/menstrual/profile"];
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: getMenstrualInfo,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: updateMenstrualInfo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    data,
    isLoading,
    updateUserMenstrualInfo: createMutation.mutate,
    isUpdating: createMutation.isPending,
  };
}
