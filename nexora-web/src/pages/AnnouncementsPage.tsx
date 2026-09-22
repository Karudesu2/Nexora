import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Megaphone,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "../auth";
import api from "../services/api";
import { getApiErrorMessage } from "../services/getApiErrorMessage";

type ApiResponse<T> = {
  data: T;
};

type AnnouncementType = "Update" | "Maintenance" | "New Feature" | "Advisory";
type AnnouncementPriority = "Low" | "Normal" | "High" | "Critical";

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  creator?: { id: number; name: string } | null;
}

const types: AnnouncementType[] = ["Update", "Maintenance", "New Feature", "Advisory"];
const priorities: AnnouncementPriority[] = ["Low", "Normal", "High", "Critical"];
const inputClass = "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-sky-600 dark:focus:ring-sky-950";

function formatDate(value: string | null) {
  if (!value) return "Always visible";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function priorityClass(priority: AnnouncementPriority) {
  if (priority === "Critical") return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
  if (priority === "High") return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  if (priority === "Low") return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  return "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300";
}

export function AnnouncementsPage() {
  const { user } = useAuth();
  const canManage = user?.role_codes?.some((role) => ["school_administrator", "administrator", "system_administrator"].includes(role)) ?? false;
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "Update" as AnnouncementType,
    priority: "Normal" as AnnouncementPriority,
    starts_at: "",
    ends_at: "",
    is_active: true,
  });

  const load = useCallback(async () => {
    const path = canManage ? "/admin/announcements" : "/announcements";
    const response = await api.get<ApiResponse<Announcement[]>>(path);
    setAnnouncements(response.data.data);
  }, [canManage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      void load()
        .catch((loadError: unknown) => setError(getApiErrorMessage(loadError, "Announcements could not be loaded.")))
        .finally(() => setIsLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const activeCount = useMemo(() => announcements.filter((announcement) => announcement.is_active).length, [announcements]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSaving(true);

    try {
      await api.post("/admin/announcements", {
        ...form,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
      });
      setNotice("Announcement posted. Teachers will see it in System Announcements.");
      setForm({ title: "", message: "", type: "Update", priority: "Normal", starts_at: "", ends_at: "", is_active: true });
      await load();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Announcement could not be posted."));
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (announcement: Announcement) => {
    if (!window.confirm(`Delete announcement "${announcement.title}"?`)) return;
    await api.delete(`/admin/announcements/${announcement.id}`);
    await load();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 dark:text-sky-300"><Megaphone className="size-4" /> System announcements</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Updates teachers should know</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">Clean notices for maintenance, new features, and developer updates so everyone stays aware before changes affect daily work.</p>
          </div>
          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <p className="text-xs font-medium text-sky-200">Active notices</p>
            <p className="mt-2 text-4xl font-semibold">{activeCount}</p>
            <p className="mt-1 text-xs text-slate-300">Visible to teachers now</p>
          </div>
        </div>
      </section>

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p> : null}
      {notice ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{notice}</p> : null}

      <div className={`grid gap-5 ${canManage ? "xl:grid-cols-[390px_minmax(0,1fr)]" : ""}`}>
        {canManage ? <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" onSubmit={submit}>
          <h2 className="flex items-center gap-2 font-semibold text-slate-950 dark:text-white"><Plus className="size-5 text-sky-600" /> Post announcement</h2>
          <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Title<input className={inputClass} onChange={(event) => setForm({ ...form, title: event.target.value })} required value={form.title} /></label>
          <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Message<textarea className={inputClass} onChange={(event) => setForm({ ...form, message: event.target.value })} required rows={5} value={form.message} /></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type<select className={inputClass} onChange={(event) => setForm({ ...form, type: event.target.value as AnnouncementType })} value={form.type}>{types.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority<select className={inputClass} onChange={(event) => setForm({ ...form, priority: event.target.value as AnnouncementPriority })} value={form.priority}>{priorities.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start showing<input className={inputClass} onChange={(event) => setForm({ ...form, starts_at: event.target.value })} type="datetime-local" value={form.starts_at} /></label>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Stop showing<input className={inputClass} onChange={(event) => setForm({ ...form, ends_at: event.target.value })} type="datetime-local" value={form.ends_at} /></label>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><input checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} type="checkbox" /> Publish as active</label>
          <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500" disabled={isSaving} type="submit">{isSaving ? <Loader2 className="size-4 animate-spin" /> : <BellRing className="size-4" />}{isSaving ? "Posting..." : "Post announcement"}</button>
        </form> : null}

        <section className="space-y-4">
          {isLoading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900"><Loader2 className="mx-auto mb-3 size-5 animate-spin" /> Loading announcements...</div> : announcements.map((announcement) => <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" key={announcement.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-sky-50 p-2.5 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"><Megaphone className="size-5" /></div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{announcement.type}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClass(announcement.priority)}`}>{announcement.priority}</span>
                    {!announcement.is_active ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800">Inactive</span> : null}
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">{announcement.title}</h2>
                </div>
              </div>
              {canManage ? <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300" onClick={() => void remove(announcement)} type="button"><Trash2 className="size-4" /></button> : null}
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{announcement.message}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-3.5" /> From {formatDate(announcement.starts_at)}</span>
              <span>Until {announcement.ends_at ? formatDate(announcement.ends_at) : "further notice"}</span>
              {announcement.creator ? <span>Posted by {announcement.creator.name}</span> : null}
            </div>
          </article>)}
          {!isLoading && announcements.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900"><CheckCircle2 className="mx-auto mb-3 size-6 text-emerald-600" />No system announcements right now.</div> : null}
        </section>
      </div>
    </div>
  );
}
