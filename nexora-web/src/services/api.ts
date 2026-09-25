import axios from "axios";
import { clearAuthToken, getAuthToken, markSessionExpired } from "./authToken";
import { updateApiDiagnostics } from "./apiDiagnostics";
import { getApiErrorMessage, isRequestCanceled } from "./getApiErrorMessage";

export const sessionExpiredEvent = "nexora:session-expired";

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || (import.meta.env.DEV ? "/api/v1" : "");

const apiConfigurationErrorCode = "ERR_API_CONFIGURATION";
const requestTimings = new WeakMap<object, { startedAt: number; timestamp: string }>();

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
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
    const startedAt = Date.now();
    const timestamp = new Date(startedAt).toISOString();
    const fullUrl = api.getUri(config);

    requestTimings.set(config, { startedAt, timestamp });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.debug("NEXORA API request", {
        method: config.method?.toUpperCase() || "GET",
        url: fullUrl,
        tokenExists: Boolean(token),
        timestamp,
      });
    }

    return config;
  },
  (error) => {
    if (import.meta.env.DEV && !axios.isCancel(error)) {
      console.error("NEXORA API request setup failed", error);
    }

    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    const timing = requestTimings.get(response.config);

    if (timing) {
      requestTimings.delete(response.config);
    }

    if (import.meta.env.DEV) {
      console.debug("NEXORA API response", {
        status: response.status,
        endpoint: api.getUri(response.config),
        responseTimeMs: timing ? Date.now() - timing.startedAt : undefined,
      });
    }

    return response;
  },

  (error) => {
    if (isRequestCanceled(error)) {
      return Promise.reject(error);
    }

    const endpoint = error.config ? api.getUri(error.config) : "Unknown endpoint";
    const timing = error.config ? requestTimings.get(error.config) : undefined;

    if (error.config) {
      requestTimings.delete(error.config);
    }

    if (import.meta.env.DEV) {
      console.error("NEXORA API request failed", {
        endpoint,
        status: error.response?.status,
        responseTimeMs: timing ? Date.now() - timing.startedAt : undefined,
        timestamp: timing?.timestamp,
        message: getApiErrorMessage(error, "The request failed."),
      });
    }

    updateApiDiagnostics({
      lastApiError: getApiErrorMessage(error, "The request failed."),
      failedEndpoint: endpoint,
    });

    const isAuthenticationRequest = [
      "/auth/login",
      "/auth/register",
    ].some((path) => error.config?.url?.endsWith(path));

    const requestAuthorization = error.config?.headers?.Authorization;
    const currentToken = getAuthToken();
    const requestUsesCurrentToken = Boolean(currentToken)
      && requestAuthorization === `Bearer ${currentToken}`;

    if (error.response?.status === 401 && !isAuthenticationRequest && requestUsesCurrentToken) {
      clearAuthToken();
      markSessionExpired();
      window.dispatchEvent(new Event(sessionExpiredEvent));
    }

    return Promise.reject(error);
  },
);

export default api;
