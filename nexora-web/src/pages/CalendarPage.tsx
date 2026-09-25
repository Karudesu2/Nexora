/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Plus, Search, Trash2 } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../auth";
import { getApiErrorMessage } from "../services/getApiErrorMessage";
import { getPlanningContext } from "../services/planningContext";

interface ApiResponse<T> { data: T; }
interface CalendarEvent { id: number; title: string; type: string; start_date: string; end_date?: string | null; description?: string | null; is_instructional_day: boolean; }
interface Option { id: number; name: string; }
interface Term extends Option { school_year_id: number; }
interface PlanningContext { school_years: Option[]; terms: Term[]; }
interface EventForm { schoolYearId: string; termId: string; title: string; type: string; start: string; end: string; description: string; instructional: boolean; }

const inputClass = "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950";
const eventTypes = ["Regular Class", "Holiday", "Class Suspension", "Examination", "Assessment", "School Activity", "LAC Session", "Training", "Catch-up Day", "Remediation Day", "Enrichment Day", "Special Event", "Teacher Activity"];
const emptyForm: EventForm = { schoolYearId: "", termId: "", title: "", type: "Holiday", start: "", end: "", description: "", instructional: false };
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Laravel date values can serialize as timestamps. Keep the date portion as a
// calendar date and never parse it in the browser's local timezone.
function dateKey(value: string): string { return value.slice(0, 10); }
function utcDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
function formatMonth(value: Date): string { return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric", timeZone: "UTC" }).format(value); }
function eventColor(type: string): string {
  const value = type.toLowerCase();
  if (value.includes("holiday") || value.includes("suspension")) return "bg-rose-500";
  if (value.includes("exam") || value.includes("assessment")) return "bg-violet-500";
  if (value.includes("training") || value.includes("lac")) return "bg-amber-500";
  if (value.includes("class") || value.includes("instruction")) return "bg-emerald-500";
  return "bg-sky-500";
}

export function CalendarPage() {
  const { user } = useAuth();
  const canManageCalendar = user?.role_codes?.some((role) => ["school_administrator", "administrator", "system_administrator"].includes(role));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [context, setContext] = useState<PlanningContext | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [activeDate, setActiveDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [form, setForm] = useState<EventForm>(emptyForm);

  const load = useCallback(async () => {
    const eventRequest = api.get<ApiResponse<CalendarEvent[]>>("/calendar");
    const contextRequest = canManageCalendar ? getPlanningContext() : null;
    const [eventResponse, contextResponse] = await Promise.all([eventRequest, contextRequest]);
    setEvents(eventResponse.data.data);
    if (contextResponse) setContext(contextResponse);
  }, [canManageCalendar]);

  useEffect(() => {
    let active = true;
    void load().catch((loadError: unknown) => {
      if (active) setError(getApiErrorMessage(loadError, "Calendar events could not be loaded."));
    }).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [load]);

  const eventDates = useMemo(() => {
    const byDate = new Map<string, CalendarEvent[]>();
    for (const item of events) {
      const start = dateKey(item.start_date);
      const end = dateKey(item.end_date || item.start_date);
      const cursor = utcDate(start);
      const last = utcDate(end);
      while (cursor <= last) {
        const key = cursor.toISOString().slice(0, 10);
        const items = byDate.get(key) ?? [];
        items.push(item);
        byDate.set(key, items);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
    }
    return byDate;
  }, [events]);

  const calendarDays = useMemo(() => {
    const first = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1));
    const offset = (first.getUTCDay() + 6) % 7;
    const start = new Date(first);
    start.setUTCDate(first.getUTCDate() - offset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + index);
      return { key: date.toISOString().slice(0, 10), day: date.getUTCDate(), inMonth: date.getUTCMonth() === currentMonth.getUTCMonth() };
    });
  }, [currentMonth]);

  const filteredEvents = events.filter((item) => `${item.title} ${item.type}`.toLowerCase().includes(query.toLowerCase()));
  const selectedDateEvents = eventDates.get(activeDate) ?? [];
  const visibleEvents = query ? filteredEvents : selectedDateEvents;
  const terms = context?.terms.filter((term) => !form.schoolYearId || term.school_year_id === Number(form.schoolYearId)) ?? [];

  const resetForm = () => { setForm(emptyForm); setEditingEvent(null); };
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const body = {
        title: form.title.trim(), type: form.type, start_date: form.start,
        end_date: form.end || null, description: form.description.trim() || null,
        is_instructional_day: form.instructional,
      };
      if (editingEvent) {
        await api.put(`/calendar/${editingEvent.id}`, body);
      } else {
        await api.post("/calendar", {
          ...body, school_year_id: Number(form.schoolYearId),
          term_id: form.termId ? Number(form.termId) : null,
        });
      }
      resetForm();
      await load();
    } catch (submissionError) {
      setError(getApiErrorMessage(submissionError, "The event could not be saved."));
    } finally { setIsSubmitting(false); }
  };

  const edit = (item: CalendarEvent) => {
    setEditingEvent(item);
    setForm({ ...emptyForm, title: item.title, type: item.type, start: dateKey(item.start_date), end: item.end_date ? dateKey(item.end_date) : "", description: item.description ?? "", instructional: item.is_instructional_day });
    setError("");
  };

  const remove = async (item: CalendarEvent) => {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    setError("");
    try {
      await api.delete(`/calendar/${item.id}`);
      if (editingEvent?.id === item.id) resetForm();
      await load();
    } catch (deleteError) { setError(getApiErrorMessage(deleteError, "The event could not be deleted.")); }
  };

  return <div className="space-y-5">
    <section className="rounded-2xl bg-slate-950 p-5 text-white shadow-sm sm:p-7"><div className="flex items-start gap-4"><div className="rounded-xl bg-white/10 p-3 text-sky-200"><CalendarDays className="size-5" /></div><div><p className="text-sm font-medium text-sky-200">Planning schedule</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">School calendar</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Review school events and instructional days that influence lesson planning.</p></div></div></section>
    {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p> : null}
    <div className={`grid gap-5 ${canManageCalendar ? "xl:grid-cols-[minmax(0,1fr)_380px]" : ""}`}>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800"><button aria-label="Previous month" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setCurrentMonth((month) => new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() - 1, 1)))}><ChevronLeft className="size-5" /></button><h2 className="font-semibold text-slate-900 dark:text-white">{formatMonth(currentMonth)}</h2><button aria-label="Next month" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setCurrentMonth((month) => new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1)))}><ChevronRight className="size-5" /></button></div>
        {isLoading ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="size-5 animate-spin" /> Loading calendar…</div> : <>
          <div className="grid grid-cols-7">{weekdays.map((day) => <div className="border-b border-slate-100 py-2 text-center text-xs font-semibold text-slate-500 dark:border-slate-800" key={day}>{day}</div>)}
            {calendarDays.map((day) => {
              const dayEvents = eventDates.get(day.key) ?? [];
              const selected = activeDate === day.key;
              return <button key={day.key} aria-label={`${day.key}${dayEvents.length ? `, ${dayEvents.length} events` : ""}`} aria-pressed={selected} className={`min-h-20 border-b border-r border-slate-100 p-1.5 text-left dark:border-slate-800 sm:min-h-24 sm:p-2 ${day.inMonth ? "" : "bg-slate-50/70 text-slate-400 dark:bg-slate-950/40"} ${selected ? "ring-2 ring-inset ring-sky-500" : "hover:bg-sky-50 dark:hover:bg-sky-950/30"}`} onClick={() => setActiveDate(day.key)}>
                <span className={`inline-grid size-7 place-items-center rounded-full text-sm ${selected ? "bg-sky-600 font-semibold text-white" : "text-slate-700 dark:text-slate-200"}`}>{day.day}</span>
                <span className="mt-1 flex flex-wrap gap-1" aria-hidden="true">{dayEvents.slice(0, 4).map((item, index) => <span key={`${item.id}-${index}`} className={`size-2 rounded-full ${eventColor(item.type)}`} />)}{dayEvents.length > 4 ? <span className="text-[10px] text-slate-500">+{dayEvents.length - 4}</span> : null}</span>
              </button>;
            })}
          </div>
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-slate-900 dark:text-white">{query ? "Search results" : `Events on ${activeDate}`}</h3><label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950"><Search className="size-4" /><input aria-label="Search events" className="min-w-0 bg-transparent outline-none placeholder:text-slate-400" onChange={(event) => setQuery(event.target.value)} placeholder="Search all events" type="search" value={query} /></label></div>
            {visibleEvents.map((item) => <article className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center" key={item.id}><span className={`size-3 shrink-0 rounded-full ${eventColor(item.type)}`} /><div className="min-w-0 flex-1"><h4 className="font-semibold text-slate-900 dark:text-white">{item.title}</h4><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.type} · {dateKey(item.start_date)}{item.end_date ? ` to ${dateKey(item.end_date)}` : ""}</p>{item.description ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.description}</p> : null}<span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.is_instructional_day ? "Instructional" : "Non-instructional"}</span></div>{canManageCalendar ? <div className="flex gap-2"><button className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" onClick={() => edit(item)}>Edit</button><button aria-label={`Delete ${item.title}`} className="rounded-lg border border-rose-200 p-2 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300" onClick={() => void remove(item)}><Trash2 className="size-4" /></button></div> : null}</article>)}
            {visibleEvents.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">{query ? "No events match this search." : "No events on this date. Select another date to view its events."}</p> : null}
          </div>
        </>}
      </section>
      {canManageCalendar ? <form className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" onSubmit={save}>
        <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900 dark:text-white">{editingEvent ? "Edit calendar event" : "Add calendar event"}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Teachers will see these dates in their planning tools.</p></div>{editingEvent ? <button className="text-sm text-sky-700 hover:underline dark:text-sky-300" onClick={resetForm} type="button">Cancel</button> : null}</div>
        {!editingEvent ? <><label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">School year<select className={inputClass} onChange={(event) => setForm({ ...form, schoolYearId: event.target.value, termId: "" })} required value={form.schoolYearId}><option value="">Select</option>{context?.school_years.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label><label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Term <span className="font-normal text-slate-400">(optional)</span><select className={inputClass} onChange={(event) => setForm({ ...form, termId: event.target.value })} value={form.termId}><option value="">All terms</option>{terms.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label></> : null}
        <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Title<input className={inputClass} maxLength={255} minLength={2} onChange={(event) => setForm({ ...form, title: event.target.value })} required value={form.title} /></label>
        <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Type<select className={inputClass} onChange={(event) => setForm({ ...form, type: event.target.value })} value={form.type}>{[...new Set([...eventTypes, form.type])].map((type) => <option key={type}>{type}</option>)}</select></label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start date<input className={inputClass} onChange={(event) => setForm({ ...form, start: event.target.value })} required type="date" value={form.start} /></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">End date<input className={inputClass} min={form.start || undefined} onChange={(event) => setForm({ ...form, end: event.target.value })} type="date" value={form.end} /></label></div>
        <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Description<textarea className={inputClass} maxLength={2000} minLength={form.description.trim() ? 2 : undefined} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} value={form.description} /></label>
        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><input checked={form.instructional} onChange={(event) => setForm({ ...form, instructional: event.target.checked })} type="checkbox" /> Counts as an instructional day</label>
        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500" disabled={isSubmitting || (!editingEvent && !context?.school_years.length)} type="submit">{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : editingEvent ? null : <Plus className="size-4" />}{isSubmitting ? "Saving…" : editingEvent ? "Update event" : "Save event"}</button>
      </form> : null}
    </div>
  </div>;
}
