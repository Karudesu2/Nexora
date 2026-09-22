
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

const tokenStorageKey = "nexora_token";

interface AuthUser {
  id: number;
  name: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  role_codes?: string[];
  email: string;
}

interface RegistrationPayload {
  name: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
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
      const token = localStorage.getItem(tokenStorageKey);

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        localStorage.removeItem(tokenStorageKey);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, [refreshUser]);

  const login = async (
    email: string,
    password: string,
  ) => {
   const response =
  await api.post<AuthenticationResponse>(
    "/auth/login",
    {
      email,
      password,
    },
  );

console.log("FULL RESPONSE:", response);
console.log("RESPONSE DATA:", response.data);
console.log("DATA.DATA:", response.data.data);
console.log("TOKEN:", response.data.data?.token);

   console.log("TOKEN EXISTS:", response.data.data?.token ? "YES" : "NO");

localStorage.setItem(
  tokenStorageKey,
  response.data.data.token,
);

console.log(
  "AFTER SAVE:",
  localStorage.getItem(tokenStorageKey) ? "YES" : "NO",

);

setUser(response.data.data.user);
  };

  const register = async (
    payload: RegistrationPayload,
  ) => {
    const response =
      await api.post<AuthenticationResponse>(
        "/auth/register",
        payload,
      );

    localStorage.setItem(
      tokenStorageKey,
      response.data.data.token,
    );

    setUser(response.data.data.user);

    return response.data.data.user;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem(tokenStorageKey);
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
