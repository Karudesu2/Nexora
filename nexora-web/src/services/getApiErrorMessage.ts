import axios from "axios";

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  if (error.code === "ERR_API_CONFIGURATION") {
    return "NEXORA is not configured with a production API address. Please contact the administrator.";
  }

  if (!error.response) {
    return ["ECONNABORTED", "ETIMEDOUT"].includes(error.code || "")
      ? "The API took too long to respond. Please try again in a moment."
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
