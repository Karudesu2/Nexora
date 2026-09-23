import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth";
import { hasExpiredSession } from "./services/authToken";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading NEXORA...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location, reason: hasExpiredSession() ? "session-expired" : undefined }} />;
  }

  return <Outlet />;
}
