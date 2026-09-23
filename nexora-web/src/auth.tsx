
/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import api from "./services/api";
import { clearAuthToken, getAuthToken, saveAuthToken } from "./services/authToken";
import { sessionExpiredEvent } from "./services/api";

interface AuthUser {
  id: number;
  name: string;
  role_codes?: string[];
  email: string;
}

interface RegistrationPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface AuthenticationResponse {
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

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegistrationPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const response = await api.get<ProfileResponse>("/auth/profile");

    setUser(response.data.data.user);
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getAuthToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        clearAuthToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, [refreshUser]);

  useEffect(() => {
    const expireSession = () => {
      clearAuthToken();
      setUser(null);
    };

    window.addEventListener(sessionExpiredEvent, expireSession);

    return () => window.removeEventListener(sessionExpiredEvent, expireSession);
  }, []);

  const login = async (
    email: string,
    password: string,
  ) => {
    const response = await api.post<AuthenticationResponse>(
      "/auth/login",
      { email, password },
    );

    saveAuthToken(response.data.data.token);
    setUser(response.data.data.user);

    return response.data.data.user;
  };

  const register = async (
    payload: RegistrationPayload,
  ) => {
    const response =
      await api.post<AuthenticationResponse>(
        "/auth/register",
        payload,
      );

    saveAuthToken(response.data.data.token);

    setUser(response.data.data.user);

  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearAuthToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider.",
    );
  }

  return context;
}
