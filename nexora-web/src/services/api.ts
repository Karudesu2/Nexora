import axios from "axios";
import { clearAuthToken, getAuthToken, markSessionExpired } from "./authToken";

export const sessionExpiredEvent = "nexora:session-expired";
const apiBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api/v1" : "");
const apiConfigurationErrorCode = "ERR_API_CONFIGURATION";

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (!apiBaseUrl) {
    return Promise.reject(
      new axios.AxiosError(
        "VITE_API_URL must be configured for production builds.",
        apiConfigurationErrorCode,
        config,
      ),
    );
  }

  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthenticationRequest = ["/auth/login", "/auth/register"].some(
      (path) => error.config?.url?.endsWith(path),
    );

    if (error.response?.status === 401 && !isAuthenticationRequest) {
      clearAuthToken();
      markSessionExpired();
      window.dispatchEvent(new Event(sessionExpiredEvent));
    }

    return Promise.reject(error);
  },
);

export default api;
