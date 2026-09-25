/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { BookOpen, ClipboardList, GraduationCap, Loader2, Target, UsersRound } from "lucide-react";
import { useAuth } from "../auth";
import api from "../services/api";
import { getApiErrorMessage } from "../services/getApiErrorMessage";

interface DashboardData {
  school_year: { id: number; name: string } | null;
  term: { id: number; name: string } | null;
  active_curriculum_version: { id: number; name: string; code: string | null } | null;
  teachers: number;
  subjects: number;
  competencies: number;
  lesson_plans: number;
  completed_lesson_plans: number;
  planning_completion: number;
}

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const canAccess = user?.role_codes?.some((role) => ["school_administrator", "administrator", "system_administrator"].includes(role)) ?? false;

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }

    void api.get<{ data: DashboardData }>("/admin/dashboard")
      .then((response) => setDashboard(response.data.data))
      .catch((loadError: unknown) => setError(getApiErrorMessage(loadError, "Unable to load administrator dashboard data.")))
      .finally(() => setLoading(false));
  }, [canAccess]);

  if (!canAccess) return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900"><h1 className="text-xl font-semibold">Access denied</h1><p className="mt-2 text-sm">This dashboard is available to School Administrators only.</p></section>;
  if (loading) return <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="size-5 animate-spin" /> Loading school overview...</div>;
  if (error || !dashboard) return <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><h1 className="font-semibold">Administrator dashboard unavailable</h1><p className="mt-1">{error || "No dashboard data is available."}</p></section>;

  const cards = [
    { label: "Teachers", value: dashboard.teachers, icon: UsersRound },
    { label: "Subjects", value: dashboard.subjects, icon: BookOpen },
    { label: "Competencies", value: dashboard.competencies, icon: Target },
    { label: "Lesson plans", value: dashboard.lesson_plans, icon: ClipboardList },
  ];

  return <div className="mx-auto max-w-7xl space-y-5"><section className="rounded-2xl bg-slate-950 p-6 text-white sm:p-8"><div className="flex items-start gap-4"><div className="rounded-xl bg-white/10 p-3 text-sky-200"><GraduationCap className="size-6" /></div><div><p className="text-sm font-medium text-sky-200">School Administration</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">School overview</h1><p className="mt-2 text-sm text-slate-300">Monitor school-wide planning, curriculum, and instructional activity.</p></div></div></section><section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" key={card.label}><div className="flex items-start justify-between"><p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p><Icon className="size-5 text-sky-700 dark:text-sky-300" /></div><p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{card.value}</p></article>; })}</section><section className="grid gap-5 lg:grid-cols-2"><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h2 className="font-semibold text-slate-900 dark:text-white">Current academic context</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">School year</dt><dd className="font-medium text-slate-900 dark:text-white">{dashboard.school_year?.name ?? "Not configured"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Term</dt><dd className="font-medium text-slate-900 dark:text-white">{dashboard.term?.name ?? "Not configured"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Curriculum</dt><dd className="text-right font-medium text-slate-900 dark:text-white">{dashboard.active_curriculum_version?.name ?? "Not configured"}</dd></div></dl></article><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h2 className="font-semibold text-slate-900 dark:text-white">Planning completion</h2><p className="mt-4 text-4xl font-semibold text-slate-900 dark:text-white">{dashboard.planning_completion}%</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{dashboard.completed_lesson_plans} completed out of {dashboard.lesson_plans} lesson plans.</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-sky-600" style={{ width: `${dashboard.planning_completion}%` }} /></div></article></section></div>;
}
