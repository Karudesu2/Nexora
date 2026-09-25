import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth";
import { hasExpiredSession } from "./services/authToken";

export function ProtectedRoute() {
  const { user, isLoading, authError, retrySession } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading NEXORA...
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center text-slate-600">
        <p role="alert">{authError}</p>
        <button
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          onClick={() => void retrySession()}
          type="button"
        >
          Retry session check
        </button>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location, reason: hasExpiredSession() ? "session-expired" : undefined }} />;
  }

  return <Outlet />;
}
