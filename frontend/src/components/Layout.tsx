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
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-900/60 bg-slate-950/40 backdrop-blur-md lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-slate-900/60 px-6">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-white">DeepShield AI</div>
            <div className="text-xs text-slate-400">Digital trust training</div>
          </div>
        </div>
        <nav className="space-y-1 px-3 py-5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-teal-500/10 text-teal-400 border-l-2 border-teal-500 shadow-[inset_4px_0_0_0_rgba(20,184,166,0.1)]"
                    : "text-slate-400 hover:bg-slate-900/60 hover:text-white"
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
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500"
                    : "text-slate-400 hover:bg-slate-900/60 hover:text-white"
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
        <header className="sticky top-0 z-20 border-b border-slate-900/60 bg-slate-950/20 backdrop-blur-md">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-teal-500 text-white">
                <ShieldCheck size={20} />
              </div>
              <span className="text-sm font-bold text-white">DeepShield AI</span>
            </div>
            <div className="hidden lg:block">
              <div className="text-sm font-semibold text-slate-200">{user?.full_name}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>
            <button
              className="focus-ring inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/80 transition-all duration-200"
              onClick={logout}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-slate-900/40 px-4 py-2 lg:hidden">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "text-slate-400 hover:text-white"
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
