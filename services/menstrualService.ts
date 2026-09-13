import { apiClient } from "@/lib/apiClient";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandMMKVStorage } from "@/services/mmkvStorage";
import { format } from "date-fns";
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
  const res = await apiClient.get("/menstrual/profile/");
  console.log({ res });
  return res.data;
}

export async function updateMenstrualInfo(payload) {
  const res = await apiClient.put("/menstrual/profile/", payload); // TODO : remove this
  console.log({ res });
  return res.data;
}

export async function createMenstrualProfile(payload) {
  console.log("Menstrual profile information", { payload });
  const updatedPayload = {
    ...payload,
    last_period_start: format(payload.last_period_start, "yyyy-MM-dd"),
  };
  const res = await apiClient.post("/menstrual/profile/", updatedPayload);
  return res.data;
}

export async function getMenstrualCycles() {
  const res = await apiClient.get("/menstrual/cycles/");
  return res.data;
}

export async function startCycle(payload: { start_date: string }) {
  const res = await apiClient.post("/menstrual/cycles/start/", payload);
  return res.data;
}

export type UpdateCyclePayload = Partial<{
  start_date: string;
  bleed_end_date: string;
  end_date: string;
  predicted: boolean;
  paused: boolean;
}>;

export async function updateCycle(id: number, payload: UpdateCyclePayload) {
  const res = await apiClient.put(`/menstrual/cycles/${id}/`, payload);
  return res.data;
}

export async function endPeriod(payload: { end_date: string }) {
  const res = await apiClient.post(
    "/menstrual/cycles/end-period/",
    payload,
  );
  return res.data;
}


// ============ LocalStorage =======================
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
