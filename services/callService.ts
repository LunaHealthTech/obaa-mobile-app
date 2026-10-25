import { apiClient } from "@/lib/apiClient";
import type { CallDTO, TurnCredentials } from "@/types/call.types";

export async function getTurnCredentials() {
  const { data } = await apiClient.get<TurnCredentials>("/calls/turn-credentials/");
  return data;
}

export async function getRecentCalls() {
  const { data } = await apiClient.get<{ results: CallDTO[] }>("/calls/history/");
  return data.results;
}
