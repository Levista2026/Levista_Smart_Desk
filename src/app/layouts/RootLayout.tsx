import { Outlet } from "react-router";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Outlet />
    </div>
  );
}
