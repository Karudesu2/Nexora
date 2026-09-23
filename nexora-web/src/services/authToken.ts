export const authTokenStorageKey = "nexora_token";
const legacyTokenStorageKey = "token";
const sessionExpiredStorageKey = "nexora_session_expired";

export function getAuthToken(): string | null {
  const token = localStorage.getItem(authTokenStorageKey);

  if (token) return token;

  // Keep existing sessions from earlier web builds working after deployment.
  const legacyToken = localStorage.getItem(legacyTokenStorageKey);
  if (legacyToken) {
    localStorage.setItem(authTokenStorageKey, legacyToken);
    localStorage.removeItem(legacyTokenStorageKey);
  }

  return legacyToken;
}

export function saveAuthToken(token: string): void {
  localStorage.setItem(authTokenStorageKey, token);
  localStorage.removeItem(legacyTokenStorageKey);
  sessionStorage.removeItem(sessionExpiredStorageKey);
}

export function clearAuthToken(): void {
  localStorage.removeItem(authTokenStorageKey);
  localStorage.removeItem(legacyTokenStorageKey);
}

export function markSessionExpired(): void {
  sessionStorage.setItem(sessionExpiredStorageKey, "1");
}

export function hasExpiredSession(): boolean {
  return sessionStorage.getItem(sessionExpiredStorageKey) === "1";
}
