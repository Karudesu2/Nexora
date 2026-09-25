export type AuthenticationStatus = "checking" | "authenticated" | "signed out" | "error";

export interface ApiDiagnostics {
  apiUrl: string;
  authenticationStatus: AuthenticationStatus;
  tokenExists: boolean;
  lastApiError: string | null;
  failedEndpoint: string | null;
}

let diagnostics: ApiDiagnostics = {
  apiUrl: import.meta.env.VITE_API_URL?.trim() || (import.meta.env.DEV ? "/api/v1" : "Not configured"),
  authenticationStatus: "checking",
  tokenExists: false,
  lastApiError: null,
  failedEndpoint: null,
};

const listeners = new Set<() => void>();

export function getApiDiagnostics(): ApiDiagnostics {
  return diagnostics;
}

export function subscribeToApiDiagnostics(listener: () => void): () => void {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function updateApiDiagnostics(updates: Partial<ApiDiagnostics>): void {
  diagnostics = { ...diagnostics, ...updates };
  listeners.forEach((listener) => listener());
}
