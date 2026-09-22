import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Gauge,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import api from "../../services/api";

interface Lesson {
  id: number;
  title: string;
  lesson_date: string;
  status: string;
  section?: string;
  subject?: { id: number; name: string };
  grade?: { id: number; name: string };
}

interface CalendarEvent {
  id: number;
  title: string;
  type: string;
  start_date: string;
  end_date?: string | null;
  is_instructional_day: boolean;
}

interface DashboardData {
  teacher: { id: number; name: string; email: string };
  stats: { total_lessons: number; completed_lessons: number; pending_lessons: number; competencies: number; assessments: number };
  today: { date: string; lessons: Lesson[] };
  upcoming_lessons: Lesson[];
  calendar_events: CalendarEvent[];
}

interface DashboardResponse { data: DashboardData; }

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function displayDate(date: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

function contextFromLesson(lesson?: Lesson): string {
  if (!lesson) {
    return "Your active teaching context";
  }

  return [lesson.grade?.name, lesson.subject?.name, lesson.section].filter(Boolean).join(" · ");
}

function DashboardSkeleton() {
  return <div aria-busy="true" aria-label="Loading dashboard" className="mx-auto max-w-[1560px] animate-pulse space-y-5"><section className="px-1 pt-1"><div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" /><div className="mt-3 h-10 w-72 max-w-full rounded bg-slate-200 dark:bg-slate-800" /><div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200 dark:bg-slate-800" /></section><section className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div className="h-36 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900" key={index}><div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" /><div className="mt-4 h-9 w-16 rounded bg-slate-200 dark:bg-slate-800" /><div className="mt-5 h-2 w-full rounded bg-slate-100 dark:bg-slate-800" /></div>)}</section><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="h-80 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" /><div className="h-80 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" /></div></div>;
}

function MiniCalendar({ date, events }: { date: string; events: CalendarEvent[] }) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(`${date}T00:00:00`));
  const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(1 - monthStart.getDay());
  const dates = Array.from({ length: 42 }, (_, index) => {
    const gridDate = new Date(gridStart);
    gridDate.setDate(gridStart.getDate() + index);
    return gridDate;
  });
  const today = date;
  const eventDates = new Set(events.map((event) => event.start_date));

  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-slate-900 dark:text-white">School calendar</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Planning dates and events</p></div><Link className="text-xs font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300" to="/calendar">View all <ArrowRight className="inline size-3.5" /></Link></div><div className="mt-5 flex items-center justify-between"><button aria-label="Previous month" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))} type="button"><ChevronLeft className="size-4" /></button><h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(visibleMonth)}</h3><button aria-label="Next month" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))} type="button"><ChevronRight className="size-4" /></button></div><div className="mt-4 grid grid-cols-7 text-center text-[10px] font-medium text-slate-400">{dayNames.map((day) => <span key={day}>{day}</span>)}</div><div className="mt-2 grid grid-cols-7 gap-y-1">{dates.map((gridDate) => { const isoDate = gridDate.toISOString().slice(0, 10); const isCurrentMonth = gridDate.getMonth() === visibleMonth.getMonth(); const isToday = isoDate === today; const hasEvent = eventDates.has(isoDate); return <div className="flex h-8 items-center justify-center" key={isoDate}><span className={`relative grid size-7 place-items-center rounded-full text-xs transition ${isToday ? "bg-sky-600 font-semibold text-white shadow-sm" : isCurrentMonth ? "text-slate-700 dark:text-slate-300" : "text-slate-300 dark:text-slate-700"}`}>{gridDate.getDate()}{hasEvent && !isToday ? <span className="absolute bottom-0.5 size-1 rounded-full bg-amber-400" /> : null}</span></div>; })}</div><div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400"><span className="size-2 rounded-full bg-sky-600" /> Today <span className="ml-3 size-2 rounded-full bg-amber-400" /> Event</div></section>;
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get<DashboardResponse>("/dashboard");
        setDashboard(response.data.data);
      } catch {
        setError("Unable to load dashboard data. Refresh the page and try again.");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const progress = useMemo(() => {
    if (!dashboard?.stats.total_lessons) {
      return 0;
    }

    return Math.round((dashboard.stats.completed_lessons / dashboard.stats.total_lessons) * 100);
  }, [dashboard]);

  if (loading) return <DashboardSkeleton />;

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Loader2 className="size-5 animate-spin" /> Loading your teaching overview…</div>;
  }

  if (error || !dashboard) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">{error || "No dashboard data is available."}</div>;
  }

  const primaryLesson = dashboard.today.lessons[0] || dashboard.upcoming_lessons[0];
  const stats = [
    { label: "Lessons completed", value: dashboard.stats.completed_lessons, detail: `${progress}% of your plan`, color: "sky", icon: CheckCircle2, progress },
    { label: "Lessons remaining", value: dashboard.stats.pending_lessons, detail: "Scheduled or in progress", color: "amber", icon: Clock3, progress: Math.max(100 - progress, 0) },
    { label: "Upcoming assessments", value: dashboard.stats.assessments, detail: "Linked to your lessons", color: "violet", icon: ClipboardCheck, progress: dashboard.stats.assessments ? 65 : 0 },
    { label: "Curriculum coverage", value: `${progress}%`, detail: `${dashboard.stats.competencies} competencies available`, color: "emerald", icon: Target, progress },
  ];

  const palettes: Record<string, string> = {
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  };
  const bars: Record<string, string> = {
    sky: "bg-sky-500",
    amber: "bg-amber-500",
    violet: "bg-violet-500",
    emerald: "bg-emerald-500",
  };

  return <div className="mx-auto max-w-[1560px] space-y-5"><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="space-y-5"><section className="px-1 pt-1"><p className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"><Sparkles className="size-4" /> Teacher dashboard</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Good morning, {dashboard.teacher.name}.</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-400 sm:text-base">Here’s your teaching overview for today.</p></section><section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1.1fr_1fr]"><div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70"><div className="rounded-xl bg-sky-100 p-2.5 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"><CalendarDays className="size-5" /></div><div><p className="text-xs text-slate-500 dark:text-slate-400">Today</p><p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{displayDate(dashboard.today.date)}</p></div></div><div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"><div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"><BookOpen className="size-5" /></div><div><p className="text-xs text-slate-500 dark:text-slate-400">Teaching context</p><p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{contextFromLesson(primaryLesson)}</p></div></div></section><section className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">{stats.map((stat) => { const Icon = stat.icon; return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900" key={stat.label}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{stat.value}</p></div><div className={`rounded-xl p-2.5 ${palettes[stat.color]}`}><Icon className="size-5" /></div></div><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{stat.detail}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${bars[stat.color]}`} style={{ width: `${stat.progress}%` }} /></div></article>; })}</section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-slate-900 dark:text-white">Today’s lesson</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your next teaching priority</p></div>{primaryLesson ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{primaryLesson.status}</span> : null}</div>{primaryLesson ? <div className="mt-5 grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)_minmax(180px,.8fr)] lg:items-center"><div className="grid size-16 place-items-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"><BookOpen className="size-8" /></div><div><h2 className="text-xl font-semibold text-slate-900 dark:text-white">{primaryLesson.title}</h2><p className="mt-2 text-sm text-sky-700 dark:text-sky-300">{contextFromLesson(primaryLesson)}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{primaryLesson.lesson_date === dashboard.today.date ? "Scheduled for today" : `Coming up ${displayDate(primaryLesson.lesson_date)}`}</p><Link className="mt-4 inline-flex items-center gap-2 rounded-lg border border-sky-200 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 dark:border-sky-900 dark:text-sky-300 dark:hover:bg-sky-500/10" to="/lessons">View lesson <ArrowRight className="size-4" /></Link></div><div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/70"><p className="text-xs text-slate-500 dark:text-slate-400">Lesson status</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{primaryLesson.status}</p><p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Grade / Subject</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{contextFromLesson(primaryLesson)}</p></div></div> : <div className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-400">No lesson is scheduled today. <Link className="font-semibold text-sky-700 dark:text-sky-300" to="/lessons">Open lesson planner</Link></div>}</section><div className="grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800"><h2 className="font-semibold text-slate-900 dark:text-white">Upcoming schedule</h2><Link className="text-xs font-semibold text-sky-700 dark:text-sky-300" to="/calendar">View calendar <ArrowRight className="inline size-3.5" /></Link></div><div className="divide-y divide-slate-100 dark:divide-slate-800">{dashboard.upcoming_lessons.slice(0, 4).map((lesson) => <article className="flex items-center gap-3 px-5 py-3.5" key={lesson.id}><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-center dark:bg-slate-800"><span className="text-[10px] font-medium uppercase text-slate-500">{new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(`${lesson.lesson_date}T00:00:00`))}</span><span className="-mt-1 text-sm font-semibold text-slate-800 dark:text-white">{new Date(`${lesson.lesson_date}T00:00:00`).getDate()}</span></div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{lesson.title}</p><p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{contextFromLesson(lesson)}</p></div><ChevronRight className="ml-auto size-4 text-slate-400" /></article>)}{dashboard.upcoming_lessons.length === 0 ? <p className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">No upcoming lessons.</p> : null}</div></section><section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800"><h2 className="font-semibold text-slate-900 dark:text-white">Recent planning activity</h2></div><div className="p-5"><div className="space-y-5"><div className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"><CheckCircle2 className="size-4" /></span><div><p className="text-sm font-medium text-slate-800 dark:text-white">{dashboard.stats.completed_lessons} lessons completed</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Recorded in your current plan</p></div></div><div className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"><Gauge className="size-4" /></span><div><p className="text-sm font-medium text-slate-800 dark:text-white">{progress}% plan completion</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Pacing is calculated from your lessons</p></div></div><div className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"><ClipboardCheck className="size-4" /></span><div><p className="text-sm font-medium text-slate-800 dark:text-white">{dashboard.stats.assessments} assessment records</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Linked to your lesson plans</p></div></div></div></div></section></div></div><aside className="space-y-5"><MiniCalendar date={dashboard.today.date} events={dashboard.calendar_events} /><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900 dark:text-white">Upcoming events</h2><Link className="text-xs font-semibold text-sky-700 dark:text-sky-300" to="/calendar">View all</Link></div><div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">{dashboard.calendar_events.slice(0, 4).map((event) => <article className="py-3 first:pt-0" key={event.id}><div className="flex items-start gap-3"><span className="mt-1 size-2 rounded-full bg-amber-400" /><div><p className="text-sm font-medium text-slate-800 dark:text-white">{event.title}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{event.type} · {displayDate(event.start_date)}</p></div></div></article>)}{dashboard.calendar_events.length === 0 ? <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No upcoming calendar events.</p> : null}</div></section><section className="overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 p-5 text-white shadow-sm"><Sparkles className="size-5 text-sky-100" /><p className="mt-4 text-lg font-semibold leading-7">Small steps in planning today create better learning tomorrow.</p><p className="mt-3 text-sm text-sky-100">— NEXORA</p></section></aside></div></div>;
}
