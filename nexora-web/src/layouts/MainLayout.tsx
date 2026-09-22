import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  SlidersHorizontal,
  Sun,
  Target,
  UserCircle,
  UsersRound,
  X,
} from "lucide-react";
import { useAuth } from "../auth";
import { useTheme } from "../theme";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Calendar", path: "/calendar", icon: CalendarDays },
  { name: "Competency Library", path: "/competencies", icon: BookOpen },
  { name: "Lesson Planner", path: "/lessons", icon: ClipboardList },
  { name: "Assessments", path: "/assessments", icon: ClipboardCheck },
  { name: "Resources", path: "/resources", icon: LibraryBig },
  { name: "Standards Alignment", path: "/alignment", icon: Target },
  { name: "Pacing Monitor", path: "/pacing", icon: Gauge },
  { name: "Reports", path: "/reports", icon: BarChart3 },
];

export default function MainLayout() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const closeNavigation = () => setIsNavigationOpen(false);
  const canManageAcademicContext = user?.role_codes?.some((role) => [
    "school_administrator",
    "administrator",
    "system_administrator",
  ].includes(role));
  const primaryRole = user?.role_codes?.includes("system_administrator")
    ? "System Administrator"
    : user?.role_codes?.some((role) => ["school_administrator", "administrator"].includes(role))
      ? "Administrator"
      : user?.role_codes?.includes("curriculum_coordinator")
        ? "Curriculum Coordinator"
        : "Teacher";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {isNavigationOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          onClick={closeNavigation}
          type="button"
        />
      ) : null}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-slate-200/80 bg-white shadow-xl shadow-slate-950/5 transition-transform dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30 lg:w-64 lg:translate-x-0 ${isNavigationOpen ? "translate-x-0" : ""}`}>
        <div className="flex h-20 items-center border-b border-slate-200/80 px-6 dark:border-slate-800">
          <div>
            <p className="text-2xl font-bold tracking-tight text-sky-700 dark:text-sky-300">NEXORA</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Plan. Align. Teach.</p>
          </div>
          <button aria-label="Close navigation" className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden" onClick={closeNavigation} type="button"><X size={20} /></button>
        </div>

        <nav className="space-y-1 p-4" aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return <NavLink key={item.path} to={item.path} end={item.path === "/"} onClick={closeNavigation} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"}`}><Icon size={19} strokeWidth={1.9} /><span>{item.name}</span></NavLink>;
          })}
          {canManageAcademicContext ? <NavLink to="/admin/dashboard" onClick={closeNavigation} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"}`}><LayoutDashboard size={19} strokeWidth={1.9} /><span>School overview</span></NavLink> : null}
          {canManageAcademicContext ? <NavLink to="/administration" onClick={closeNavigation} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"}`}><SlidersHorizontal size={19} strokeWidth={1.9} /><span>Academic setup</span></NavLink> : null}
          {canManageAcademicContext ? <NavLink to="/administration/users" onClick={closeNavigation} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"}`}><UsersRound size={19} strokeWidth={1.9} /><span>User management</span></NavLink> : null}
        </nav>

        <div className="mt-auto border-t border-slate-200/80 p-4 dark:border-slate-800">
          <NavLink to="/settings" onClick={closeNavigation} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"}`}><Settings size={19} strokeWidth={1.9} /><span>Settings</span></NavLink>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6 lg:px-8">
          <button aria-label="Open navigation" className="shrink-0 rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden" onClick={() => setIsNavigationOpen(true)} type="button"><Menu size={22} /></button>
          <label className="hidden max-w-xl flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 shadow-sm transition focus-within:border-sky-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:focus-within:border-sky-700 dark:focus-within:bg-slate-900 dark:focus-within:ring-sky-950 sm:flex">
            <Search className="size-4 shrink-0 text-sky-700 dark:text-sky-300" />
            <input className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400" placeholder="Search competencies, lessons, or codes..." type="search" />
          </label>
          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <button aria-label="Notifications" className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white" onClick={() => navigate("/notifications")} type="button"><Bell size={20} strokeWidth={1.8} /></button>
            <button aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white" onClick={toggleTheme} type="button">{theme === "light" ? <Moon className="size-5" /> : <Sun className="size-5" />}</button>
            <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-800 sm:block" />
            <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-900" type="button"><UserCircle className="size-8 text-slate-500 dark:text-slate-400" strokeWidth={1.5} /><span className="hidden sm:block"><span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{primaryRole}</span></span></button>
            <button aria-label="Sign out" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white" onClick={() => void handleLogout()} type="button"><LogOut className="size-4" /></button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-7 xl:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
