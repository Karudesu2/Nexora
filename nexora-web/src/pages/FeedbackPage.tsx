import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Filter,
  Inbox,
  Loader2,
  MessageSquarePlus,
  Paperclip,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../auth";
import api from "../services/api";
import { getApiErrorMessage } from "../services/getApiErrorMessage";

type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

type FeedbackStatus = "Submitted" | "Reviewing" | "In Progress" | "Resolved" | "Closed";
type FeedbackCategory = "Bug Report" | "Feature Request" | "Improvement Suggestion" | "General Feedback";
type FeedbackPriority = "Low" | "Medium" | "High" | "Critical";

type FeedbackUpdate = {
  id: number;
  status: FeedbackStatus | null;
  message: string;
  created_at: string;
  user: { id: number; name: string } | null;
};

type FeedbackReport = {
  id: number;
  feedback_id: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  title: string;
  description: string;
  affected_module: string | null;
  steps_to_reproduce: string | null;
  suggested_solution: string | null;
  system_information: string | null;
  has_attachment: boolean;
  attachment_name: string | null;
  submitted_at: string;
  updated_at: string;
  user: { id: number; name: string; email: string } | null;
  updates: FeedbackUpdate[];
};

const categories: FeedbackCategory[] = ["Bug Report", "Feature Request", "Improvement Suggestion", "General Feedback"];
const priorities: FeedbackPriority[] = ["Low", "Medium", "High", "Critical"];
const statuses: FeedbackStatus[] = ["Submitted", "Reviewing", "In Progress", "Resolved", "Closed"];

const inputClass = "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-sky-600 dark:focus:ring-sky-950";

function StatusPill({ status }: { status: FeedbackStatus }) {
  const tone = status === "Resolved" || status === "Closed"
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
    : status === "In Progress"
      ? "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
      : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}

function PriorityPill({ priority }: { priority: FeedbackPriority }) {
  const tone = priority === "Critical"
    ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
    : priority === "High"
      ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{priority}</span>;
}

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function FeedbackDetail({ report, isAdmin, onDownloadAttachment }: { report: FeedbackReport | null; isAdmin?: boolean; onDownloadAttachment?: (report: FeedbackReport) => void }) {
  if (!report) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">Select a feedback item to review the full details and updates.</div>;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{report.feedback_id}</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">{report.title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{report.category} - Submitted {formatDate(report.submitted_at)}</p>
        </div>
        <div className="flex gap-2"><StatusPill status={report.status} /><PriorityPill priority={report.priority} /></div>
      </div>

      {isAdmin && report.user ? <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950"><p className="font-semibold text-slate-800 dark:text-slate-100">{report.user.name}</p><p className="text-slate-500 dark:text-slate-400">{report.user.email}</p></div> : null}

      <div className="mt-5 space-y-4 text-sm">
        <div><p className="font-semibold text-slate-800 dark:text-slate-100">Description</p><p className="mt-1 whitespace-pre-wrap leading-6 text-slate-600 dark:text-slate-300">{report.description}</p></div>
        {report.affected_module ? <div><p className="font-semibold text-slate-800 dark:text-slate-100">Page or module affected</p><p className="mt-1 text-slate-600 dark:text-slate-300">{report.affected_module}</p></div> : null}
        {report.steps_to_reproduce ? <div><p className="font-semibold text-slate-800 dark:text-slate-100">Steps to reproduce</p><p className="mt-1 whitespace-pre-wrap leading-6 text-slate-600 dark:text-slate-300">{report.steps_to_reproduce}</p></div> : null}
        {report.suggested_solution ? <div><p className="font-semibold text-slate-800 dark:text-slate-100">Suggested solution</p><p className="mt-1 whitespace-pre-wrap leading-6 text-slate-600 dark:text-slate-300">{report.suggested_solution}</p></div> : null}
        {report.has_attachment ? <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" onClick={() => onDownloadAttachment?.(report)} type="button"><Paperclip className="size-4" />{report.attachment_name ?? "Download attachment"}</button> : null}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"><Clock3 className="size-4 text-sky-600" /> Updates</h3>
        <div className="mt-3 space-y-3">
          {report.updates.map((update) => <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950" key={update.id}><div className="flex flex-wrap items-center gap-2">{update.status ? <StatusPill status={update.status} /> : null}<span className="text-xs text-slate-500">{formatDate(update.created_at)}{update.user ? ` - ${update.user.name}` : ""}</span></div><p className="mt-2 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{update.message}</p></div>)}
        </div>
      </div>
    </section>
  );
}

export function FeedbackPage() {
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: "Bug Report" as FeedbackCategory,
    title: "",
    description: "",
    priority: "Medium" as FeedbackPriority,
    affected_module: "",
    steps_to_reproduce: "",
    suggested_solution: "",
    attachment: null as File | null,
  });

  const selectedReport = reports.find((report) => report.id === selectedId) ?? reports[0] ?? null;

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<FeedbackReport[]>>("/feedback");
      setReports(response.data.data);
      setSelectedId((current) => current ?? response.data.data[0]?.id ?? null);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Feedback reports could not be loaded."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (form.attachment && form.attachment.size > 10 * 1024 * 1024) {
      setError("Attachments must be 10 MB or smaller.");
      return;
    }
    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      const response = await api.post<ApiResponse<FeedbackReport>>("/feedback", data, { headers: { "Content-Type": "multipart/form-data" } });
      setNotice("Feedback submitted. The development team can now review it.");
      setForm({ category: "Bug Report", title: "", description: "", priority: "Medium", affected_module: "", steps_to_reproduce: "", suggested_solution: "", attachment: null });
      await load();
      setSelectedId(response.data.data.id);
    } catch (submissionError) {
      setError(getApiErrorMessage(submissionError, "Feedback could not be submitted."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadAttachment = async (report: FeedbackReport) => {
    try {
      const response = await api.get(`/feedback/${report.id}/attachment`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data as Blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = report.attachment_name ?? `feedback-${report.id}-attachment`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch (downloadError) {
      setError(getApiErrorMessage(downloadError, "Attachment could not be opened."));
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-slate-950 p-5 text-white shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm font-medium text-sky-200">Help & Support</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Feedback and suggestions</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Report issues, request features, and track updates from the system team.</p></div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-50" onClick={() => document.getElementById("feedback-form")?.scrollIntoView({ behavior: "smooth" })} type="button"><MessageSquarePlus className="size-4" /> New feedback</button>
        </div>
      </section>

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p> : null}
      {notice ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{notice}</p> : null}

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-5">
          <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" id="feedback-form" onSubmit={submit}>
            <h2 className="font-semibold text-slate-900 dark:text-white">Submit feedback</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category<select className={inputClass} onChange={(event) => setForm({ ...form, category: event.target.value as FeedbackCategory })} value={form.category}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority<select className={inputClass} onChange={(event) => setForm({ ...form, priority: event.target.value as FeedbackPriority })} value={form.priority}>{priorities.map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Title<input className={inputClass} onChange={(event) => setForm({ ...form, title: event.target.value })} required value={form.title} /></label>
            <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Description<textarea className={inputClass} onChange={(event) => setForm({ ...form, description: event.target.value })} required rows={5} value={form.description} /></label>
            {form.category === "Bug Report" ? <><label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Page or module affected<input className={inputClass} onChange={(event) => setForm({ ...form, affected_module: event.target.value })} value={form.affected_module} /></label><label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Steps to reproduce<textarea className={inputClass} onChange={(event) => setForm({ ...form, steps_to_reproduce: event.target.value })} rows={4} value={form.steps_to_reproduce} /></label></> : null}
            <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Suggested solution <span className="font-normal text-slate-400">(optional)</span><textarea className={inputClass} onChange={(event) => setForm({ ...form, suggested_solution: event.target.value })} rows={3} value={form.suggested_solution} /></label>
            <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Attachment <span className="font-normal text-slate-400">(optional; JPG, PNG, WebP, PDF, TXT, DOC, or DOCX; max 10 MB)</span><input accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.doc,.docx" className={inputClass} onChange={(event) => setForm({ ...form, attachment: event.target.files?.[0] ?? null })} type="file" /></label>
            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500" disabled={isSubmitting} type="submit">{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}{isSubmitting ? "Submitting..." : "Submit feedback"}</button>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800"><h2 className="font-semibold text-slate-900 dark:text-white">Your submitted feedback</h2><button aria-label="Refresh feedback" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => void load()} type="button"><RefreshCw className="size-4" /></button></div>
            {isLoading ? <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="size-4 animate-spin" /> Loading...</div> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{reports.map((report) => <button className={`w-full p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60 ${selectedReport?.id === report.id ? "bg-sky-50/70 dark:bg-sky-500/10" : ""}`} key={report.id} onClick={() => setSelectedId(report.id)} type="button"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-500">{report.feedback_id}</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{report.title}</p><p className="mt-1 text-xs text-slate-500">{report.category} - {formatDate(report.submitted_at)}</p></div><StatusPill status={report.status} /></div></button>)}{reports.length === 0 ? <div className="p-8 text-center text-sm text-slate-500"><Inbox className="mx-auto mb-2 size-5" />No feedback submitted yet.</div> : null}</div>}
          </section>
        </div>

        <FeedbackDetail onDownloadAttachment={(report) => void downloadAttachment(report)} report={selectedReport} />
      </div>
    </div>
  );
}

export function AdminFeedbackPage() {
  const { user } = useAuth();
  const canManage = user?.role_codes?.some((role) => ["school_administrator", "administrator", "system_administrator"].includes(role)) ?? false;
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filters, setFilters] = useState({ category: "", priority: "", status: "", date_from: "", date_to: "" });
  const [statusForm, setStatusForm] = useState({ status: "Reviewing" as FeedbackStatus, message: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedReport = useMemo(() => reports.find((report) => report.id === selectedId) ?? reports[0] ?? null, [reports, selectedId]);

  const load = useCallback(async () => {
    if (!canManage) return;
    setIsLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      const response = await api.get<ApiResponse<FeedbackReport[]>>("/admin/feedback", { params });
      setReports(response.data.data);
      setSelectedId((current) => current ?? response.data.data[0]?.id ?? null);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Admin feedback reports could not be loaded."));
    } finally {
      setIsLoading(false);
    }
  }, [canManage, filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const updateStatus = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedReport) return;
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await api.patch<ApiResponse<FeedbackReport>>(`/admin/feedback/${selectedReport.id}`, statusForm);
      setReports((current) => current.map((report) => report.id === selectedReport.id ? response.data.data : report));
      setNotice("Feedback status updated and the teacher was notified.");
      setStatusForm({ status: response.data.data.status, message: "" });
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Feedback status could not be updated."));
    } finally {
      setIsSaving(false);
    }
  };

  const downloadAttachment = async (report: FeedbackReport) => {
    try {
      const response = await api.get(`/feedback/${report.id}/attachment`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data as Blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = report.attachment_name ?? `feedback-${report.id}-attachment`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch (downloadError) {
      setError(getApiErrorMessage(downloadError, "Attachment could not be opened."));
    }
  };

  if (!canManage) {
    return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"><div className="flex items-center gap-3"><AlertTriangle className="size-5" /><p className="text-sm font-semibold">Only authorized administrators can manage system feedback.</p></div></section>;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-slate-950 p-5 text-white shadow-sm sm:p-7"><div className="flex items-start gap-4"><div className="rounded-xl bg-white/10 p-3 text-sky-200"><ShieldCheck className="size-5" /></div><div><p className="text-sm font-medium text-sky-200">Administration</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Feedback management</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Review suggestions, track issues, update statuses, and notify users about progress.</p></div></div></section>
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p> : null}
      {notice ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{notice}</p> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <form className="grid gap-4 md:grid-cols-5" onSubmit={(event) => { event.preventDefault(); void load(); }}>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category<select className={inputClass} onChange={(event) => setFilters({ ...filters, category: event.target.value })} value={filters.category}><option value="">All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority<select className={inputClass} onChange={(event) => setFilters({ ...filters, priority: event.target.value })} value={filters.priority}><option value="">All</option>{priorities.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status<select className={inputClass} onChange={(event) => setFilters({ ...filters, status: event.target.value })} value={filters.status}><option value="">All</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">From<input className={inputClass} onChange={(event) => setFilters({ ...filters, date_from: event.target.value })} type="date" value={filters.date_from} /></label>
          <button className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500" type="submit"><Filter className="size-4" /> Filter</button>
        </form>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800"><h2 className="font-semibold text-slate-900 dark:text-white">All reports</h2></div>
          {isLoading ? <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="size-4 animate-spin" /> Loading...</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800"><tr><th className="px-5 py-3">ID</th><th className="px-5 py-3">Concern</th><th className="px-5 py-3">Teacher</th><th className="px-5 py-3">Priority</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Submitted</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{reports.map((report) => <tr className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${selectedReport?.id === report.id ? "bg-sky-50/70 dark:bg-sky-500/10" : ""}`} key={report.id} onClick={() => setSelectedId(report.id)}><td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">{report.feedback_id}</td><td className="px-5 py-4"><p className="font-semibold text-slate-900 dark:text-white">{report.title}</p><p className="mt-1 text-xs text-slate-500">{report.category}</p></td><td className="px-5 py-4 text-slate-600 dark:text-slate-300">{report.user?.name ?? "Unknown"}</td><td className="px-5 py-4"><PriorityPill priority={report.priority} /></td><td className="px-5 py-4"><StatusPill status={report.status} /></td><td className="px-5 py-4 text-xs text-slate-500">{formatDate(report.submitted_at)}</td></tr>)}</tbody></table>{reports.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No feedback matches the current filters.</div> : null}</div>}
        </section>

        <div className="space-y-5">
          <FeedbackDetail isAdmin onDownloadAttachment={(report) => void downloadAttachment(report)} report={selectedReport} />
          {selectedReport ? <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" onSubmit={updateStatus}><h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white"><CheckCircle2 className="size-5 text-emerald-600" /> Add developer update</h2><label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Status<select className={inputClass} onChange={(event) => setStatusForm({ ...statusForm, status: event.target.value as FeedbackStatus })} value={statusForm.status}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Update note<textarea className={inputClass} onChange={(event) => setStatusForm({ ...statusForm, message: event.target.value })} required rows={4} value={statusForm.message} /></label><button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500" disabled={isSaving} type="submit">{isSaving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Save update</button></form> : null}
        </div>
      </div>
    </div>
  );
}
