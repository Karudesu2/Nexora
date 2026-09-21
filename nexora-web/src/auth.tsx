import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "./services/api";

const tokenStorageKey = "nexora_token";

interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface LoginResponse {
  data: {
    token: string;
    user: AuthUser;
  };
}

interface ProfileResponse {
  data: {
    user: AuthUser;
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (!sessionStorage.getItem(tokenStorageKey)) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<ProfileResponse>("/auth/profile");
        setUser(response.data.data.user);
      } catch {
        sessionStorage.removeItem(tokenStorageKey);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    sessionStorage.setItem(tokenStorageKey, response.data.data.token);
    setUser(response.data.data.user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      sessionStorage.removeItem(tokenStorageKey);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
