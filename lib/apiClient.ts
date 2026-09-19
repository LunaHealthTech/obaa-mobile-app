import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { TokenStorage } from "@/services/tokenStorage";
import { useAuthStore } from "@/repositories/useAuthStore";

// DRF validation errors are typically { field: ["message", ...] } or { detail: "message" }.
export function extractErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const data = (error as AxiosError)?.response?.data as
    | Record<string, unknown>
    | string
    | undefined;

  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;

  const firstFieldError = Object.values(data).find(
    (value) => Array.isArray(value) && typeof value[0] === "string",
  ) as string[] | undefined;
  if (firstFieldError) return firstFieldError[0];

  return fallback;
}

// const BASE_URL = "http://10.0.2.2:8000/api/v1"; // TODO: find a replacement for this
const BASE_URL = "http://localhost:8000/api/v1"; 
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request Interceptor
// Attach access token to every request
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await TokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor
// Handle 401s by attempting a token refresh once, then logging out
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[apiClient] ${response.config.method?.toUpperCase()} ${response.config.url} -> ${response.status}`,
      response.data,
    );
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response) {
      console.error(
        `[apiClient] ${originalRequest.method?.toUpperCase()} ${originalRequest.url} -> ${error.response.status}`,
        error.response.data,
      );
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await TokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token");

      // Call your refresh endpoint directly with plain axios to avoid loops
      // Field names here (`refresh` in, `access` out) match the backend's
      // TokenRefresh schema, NOT the login endpoint's `tokens.access`/`tokens.refresh`
      // shape — the two responses are intentionally differently named.
      const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
        refresh: refreshToken,
      });

      const { access, refresh } = data;
      await TokenStorage.saveTokens(access, refresh ?? refreshToken);

      // Update auth store with new access token
      useAuthStore.getState().setToken(access);

      processQueue(null, access);

      originalRequest.headers.Authorization = `Bearer ${access}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Refresh failed — force logout
      await useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
