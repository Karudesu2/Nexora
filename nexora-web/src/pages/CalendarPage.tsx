/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Loader2, Plus, Search } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../auth";
import { getApiErrorMessage } from "../services/getApiErrorMessage";

interface ApiResponse<T> { data: T; }
interface CalendarEvent { id: number; title: string; type: string; start_date: string; end_date?: string | null; description?: string | null; is_instructional_day: boolean; }
interface Option { id: number; name: string; }
interface Term extends Option { school_year_id: number; }
interface PlanningContext { school_years: Option[]; terms: Term[]; }

const inputClass = "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950";

export function CalendarPage() {
  const { user } = useAuth();
  const canManageCalendar = user?.role_codes?.some((role) => ["administrator", "system_administrator"].includes(role));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [context, setContext] = useState<PlanningContext | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ schoolYearId: "", termId: "", title: "", type: "Holiday", start: "", end: "", description: "", instructional: false });

const load = useCallback(async () => {
  const eventRequest = api.get<ApiResponse<CalendarEvent[]>>("/calendar");
  const contextRequest = canManageCalendar
    ? api.get<ApiResponse<PlanningContext>>("/planning-context")
    : null;
  const [eventResponse, contextResponse] = await Promise.all([eventRequest, contextRequest]);
  setEvents(eventResponse.data.data);
  if (contextResponse) setContext(contextResponse.data.data);
}, [canManageCalendar]);

  useEffect(() => { void load().catch((loadError: unknown) => setError(getApiErrorMessage(loadError, "Calendar events could not be loaded."))).finally(() => setIsLoading(false)); }, [load]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await api.post("/calendar", { school_year_id: Number(form.schoolYearId), term_id: form.termId ? Number(form.termId) : null, title: form.title, type: form.type, start_date: form.start, end_date: form.end || null, description: form.description || null, is_instructional_day: form.instructional });
      setForm({ schoolYearId: "", termId: "", title: "", type: "Holiday", start: "", end: "", description: "", instructional: false });
      await load();
    } catch (submissionError) { setError(getApiErrorMessage(submissionError, "The event could not be saved.")); } finally { setIsSubmitting(false); }
  };

  const filteredEvents = events.filter((event) => `${event.title} ${event.type}`.toLowerCase().includes(query.toLowerCase()));
  const terms = context?.terms.filter((term) => !form.schoolYearId || term.school_year_id === Number(form.schoolYearId)) ?? [];

  return <div className="space-y-5"><section className="rounded-2xl bg-slate-950 p-5 text-white shadow-sm sm:p-7"><div className="flex items-start gap-4"><div className="rounded-xl bg-white/10 p-3 text-sky-200"><CalendarDays className="size-5" /></div><div><p className="text-sm font-medium text-sky-200">Planning schedule</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">School calendar</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Review school events and instructional days that influence lesson planning.</p></div></div></section>{error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p> : null}<div className={`grid gap-5 ${canManageCalendar ? "xl:grid-cols-[minmax(0,1fr)_380px]" : ""}`}><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-slate-900 dark:text-white">Calendar events</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{filteredEvents.length} events found</p></div><label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"><Search className="size-4" /><input className="min-w-0 bg-transparent outline-none placeholder:text-slate-400" onChange={(event) => setQuery(event.target.value)} placeholder="Search events" type="search" value={query} /></label></div>{isLoading ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Loader2 className="size-5 animate-spin" /> Loading calendar…</div> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{filteredEvents.map((calendarEvent) => <article className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center" key={calendarEvent.id}><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"><CalendarDays className="size-5" /></div><div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-900 dark:text-white">{calendarEvent.title}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{calendarEvent.type} · {calendarEvent.start_date}{calendarEvent.end_date ? ` to ${calendarEvent.end_date}` : ""}</p>{calendarEvent.description ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{calendarEvent.description}</p> : null}</div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${calendarEvent.is_instructional_day ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{calendarEvent.is_instructional_day ? "Instructional" : "Non-instructional"}</span></article>)}{filteredEvents.length === 0 ? <p className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">No calendar events match this search.</p> : null}</div>}</section>{canManageCalendar ? <form className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" onSubmit={save}><h2 className="font-semibold text-slate-900 dark:text-white">Add calendar event</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Teachers will see these dates in their planning tools.</p><label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">School year<select className={inputClass} onChange={(event) => setForm({ ...form, schoolYearId: event.target.value, termId: "" })} required value={form.schoolYearId}><option value="">Select</option>{context?.school_years.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label><label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Term <span className="font-normal text-slate-400">(optional)</span><select className={inputClass} onChange={(event) => setForm({ ...form, termId: event.target.value })} value={form.termId}><option value="">All terms</option>{terms.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label><label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Title<input className={inputClass} onChange={(event) => setForm({ ...form, title: event.target.value })} required value={form.title} /></label><label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Type<select className={inputClass} onChange={(event) => setForm({ ...form, type: event.target.value })} value={form.type}>{["Regular Class", "Holiday", "Class Suspension", "Examination", "Assessment", "School Activity", "LAC Session", "Training", "Catch-up Day", "Remediation Day", "Enrichment Day", "Special Event", "Teacher Activity"].map((type) => <option key={type}>{type}</option>)}</select></label><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start date<input className={inputClass} onChange={(event) => setForm({ ...form, start: event.target.value })} required type="date" value={form.start} /></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">End date<input className={inputClass} onChange={(event) => setForm({ ...form, end: event.target.value })} type="date" value={form.end} /></label></div><label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Description<textarea className={inputClass} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} value={form.description} /></label><label className="mt-4 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><input checked={form.instructional} onChange={(event) => setForm({ ...form, instructional: event.target.checked })} type="checkbox" /> Counts as an instructional day</label><button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500" disabled={isSubmitting || !context?.school_years.length} type="submit">{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}{isSubmitting ? "Saving…" : "Save event"}</button></form> : null}</div></div>;
}
