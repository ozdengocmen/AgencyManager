import { Navigate, Outlet } from "react-router";
import { useAppState } from "../../state";

export function PublicOnlyRoute() {
  const {
    state: { session },
  } = useAppState();

  if (session.status === "bootstrapping") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Loading session...</p>
      </div>
    );
  }

  if (session.status === "authenticated") {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
