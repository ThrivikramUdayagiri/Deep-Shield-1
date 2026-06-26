import { BarChart3, Gauge, GraduationCap, LogOut, Medal, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const nav = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/modes", label: "Modes", icon: SlidersHorizontal },
  { to: "/training", label: "Training", icon: GraduationCap },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/leaderboard", label: "Leaderboard", icon: Medal }
];

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-teal-600 text-white">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-950">DeepShield AI</div>
            <div className="text-xs text-slate-500">Digital trust training</div>
          </div>
        </div>
        <nav className="space-y-1 px-3 py-5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-amber-50 text-amber-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`
              }
            >
              <ShieldCheck size={18} />
              Admin
            </NavLink>
          )}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-teal-600 text-white">
                <ShieldCheck size={20} />
              </div>
              <span className="text-sm font-semibold">DeepShield AI</span>
            </div>
            <div className="hidden lg:block">
              <div className="text-sm font-medium text-slate-950">{user?.full_name}</div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
            <button
              className="focus-ring inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              onClick={logout}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    isActive ? "bg-teal-50 text-teal-800" : "text-slate-600"
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
