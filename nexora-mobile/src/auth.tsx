import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

const baseUrl = process.env.EXPO_PUBLIC_NEXORA_API_URL ?? 'http://10.0.2.2:8000/api/v1';

interface MobileUser {
  id: number;
  name: string;
  email: string;
}

interface ApiEnvelope<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

interface AuthContextValue {
  user: MobileUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  request: <T>(path: string, options?: RequestInit) => Promise<T>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok) {
    const validationMessage = payload.errors
      ? Object.values(payload.errors).flat()[0]
      : undefined;
    throw new Error(validationMessage || payload.message || 'Request failed.');
  }

  return payload.data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MobileUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const request = useCallback(async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    return parseResponse<T>(response);
  }, [token]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    request,
    login: async (email: string, password: string) => {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseResponse<{ token: string; user: MobileUser }>(response);
      setToken(data.token);
      setUser(data.user);
    },
    logout: async () => {
      if (token) {
        await fetch(`${baseUrl}/auth/logout`, {
          method: 'POST',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        });
      }
      setToken(null);
      setUser(null);
    },
  }), [request, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
