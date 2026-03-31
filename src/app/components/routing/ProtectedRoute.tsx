import { Navigate, Outlet } from "react-router";
import { useAppState } from "../../state";

export function ProtectedRoute() {
  const {
    state: { session },
  } = useAppState();

  if (session.status === "bootstrapping") {
    return <RouteLoader />;
  }

  if (session.status !== "authenticated") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-600">Loading session...</p>
    </div>
  );
}
