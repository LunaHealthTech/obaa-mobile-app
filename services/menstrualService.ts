import { apiClient } from "@/lib/apiClient";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandMMKVStorage } from "@/services/mmkvStorage";
import type { MenstrualProfileInfo } from "@/types/menstrual.types";

interface MenstrualStorage {
  menstrualProfileInfo: MenstrualProfileInfo | null;
  menstrualCycles: string[];
  setMenstrualProfileInfo: (
    menstrualProfileInfo: MenstrualProfileInfo | null,
  ) => void;
  setMenstrualCycles: (menstrualCycles: MenstrualProfileInfo[]) => void; // todo: change this
}

export async function getMenstrualInfo() {
  const res = await apiClient.get("/menstrual/profile");
  console.log(res.data);
  return res.data;
}

export async function updateMenstrualInfo(payload) {
  const res = await apiClient.put("/menstrual/profile", payload);
  console.log({ res });
  return res.data;
}

export async function createMenstrualProfile(payload) {
  const res = await apiClient.post("/menstrual/profile", payload);
  console.log({ res });
  return res.data;
}

export const useMenstrualStore = create<MenstrualStorage>()(
  persist(
    (set) => ({
      menstrualProfileInfo: null,
      menstrualCycles: [],
      setMenstrualProfileInfo: (
        menstrualProfileInfo: MenstrualStorage["menstrualProfileInfo"],
      ) => set({ menstrualProfileInfo }),
      setMenstrualCycles: (menstrualCycles) => set({ menstrualCycles }),
    }),
    {
      name: "menstrual-info-store",
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
