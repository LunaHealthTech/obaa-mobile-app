import { apiClient } from "@/lib/apiClient";
import type {
  CreateLogPayload,
  GetLogsParams,
  LogEntry,
} from "@/types/menstrual.types";

export async function getLogs(params: GetLogsParams = {}) {
  const res = await apiClient.get<LogEntry[]>("/logs/", { params });
  return res.data;
}

export async function createLog(payload: CreateLogPayload) {
  const res = await apiClient.post<LogEntry>("/logs/", payload);
  return res.data;
}

export async function updateLog(payload: CreateLogPayload) {
  const res = await apiClient.put<LogEntry>("/logs/", payload);
  return res.data;
}
