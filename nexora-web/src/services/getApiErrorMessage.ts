import axios from "axios";

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  if (!error.response) {
    return error.code === "ECONNABORTED"
      ? "The request timed out. Please try again."
      : "Unable to connect to NEXORA. Check your connection and try again.";
  }

  const response = error.response?.data;
  const validationMessage = response?.errors
    ? Object.values(response.errors).flat()[0]
    : undefined;

  if (validationMessage) {
    return validationMessage;
  }

  if (error.response.status >= 500) {
    return "Something went wrong on the server. Please try again.";
  }

  return response?.message || fallback;
}
