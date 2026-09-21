import axios from "axios";

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const response = error.response?.data;
  const validationMessage = response?.errors
    ? Object.values(response.errors).flat()[0]
    : undefined;

  return validationMessage || response?.message || fallback;
}
