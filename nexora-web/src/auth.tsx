
/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import axios from "axios";
import api, { sessionExpiredEvent } from "./services/api";
import { clearAuthToken, getAuthToken, saveAuthToken } from "./services/authToken";
import { getApiErrorMessage } from "./services/getApiErrorMessage";
import { updateApiDiagnostics } from "./services/apiDiagnostics";

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
  authError: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegistrationPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  retrySession: () => Promise<void>;
}

interface SessionRestoreResult {
  user: AuthUser | null;
  error: string | null;
  tokenExists: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const restorePromise = useRef<Promise<SessionRestoreResult> | null>(null);
  const authRevision = useRef(0);

  const refreshUser = useCallback(async () => {
    const response = await api.get<ProfileResponse>("/auth/profile");

    setUser(response.data.data.user);
    setAuthError(null);
  }, []);

  const restoreSavedSession = useCallback(async (): Promise<SessionRestoreResult> => {
    const token = getAuthToken();

    if (!token) {
      return { user: null, error: null, tokenExists: false };
    }

    try {
      const response = await api.get<ProfileResponse>("/auth/profile");

      return {
        user: response.data.data.user,
        error: null,
        tokenExists: Boolean(getAuthToken()),
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        if (getAuthToken() === token) {
          clearAuthToken();
        }

        return { user: null, error: null, tokenExists: Boolean(getAuthToken()) };
      }

      return {
        user: null,
        error: getApiErrorMessage(error, "Unable to verify your saved session. Check your connection and retry."),
        tokenExists: Boolean(getAuthToken()),
      };
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const revision = authRevision.current;
    const pendingRestore = restorePromise.current ??= restoreSavedSession();

    void pendingRestore
      .then((result) => {
        if (!isMounted || revision !== authRevision.current) {
          return;
        }

        setUser(result.user);
        setAuthError(result.error);
        setIsLoading(false);
      })
      .finally(() => {
        if (restorePromise.current === pendingRestore) {
          restorePromise.current = null;
        }
      });

    return () => {
      isMounted = false;
    };
  }, [restoreSavedSession]);

  useEffect(() => {
    updateApiDiagnostics({
      authenticationStatus: isLoading ? "checking" : authError ? "error" : user ? "authenticated" : "signed out",
      tokenExists: Boolean(getAuthToken()),
    });
  }, [authError, isLoading, user]);

  useEffect(() => {
    const expireSession = () => {
      authRevision.current += 1;
      clearAuthToken();
      setUser(null);
      setAuthError(null);
      setIsLoading(false);
    };

    window.addEventListener(sessionExpiredEvent, expireSession);

    return () => window.removeEventListener(sessionExpiredEvent, expireSession);
  }, []);

  const login = async (
    email: string,
    password: string,
  ) => {
    authRevision.current += 1;
    const response = await api.post<AuthenticationResponse>(
      "/auth/login",
      { email, password },
    );

    saveAuthToken(response.data.data.token);
    setUser(response.data.data.user);
    setAuthError(null);
    setIsLoading(false);

    return response.data.data.user;
  };

  const register = async (
    payload: RegistrationPayload,
  ) => {
    authRevision.current += 1;
    const response =
      await api.post<AuthenticationResponse>(
        "/auth/register",
        payload,
      );

    saveAuthToken(response.data.data.token);

    setUser(response.data.data.user);
    setAuthError(null);
    setIsLoading(false);

  };

  const logout = async () => {
    authRevision.current += 1;
    try {
      await api.post("/auth/logout");
    } finally {
      clearAuthToken();
      setUser(null);
      setAuthError(null);
      setIsLoading(false);
    }
  };

  const retrySession = useCallback(async () => {
    const revision = ++authRevision.current;
    setIsLoading(true);
    setAuthError(null);

    const result = await restoreSavedSession();
    if (revision !== authRevision.current) {
      return;
    }

    setUser(result.user);
    setAuthError(result.error);
    setIsLoading(false);
  }, [restoreSavedSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        authError,
        login,
        register,
        logout,
        refreshUser,
        retrySession,
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
