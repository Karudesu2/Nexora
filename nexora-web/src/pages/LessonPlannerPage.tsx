/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bold,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Edit3,
  Eye,
  FileImage,
  FilePlus2,
  FileText,
  Heading1,
  Italic,
  LayoutTemplate,
  Link2,
  List,
  Loader2,
  Printer,
  Redo2,
  Save,
  Search,
  Table2,
  Trash2,
  Underline,
  Undo2,
} from "lucide-react";
import api from "../services/api";
import { getApiErrorMessage } from "../services/getApiErrorMessage";
import { getPlanningContext } from "../services/planningContext";

interface ApiResponse<T> { data: T; }
interface Option { id: number; name: string; }
interface Term extends Option { school_year_id: number; }
interface PlanningContext { school_years: Option[]; terms: Term[]; grades: Option[]; subjects: Option[]; }
interface Competency { id: number; code: string; description: string; grade_id: number; subject_id: number; term_id: number; learning_area?: string | null; }
interface Lesson { id: number; title: string; lesson_date: string; section: string; status: string; school_year_id: number; term_id: number; grade_id: number; subject_id: number; content?: string | null; grade?: Option; subject?: Option; created_at?: string; updated_at?: string; source_file_name?: string | null; }
interface LessonDetail extends Lesson { plan_data?: Partial<LessonDraft> | null; }
interface LessonVersion { id: number; version_number: number; title: string; status: string; created_at: string; user?: { id: number; name: string }; }
interface LessonTemplate { id: number; title: string; category?: string | null; description?: string | null; structure?: Partial<LessonDraft> | null; is_public: boolean; user?: { id: number; name: string } | null; created_at?: string; }

interface LessonDraft {
  teacherName: string;
  schoolYearId: string;
  termId: string;
  gradeId: string;
  subjectId: string;
  quarter: string;
  weekNumber: string;
  section: string;
  date: string;
  title: string;
  learningArea: string;
  learnerProfile: string;
  learnerBackground: string;
  priorKnowledge: string;
  learningNeeds: string;
  classroomConsiderations: string;
  competencyId: string;
  learningCompetencies: string;
  objectives: string;
  contentStandards: string;
  performanceStandards: string;
  targetSkills: string;
  lessonDuration: string;
  lessonSchedule: string;
  pacing: string;
  materials: string;
  references: string;
  digitalResources: string;
  classroomEquipment: string;
  additionalResources: string;
  motivationActivity: string;
  reviewActivity: string;
  lessonIntroduction: string;
  lessonPresentation: string;
  learningActivities: string;
  guidedPractice: string;
  independentPractice: string;
  assessment: string;
  assignment: string;
  learnerGains: string;
  teacherReflection: string;
  challenges: string;
  improvements: string;
  aiUsed: string;
  aiToolsUsed: string;
  aiContribution: string;
}

const emptyDraft: LessonDraft = {
  teacherName: "",
  schoolYearId: "",
  termId: "",
  gradeId: "",
  subjectId: "",
  quarter: "",
  weekNumber: "",
  section: "",
  date: "",
  title: "",
  learningArea: "",
  learnerProfile: "",
  learnerBackground: "",
  priorKnowledge: "",
  learningNeeds: "",
  classroomConsiderations: "",
  competencyId: "",
  learningCompetencies: "",
  objectives: "",
  contentStandards: "",
  performanceStandards: "",
  targetSkills: "",
  lessonDuration: "",
  lessonSchedule: "",
  pacing: "",
  materials: "",
  references: "",
  digitalResources: "",
  classroomEquipment: "",
  additionalResources: "",
  motivationActivity: "",
  reviewActivity: "",
  lessonIntroduction: "",
  lessonPresentation: "",
  learningActivities: "",
  guidedPractice: "",
  independentPractice: "",
  assessment: "",
  assignment: "",
  learnerGains: "",
  teacherReflection: "",
  challenges: "",
  improvements: "",
  aiUsed: "No",
  aiToolsUsed: "",
  aiContribution: "",
};

const inputClass = "mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950";
const secondaryButton = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";
const primaryButton = "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500";

const steps = [
  { title: "Lesson Information", fields: ["Teacher", "Subject", "Grade", "Quarter", "Week", "Date", "Title"] },
  { title: "Learners' Context", fields: ["Learner profile", "Prior knowledge", "Learning needs", "Classroom considerations"] },
  { title: "Curriculum Targets", fields: ["Competencies", "Objectives", "Standards", "Skills", "Pacing"] },
  { title: "Resources", fields: ["Materials", "References", "Digital resources", "Equipment"] },
  { title: "Lesson Activities", fields: ["Pre-lesson", "Learning experience", "Practice", "Assessment"] },
  { title: "Reflection", fields: ["Gains", "Reflection", "Challenges", "AI disclosure"] },
];

const stepDescriptions = [
  "Set the teaching context and the essential details for this lesson.",
  "Capture what learners already know and the support they need.",
  "Connect the lesson to curriculum expectations and a practical pace.",
  "List the materials and tools needed before class begins.",
  "Write the learning sequence, practice, and assessment plan.",
  "Record outcomes, next steps, and any AI assistance used.",
];

function formatDate(value?: string) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function makeContent(draft: LessonDraft, competency?: Competency) {
  return [
    `A. LESSON INFORMATION\nTeacher Name: ${draft.teacherName}\nSubject: ${draft.subjectId}\nGrade Level: ${draft.gradeId}\nQuarter: ${draft.quarter}\nWeek Number: ${draft.weekNumber}\nDate: ${draft.date}\nLesson Title: ${draft.title}\nLearning Area: ${draft.learningArea}`,
    `B. LEARNERS' CONTEXT\nLearner Profile: ${draft.learnerProfile}\nLearner Background: ${draft.learnerBackground}\nPrior Knowledge: ${draft.priorKnowledge}\nLearning Needs: ${draft.learningNeeds}\nClassroom Considerations: ${draft.classroomConsiderations}`,
    `C. CURRICULAR TARGETS AND PACING\nLearning Competencies: ${draft.learningCompetencies || (competency ? `${competency.code} - ${competency.description}` : "")}\nLearning Objectives:\n${draft.objectives}\nContent Standards: ${draft.contentStandards}\nPerformance Standards: ${draft.performanceStandards}\nTarget Skills: ${draft.targetSkills}\nLesson Duration: ${draft.lessonDuration}\nLesson Schedule: ${draft.lessonSchedule}\nPacing: ${draft.pacing}`,
    `D. AVAILABLE RESOURCES\nLearning Materials: ${draft.materials}\nReferences: ${draft.references}\nDigital Resources: ${draft.digitalResources}\nClassroom Equipment: ${draft.classroomEquipment}\nAdditional Resources: ${draft.additionalResources}`,
    `E. LESSON FLOW\nPre-Lesson\nMotivation Activity: ${draft.motivationActivity}\nReview Activity: ${draft.reviewActivity}\nLesson Introduction: ${draft.lessonIntroduction}\n\nActual Learning Experience\nLesson Presentation: ${draft.lessonPresentation}\nLearning Activities: ${draft.learningActivities}\nGuided Practice: ${draft.guidedPractice}\nIndependent Practice: ${draft.independentPractice}\nAssessment: ${draft.assessment}\nAssignment/Extension Activity: ${draft.assignment}`,
    `F. REFLECTION AND SELF-CHECK\nLearner Gains: ${draft.learnerGains}\nTeaching Reflection: ${draft.teacherReflection}\nChallenges: ${draft.challenges}\nImprovements: ${draft.improvements}`,
    `G. AI USE DISCLOSURE\nAI Used: ${draft.aiUsed}\nAI Tools Used: ${draft.aiToolsUsed}\nAI Contribution: ${draft.aiContribution}`,
  ].join("\n\n");
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const style = normalized === "completed"
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
    : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>{normalized === "completed" ? "Completed" : "Draft"}</span>;
}

function LessonSkeleton() {
  return <div className="space-y-3" aria-busy="true">{Array.from({ length: 4 }, (_, index) => <div className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" key={index} />)}</div>;
}

function PrintableLesson({ lesson }: { lesson: Lesson }) {
  return <article className="print-document hidden bg-white p-10 text-slate-950 print:block">
    <header className="border-b border-slate-300 pb-4">
      <p className="text-sm font-semibold uppercase tracking-wide">NEXORA Lesson Plan</p>
      <h1 className="mt-2 text-2xl font-bold">{lesson.title}</h1>
      <p className="mt-1 text-sm">{[lesson.subject?.name, lesson.grade?.name, lesson.section, formatDate(lesson.lesson_date)].filter(Boolean).join(" | ")}</p>
    </header>
    <section className="mt-6 whitespace-pre-wrap text-sm leading-7">
      {lesson.content || "No detailed lesson content has been added yet."}
    </section>
  </article>;
}

function downloadText(filename: string, text: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function lessonDocumentHtml(lesson: Lesson) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${lesson.title}</title></head><body><h1>${lesson.title}</h1><p>${[lesson.subject?.name, lesson.grade?.name, lesson.section, formatDate(lesson.lesson_date)].filter(Boolean).join(" | ")}</p><pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${lesson.content || ""}</pre></body></html>`;
}

function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<LessonTemplate[]>([]);
  const [form, setForm] = useState({
    title: "",
    category: "Daily Lesson Log",
    description: "",
    structure: "",
    isPublic: false,
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadTemplates = async () => {
    const response = await api.get<ApiResponse<LessonTemplate[]>>("/lesson-templates");
    setTemplates(response.data.data);
  };

  useEffect(() => {
    void loadTemplates()
      .catch((loadError: unknown) => setError(getApiErrorMessage(loadError, "Templates could not be loaded.")))
      .finally(() => setIsLoading(false));
  }, []);

  const saveTemplate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSaving(true);

    try {
      await api.post("/lesson-templates", {
        title: form.title,
        category: form.category,
        description: form.description,
        is_public: form.isPublic,
        structure: {
          lessonIntroduction: form.structure,
          learningActivities: form.structure,
          assessment: "",
          teacherReflection: "",
        },
      });
      setNotice("Template posted. You can now use it in the Lesson Planner.");
      setForm({ title: "", category: "Daily Lesson Log", description: "", structure: "", isPublic: false });
      await loadTemplates();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Template could not be posted."));
    } finally {
      setIsSaving(false);
    }
  };

  const applyTemplate = (template: LessonTemplate) => {
    const templateDraft = {
      ...emptyDraft,
      title: template.title,
      learningActivities: template.structure?.learningActivities || template.description || "",
      lessonIntroduction: template.structure?.lessonIntroduction || "",
      assessment: template.structure?.assessment || "",
      teacherReflection: template.structure?.teacherReflection || "",
      ...template.structure,
    };

    localStorage.setItem("nexora_lesson_draft", JSON.stringify(templateDraft));
    navigate("/lessons");
  };

  const removeTemplate = async (template: LessonTemplate) => {
    if (!window.confirm(`Delete template "${template.title}"?`)) return;
    setError("");
    try {
      await api.delete(`/lesson-templates/${template.id}`);
      setNotice("Template deleted.");
      await loadTemplates();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, "The template could not be deleted."));
    }
  };

  return <div className="mx-auto w-full max-w-[1600px] space-y-5">
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-5 py-6 dark:border-slate-800 dark:from-sky-500/10 dark:via-slate-900 dark:to-indigo-500/10 sm:px-7 sm:py-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-sm font-semibold text-sky-700 dark:text-sky-300">Template library</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Build lessons from a strong start</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">Save your best lesson structures once, then apply them in the planner whenever you need a reliable starting point.</p></div>
          <div className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-sky-200 bg-white/80 px-3 py-2 text-sm font-semibold text-sky-800 shadow-sm dark:border-sky-900 dark:bg-slate-950/70 dark:text-sky-200"><LayoutTemplate className="size-4" /> {templates.length} saved</div>
        </div>
      </div>
    </section>

    {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p> : null}
    {notice ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{notice}</p> : null}

    <div className="grid items-start gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
      <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-28" onSubmit={saveTemplate}>
        <div className="flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"><LayoutTemplate className="size-5" /></div><div><h2 className="font-semibold text-slate-950 dark:text-white">Create a template</h2><p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">Keep the reusable flow here; add class-specific details in the planner.</p></div></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Template title<input className={inputClass} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Inquiry-based science" required value={form.title} /></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Template type<select className={inputClass} onChange={(event) => setForm({ ...form, category: event.target.value })} value={form.category}><option>Daily Lesson Log</option><option>4A Lesson Plan</option><option>Assessment-Focused Plan</option><option>Custom</option></select></label>
        </div>
        <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Purpose or notes<textarea className={`${inputClass} min-h-28 resize-y leading-6`} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="When and why this template works well" rows={3} value={form.description} /></label>
        <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Reusable lesson flow<textarea className={`${inputClass} min-h-48 resize-y leading-6`} onChange={(event) => setForm({ ...form, structure: event.target.value })} placeholder="Example: Review, motivation, discussion, guided practice, assessment, reflection" required rows={6} value={form.structure} /></label>
        <label className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-300"><input checked={form.isPublic} className="mt-0.5" onChange={(event) => setForm({ ...form, isPublic: event.target.checked })} type="checkbox" /><span><span className="font-medium">Share with other teachers</span><span className="mt-0.5 block text-xs text-slate-500">Public templates can be reused by your school.</span></span></label>
        <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500" disabled={isSaving} type="submit">{isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{isSaving ? "Saving template..." : "Save template"}</button>
      </form>

      <section className="min-w-0"><div className="mb-4 flex items-end justify-between gap-4"><div><h2 className="font-semibold text-slate-950 dark:text-white">Your template collection</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose one to open a prepared lesson draft.</p></div><span className="hidden text-sm text-slate-500 sm:block">{isLoading ? "Loading..." : `${templates.length} available`}</span></div>
      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900"><Loader2 className="mx-auto mb-3 size-5 animate-spin text-sky-600" />Loading templates...</div> : templates.map((template) => <article className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-900" key={template.id}>
          <div className="flex items-start justify-between gap-3"><div className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"><LayoutTemplate className="size-5" /></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${template.is_public ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{template.is_public ? "Shared" : "Personal"}</span></div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">{template.category || "Custom template"}</p><h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{template.title}</h3>
          <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600 dark:text-slate-400">{template.description || template.structure?.learningActivities || "Reusable lesson structure."}</p>
          <div className="mt-auto flex flex-wrap gap-2 pt-5">
            <button className={primaryButton} onClick={() => applyTemplate(template)} type="button"><FilePlus2 className="size-4" /> Use template</button>
            <button className={secondaryButton} onClick={() => void removeTemplate(template)} type="button"><Trash2 className="size-4" /> Delete</button>
          </div>
        </article>)}
        {!isLoading && templates.length === 0 ? <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900"><LayoutTemplate className="mx-auto mb-3 size-6 text-sky-600" />No templates yet. Create your first reusable lesson structure.</div> : null}
      </div></section>
    </div>
  </div>;
}

function LessonPlanner({ startCreating = false }: { startCreating?: boolean }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [context, setContext] = useState<PlanningContext | null>(null);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [draft, setDraft] = useState<LessonDraft>(() => {
    const saved = localStorage.getItem("nexora_lesson_draft");
    return saved ? { ...emptyDraft, ...JSON.parse(saved) as Partial<LessonDraft> } : emptyDraft;
  });
  const [activeStep, setActiveStep] = useState(0);
  const [expandedStep, setExpandedStep] = useState(0);
  const [query, setQuery] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [versions, setVersions] = useState<LessonVersion[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savePhase, setSavePhase] = useState<"" | "Validating lesson…" | "Saving lesson…" | "Saving lesson details…">("");
  const [isDirty, setIsDirty] = useState(false);

  const load = async () => {
    const [lessonResponse, contextResponse, competencyResponse] = await Promise.all([
      api.get<ApiResponse<Lesson[]>>("/lessons"),
      getPlanningContext(),
      api.get<ApiResponse<Competency[]>>("/competencies"),
    ]);
    setLessons(lessonResponse.data.data);
    setContext(contextResponse);
    setCompetencies(competencyResponse.data.data);
  };

  useEffect(() => {
    void load()
      .catch((loadError: unknown) => setError(getApiErrorMessage(loadError, "Lesson plans could not be loaded.")))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem("nexora_lesson_draft", JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (!isDirty || isSaving) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [isDirty, isSaving]);

  const filteredLessons = useMemo(() => lessons.filter((lesson) => `${lesson.title} ${lesson.subject?.name || ""} ${lesson.grade?.name || ""} ${lesson.status}`.toLowerCase().includes(query.toLowerCase())), [lessons, query]);
  const terms = context?.terms.filter((term) => !draft.schoolYearId || term.school_year_id === Number(draft.schoolYearId)) ?? [];
  const selectedCompetency = competencies.find((competency) => competency.id === Number(draft.competencyId));
  const progress = Math.round(((activeStep + 1) / steps.length) * 100);

  const setField = (field: keyof LessonDraft, value: string) => {
    setIsDirty(true);
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const saveLesson = async () => {
    setError("");
    setNotice("");
    setSavePhase("Validating lesson…");

    if (!draft.title.trim() || !draft.date || !draft.schoolYearId || !draft.termId || !draft.gradeId || !draft.subjectId) {
      setSavePhase("");
      setError("Add a title, date, school year, quarter, grade level, and subject before saving.");
      return;
    }

    if (draft.competencyId && !selectedCompetency) {
      setSavePhase("");
      setError("Choose a valid learning competency or remove the selection before saving.");
      return;
    }

    if (selectedCompetency && (Number(draft.gradeId) !== selectedCompetency.grade_id || Number(draft.subjectId) !== selectedCompetency.subject_id || Number(draft.termId) !== selectedCompetency.term_id)) {
      setSavePhase("");
      setError("The selected competency must match the lesson grade, subject, and quarter.");
      return;
    }

    setIsSaving(true);
    try {
      setSavePhase("Saving lesson…");
      const payload = {
        school_year_id: Number(draft.schoolYearId),
        term_id: Number(draft.termId),
        grade_id: Number(draft.gradeId),
        subject_id: Number(draft.subjectId),
        section: draft.section || "Default",
        title: draft.title,
        lesson_date: draft.date,
        content: makeContent(draft, selectedCompetency),
        plan_data: draft,
        status: "Draft",
      };
      let lessonResponse: { data: ApiResponse<Lesson> };

      try {
        lessonResponse = editingLessonId
          ? await api.put<ApiResponse<Lesson>>(`/lessons/${editingLessonId}`, payload)
          : await api.post<ApiResponse<Lesson>>("/lessons", payload);
      } catch (lessonError) {
        setError(getApiErrorMessage(lessonError, "The lesson could not be created. Your draft is still available."));
        return;
      }

      setSavePhase("Saving lesson details…");
      try {
        await api.put(`/lessons/${lessonResponse.data.data.id}/planning`, {
          objectives: draft.objectives.split("\n").map((objective) => objective.trim()).filter(Boolean),
          activities: [
            draft.motivationActivity,
            draft.reviewActivity,
            draft.lessonIntroduction,
            draft.lessonPresentation,
            draft.learningActivities,
            draft.guidedPractice,
            draft.independentPractice,
            draft.assessment,
            draft.assignment,
          ].filter(Boolean).map((title) => ({ title })),
          resources: [
            draft.materials,
            draft.references,
            draft.digitalResources,
            draft.classroomEquipment,
            draft.additionalResources,
          ].filter(Boolean).map((name) => ({ name, type: "Lesson resource" })),
          competency_ids: draft.competencyId ? [Number(draft.competencyId)] : [],
          reflection: {
            student_learning: draft.learnerGains,
            teacher_notes: draft.teacherReflection,
            challenges: draft.challenges,
            next_steps: draft.improvements,
          },
        });
      } catch (planningError) {
        setEditingLessonId(lessonResponse.data.data.id);
        setError(getApiErrorMessage(planningError, "The lesson was saved, but its details could not be saved. Review the form and retry."));
        return;
      }

      localStorage.removeItem("nexora_lesson_draft");
      setDraft(emptyDraft);
      setIsDirty(false);
      setEditingLessonId(null);
      setActiveStep(0);
      setExpandedStep(0);
      setNotice(editingLessonId ? "Lesson plan updated successfully." : "Lesson plan saved successfully.");
      void load().catch(() => setNotice("Lesson plan saved successfully. Refresh the page to reload the latest planner data."));
    } finally {
      setIsSaving(false);
      setSavePhase("");
    }
  };

  const importLesson = async () => {
    if (!importFile || !draft.schoolYearId || !draft.termId || !draft.gradeId || !draft.subjectId || !draft.date) {
      setError("Select a document, school year, quarter, grade, subject, and date before importing.");
      return;
    }

    setError("");
    setNotice("");
    setIsImporting(true);

    try {
      const data = new FormData();
      data.append("file", importFile);
      data.append("school_year_id", draft.schoolYearId);
      data.append("term_id", draft.termId);
      data.append("grade_id", draft.gradeId);
      data.append("subject_id", draft.subjectId);
      data.append("section", draft.section || "Imported");
      data.append("lesson_date", draft.date);

      await api.post("/lessons/import", data);

      setImportFile(null);
      setNotice("Document imported. Open the draft to complete any missing sections.");
      await load();
    } catch (importError) {
      setError(getApiErrorMessage(importError, "The document could not be imported."));
    } finally {
      setIsImporting(false);
    }
  };

  const openLesson = async (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setVersions([]);

    try {
      const response = await api.get<ApiResponse<LessonVersion[]>>(`/lessons/${lesson.id}/versions`);
      setVersions(response.data.data);
    } catch {
      setVersions([]);
    }
  };

  const restoreVersion = async (versionId: number) => {
    if (!selectedLesson) return;
    if (!window.confirm("Restore this version? Your current lesson content will be replaced.")) return;
    setError("");
    try {
      await api.post(`/lessons/${selectedLesson.id}/versions/${versionId}/restore`);
      setNotice("Version restored.");
      setSelectedLesson(null);
      await load();
    } catch (restoreError) {
      setError(getApiErrorMessage(restoreError, "The version could not be restored."));
    }
  };

  const copyLessonToPlanner = (lesson: Lesson) => {
    setDraft({
      ...emptyDraft,
      schoolYearId: String(lesson.school_year_id),
      termId: String(lesson.term_id),
      gradeId: String(lesson.grade_id),
      subjectId: String(lesson.subject_id),
      section: lesson.section,
      date: lesson.lesson_date,
      title: `${lesson.title} copy`,
      learningActivities: lesson.content || "",
    });
    setActiveStep(0);
    setExpandedStep(0);
    setNotice("Lesson copied into the planner.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const editLesson = async (lesson: Lesson) => {
    setError("");
    try {
      const response = await api.get<ApiResponse<LessonDetail>>(`/lessons/${lesson.id}`);
      const detail = response.data.data;
      setDraft({
        ...emptyDraft,
        ...detail.plan_data,
        schoolYearId: String(detail.school_year_id),
        termId: String(detail.term_id),
        gradeId: String(detail.grade_id),
        subjectId: String(detail.subject_id),
        section: detail.section,
        date: detail.lesson_date,
        title: detail.title,
      });
      setEditingLessonId(detail.id);
      setActiveStep(0);
      setExpandedStep(0);
      setNotice(`Editing “${detail.title}”. Save to update the existing lesson.`);
      document.getElementById("lesson-planner-form")?.scrollIntoView({ behavior: "smooth" });
    } catch (editError) {
      setError(getApiErrorMessage(editError, "The lesson could not be opened for editing."));
    }
  };

  const removeLesson = async (lessonId: number) => {
    if (!window.confirm("Delete this lesson plan?")) return;
    setError("");
    try {
      await api.delete(`/lessons/${lessonId}`);
      if (editingLessonId === lessonId) setEditingLessonId(null);
      setNotice("Lesson plan deleted.");
      await load();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, "The lesson plan could not be deleted."));
    }
  };

  const printLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    window.setTimeout(() => window.print(), 50);
  };

  const lessonList = <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-semibold text-slate-950 dark:text-white">My lesson plans</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{filteredLessons.length} plans found</p>
      </div>
      <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950">
        <Search className="size-4" />
        <input className="min-w-0 bg-transparent outline-none placeholder:text-slate-400" onChange={(event) => setQuery(event.target.value)} placeholder="Search lessons" type="search" value={query} />
      </label>
    </div>
    <div className="overflow-x-auto">
      {isLoading ? <div className="p-5"><LessonSkeleton /></div> : <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/70">
          <tr>{["Lesson title", "Subject", "Grade level", "Date created", "Status", "Actions"].map((heading) => <th className="px-4 py-3 font-semibold" key={heading}>{heading}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLessons.map((lesson) => <tr key={lesson.id}>
            <td className="min-w-64 px-4 py-4 font-medium text-slate-950 dark:text-white">{lesson.title}</td>
            <td className="whitespace-nowrap px-4 py-4 text-slate-600 dark:text-slate-400">{lesson.subject?.name || "Subject"}</td>
            <td className="whitespace-nowrap px-4 py-4 text-slate-600 dark:text-slate-400">{lesson.grade?.name || "Grade"}</td>
            <td className="whitespace-nowrap px-4 py-4 text-slate-600 dark:text-slate-400">{formatDate(lesson.created_at?.slice(0, 10) || lesson.lesson_date)}</td>
            <td className="whitespace-nowrap px-4 py-4"><StatusPill status={lesson.status} /></td>
            <td className="whitespace-nowrap px-4 py-4">
              <div className="flex items-center gap-1">
                <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white" onClick={() => void openLesson(lesson)} title="View" type="button"><Eye className="size-4" /></button>
                <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white" onClick={() => void editLesson(lesson)} title="Edit" type="button"><Edit3 className="size-4" /></button>
                <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white" onClick={() => copyLessonToPlanner(lesson)} title="Duplicate" type="button"><Copy className="size-4" /></button>
                <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white" onClick={() => printLesson(lesson)} title="Print" type="button"><Printer className="size-4" /></button>
                <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white" onClick={() => printLesson(lesson)} title="Print or save as PDF" type="button"><Download className="size-4" /></button>
                <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white" onClick={() => downloadText(`${lesson.title}.doc`, lessonDocumentHtml(lesson), "application/msword")} title="Download Word document" type="button"><FileText className="size-4" /></button>
                <button className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300" onClick={() => void removeLesson(lesson.id)} title="Delete" type="button"><Trash2 className="size-4" /></button>
              </div>
            </td>
          </tr>)}
          {filteredLessons.length === 0 ? <tr><td className="px-4 py-12 text-center text-slate-500 dark:text-slate-400" colSpan={6}>No lesson plans yet.</td></tr> : null}
        </tbody>
      </table>}
    </div>
  </section>;

  const planner = <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="border-b border-slate-100 p-5 dark:border-slate-800">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Create lesson plan</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{editingLessonId ? "You are editing an existing lesson. Saving updates that lesson." : "Draft is saved automatically in this browser while you type."}</p>
        </div>
        <p className="text-sm font-medium text-sky-700 dark:text-sky-300">{savePhase || (isDirty ? "Draft changes saved locally" : "All changes saved")}</p>
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400"><span>Step {activeStep + 1} of {steps.length}</span><span>{progress}% complete</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-sky-600" style={{ width: `${progress}%` }} /></div>
      </div>
    </div>
    <div className="grid gap-0 xl:grid-cols-[230px_minmax(0,1fr)]">
      <nav className="border-b border-slate-100 p-3 dark:border-slate-800 xl:border-b-0 xl:border-r">
        <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-1">
          {steps.map((step, index) => <button className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${activeStep === index ? "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"}`} key={step.title} onClick={() => { setActiveStep(index); setExpandedStep(index); }} type="button">
            <span className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${activeStep === index ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{index + 1}</span>
            <span>{step.title}</span>
          </button>)}
        </div>
      </nav>
      <div className="min-w-0 p-4 sm:p-6">
        <div className="space-y-4">
          {steps.map((step, index) => <section className="overflow-hidden rounded-xl bg-slate-50/70 ring-1 ring-slate-200 dark:bg-slate-950/30 dark:ring-slate-800" key={step.title}>
            <button className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5" onClick={() => { setExpandedStep(expandedStep === index ? -1 : index); setActiveStep(index); }} type="button">
              <span><span className="block font-semibold text-slate-950 dark:text-white">{step.title}</span><span className="mt-1 block text-xs font-normal leading-5 text-slate-500 dark:text-slate-400">{stepDescriptions[index]}</span></span>
              <ChevronDown className={`size-4 text-slate-500 transition ${expandedStep === index ? "rotate-180" : ""}`} />
            </button>
            {expandedStep === index ? <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">{renderStep(index)}</div> : null}
          </section>)}
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-2">
          <button className={secondaryButton} disabled={activeStep === 0} onClick={() => { setActiveStep((step) => Math.max(step - 1, 0)); setExpandedStep((step) => Math.max(step - 1, 0)); }} type="button"><ChevronLeft className="size-4" /> Back</button>
          <div className="ml-auto flex flex-wrap gap-2">
            <button className={primaryButton} disabled={isSaving} onClick={() => void saveLesson()} type="button">{isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{isSaving ? savePhase || "Saving…" : "Save Lesson Plan"}</button>
            <button className={secondaryButton} disabled={activeStep === steps.length - 1 || isSaving} onClick={() => { setActiveStep((step) => Math.min(step + 1, steps.length - 1)); setExpandedStep((step) => Math.min(step + 1, steps.length - 1)); }} type="button">Continue <ChevronRight className="size-4" /></button>
          </div>
        </div>
      </div>
    </div>
  </section>;

  function renderStep(index: number) {
    switch (index) {
      case 0:
        return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Teacher Name<input className={inputClass} onChange={(event) => setField("teacherName", event.target.value)} value={draft.teacherName} /></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject<select className={inputClass} onChange={(event) => setField("subjectId", event.target.value)} required value={draft.subjectId}><option value="">Select subject</option>{context?.subjects.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Grade Level<select className={inputClass} onChange={(event) => setField("gradeId", event.target.value)} required value={draft.gradeId}><option value="">Select grade</option>{context?.grades.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">School Year<select className={inputClass} onChange={(event) => setDraft({ ...draft, schoolYearId: event.target.value, termId: "" })} required value={draft.schoolYearId}><option value="">Select year</option>{context?.school_years.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quarter<select className={inputClass} onChange={(event) => { setField("termId", event.target.value); setField("quarter", terms.find((term) => term.id === Number(event.target.value))?.name || ""); }} required value={draft.termId}><option value="">Select quarter</option>{terms.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Week Number<input className={inputClass} min="1" onChange={(event) => setField("weekNumber", event.target.value)} type="number" value={draft.weekNumber} /></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date<input className={inputClass} onChange={(event) => setField("date", event.target.value)} required type="date" value={draft.date} /></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Section<input className={inputClass} onChange={(event) => setField("section", event.target.value)} placeholder="Example: Rizal" value={draft.section} /></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Learning Area<input className={inputClass} onChange={(event) => setField("learningArea", event.target.value)} value={draft.learningArea} /></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-2 xl:col-span-3">Lesson Title<input className={inputClass} onChange={(event) => setField("title", event.target.value)} required value={draft.title} /></label>
        </div>;
      case 1:
        return <div className="grid gap-5 xl:grid-cols-2"><SmartTextarea label="Learner Profile" value={draft.learnerProfile} onChange={(value) => setField("learnerProfile", value)} /><SmartTextarea label="Learner Background" value={draft.learnerBackground} onChange={(value) => setField("learnerBackground", value)} /><SmartTextarea label="Prior Knowledge" value={draft.priorKnowledge} onChange={(value) => setField("priorKnowledge", value)} /><SmartTextarea label="Learning Needs" value={draft.learningNeeds} onChange={(value) => setField("learningNeeds", value)} /><div className="xl:col-span-2"><SmartTextarea label="Classroom Considerations" value={draft.classroomConsiderations} onChange={(value) => setField("classroomConsiderations", value)} /></div></div>;
      case 2:
        return <div className="grid gap-5 xl:grid-cols-2"><label className="xl:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">Learning Competency<select className={inputClass} onChange={(event) => setField("competencyId", event.target.value)} value={draft.competencyId}><option value="">Add later</option>{competencies.filter((competency) => competency.grade_id === Number(draft.gradeId) && competency.subject_id === Number(draft.subjectId) && competency.term_id === Number(draft.termId)).map((competency) => <option key={competency.id} value={competency.id}>{competency.code} - {competency.description}</option>)}</select></label><SmartTextarea label="Learning Competencies" value={draft.learningCompetencies} onChange={(value) => setField("learningCompetencies", value)} /><SmartTextarea label="Learning Objectives" value={draft.objectives} onChange={(value) => setField("objectives", value)} /><SmartTextarea label="Content Standards" value={draft.contentStandards} onChange={(value) => setField("contentStandards", value)} /><SmartTextarea label="Performance Standards" value={draft.performanceStandards} onChange={(value) => setField("performanceStandards", value)} /><SmartTextarea label="Target Skills" value={draft.targetSkills} onChange={(value) => setField("targetSkills", value)} /><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Lesson Duration<input className={inputClass} onChange={(event) => setField("lessonDuration", event.target.value)} value={draft.lessonDuration} /></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Lesson Schedule<input className={inputClass} onChange={(event) => setField("lessonSchedule", event.target.value)} value={draft.lessonSchedule} /></label></div><div className="xl:col-span-2"><SmartTextarea label="Pacing" value={draft.pacing} onChange={(value) => setField("pacing", value)} /></div></div>;
      case 3:
        return <div className="grid gap-5 xl:grid-cols-2"><SmartTextarea label="Learning Materials" value={draft.materials} onChange={(value) => setField("materials", value)} /><SmartTextarea label="References" value={draft.references} onChange={(value) => setField("references", value)} /><SmartTextarea label="Digital Resources" value={draft.digitalResources} onChange={(value) => setField("digitalResources", value)} /><SmartTextarea label="Classroom Equipment" value={draft.classroomEquipment} onChange={(value) => setField("classroomEquipment", value)} /><div className="xl:col-span-2"><SmartTextarea label="Additional Resources" value={draft.additionalResources} onChange={(value) => setField("additionalResources", value)} /></div></div>;
      case 4:
        return <div className="grid gap-5 xl:grid-cols-2"><SmartTextarea label="Motivation Activity" value={draft.motivationActivity} onChange={(value) => setField("motivationActivity", value)} /><SmartTextarea label="Review Activity" value={draft.reviewActivity} onChange={(value) => setField("reviewActivity", value)} /><SmartTextarea label="Lesson Introduction" value={draft.lessonIntroduction} onChange={(value) => setField("lessonIntroduction", value)} /><SmartTextarea label="Lesson Presentation" value={draft.lessonPresentation} onChange={(value) => setField("lessonPresentation", value)} /><div className="xl:col-span-2"><SmartTextarea label="Learning Activities" value={draft.learningActivities} onChange={(value) => setField("learningActivities", value)} /></div><SmartTextarea label="Guided Practice" value={draft.guidedPractice} onChange={(value) => setField("guidedPractice", value)} /><SmartTextarea label="Independent Practice" value={draft.independentPractice} onChange={(value) => setField("independentPractice", value)} /><SmartTextarea label="Assessment" value={draft.assessment} onChange={(value) => setField("assessment", value)} /><SmartTextarea label="Assignment / Extension Activity" value={draft.assignment} onChange={(value) => setField("assignment", value)} /></div>;
      default:
        return <div className="grid gap-4"><SmartTextarea label="Learner Gains" value={draft.learnerGains} onChange={(value) => setField("learnerGains", value)} /><SmartTextarea label="Teaching Reflection" value={draft.teacherReflection} onChange={(value) => setField("teacherReflection", value)} /><SmartTextarea label="Challenges" value={draft.challenges} onChange={(value) => setField("challenges", value)} /><SmartTextarea label="Improvements" value={draft.improvements} onChange={(value) => setField("improvements", value)} /><label className="text-sm font-medium text-slate-700 dark:text-slate-300">AI Used<select className={inputClass} onChange={(event) => setField("aiUsed", event.target.value)} value={draft.aiUsed}><option>No</option><option>Yes</option></select></label><SmartTextarea label="AI Tools Used" value={draft.aiToolsUsed} onChange={(value) => setField("aiToolsUsed", value)} /><SmartTextarea label="AI Contribution" value={draft.aiContribution} onChange={(value) => setField("aiContribution", value)} /></div>;
    }
  }

  return <div className="mx-auto w-full max-w-[1600px] space-y-5">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">Lesson Planner</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Simple to create, easy to understand, fast to use.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">Plan daily lessons with a guided form, autosaved drafts, and clean document output.</p>
        </div>
        <button className={primaryButton} onClick={() => document.getElementById("lesson-planner-form")?.scrollIntoView({ behavior: "smooth" })} type="button"><FilePlus2 className="size-4" /> Create New Lesson Plan</button>
      </div>
    </section>
    {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p> : null}
    {notice ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{notice}</p> : null}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-semibold text-slate-950 dark:text-white">Upload Existing Lesson Plan</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Import DOC, DOCX, PDF, or TXT. DOCX/TXT content is extracted locally; other files are stored and opened as editable drafts.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:min-w-[520px]">
          <input accept=".doc,.docx,.pdf,.txt" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" onChange={(event) => setImportFile(event.target.files?.[0] || null)} type="file" />
          <button className={secondaryButton} disabled={isImporting} onClick={() => void importLesson()} type="button">{isImporting ? <Loader2 className="size-4 animate-spin" /> : <FilePlus2 className="size-4" />} Import</button>
        </div>
      </div>
    </section>
    <div id="lesson-planner-form">{(startCreating || lessons.length === 0) ? planner : null}</div>
    {lessonList}
    {!startCreating && lessons.length > 0 ? <div>{planner}</div> : null}
    {selectedLesson ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 print:static print:block print:bg-white print:p-0">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 print:hidden">
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="text-xl font-semibold text-slate-950 dark:text-white">{selectedLesson.title}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{[selectedLesson.subject?.name, selectedLesson.grade?.name, selectedLesson.section, formatDate(selectedLesson.lesson_date)].filter(Boolean).join(" | ")}</p></div>
          <button className={secondaryButton} onClick={() => setSelectedLesson(null)} type="button">Close</button>
        </div>
        <pre className="mt-5 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700 dark:bg-slate-950 dark:text-slate-300">{selectedLesson.content || "No detailed content yet."}</pre>
        <section className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <h3 className="font-semibold text-slate-950 dark:text-white">Version history</h3>
          <div className="mt-3 space-y-2">
            {versions.map((version) => <div className="flex flex-col gap-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between" key={version.id}>
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">Version {version.version_number} - {version.title}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{new Date(version.created_at).toLocaleString()} {version.user ? `by ${version.user.name}` : ""}</p>
              </div>
              <button className={secondaryButton} onClick={() => void restoreVersion(version.id)} type="button"><Undo2 className="size-4" /> Restore</button>
            </div>)}
            {versions.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">No saved versions yet.</p> : null}
          </div>
        </section>
        <div className="mt-5 flex flex-wrap gap-2"><button className={secondaryButton} onClick={() => printLesson(selectedLesson)} type="button"><Printer className="size-4" /> Print / save PDF</button><button className={secondaryButton} onClick={() => downloadText(`${selectedLesson.title}.doc`, lessonDocumentHtml(selectedLesson), "application/msword")} type="button"><FileText className="size-4" /> Word</button></div>
      </section>
      <PrintableLesson lesson={selectedLesson} />
    </div> : null}
  </div>;
}

function SmartTextarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const preview = value.trim() ? `${value.trim().slice(0, 130)}${value.trim().length > 130 ? "..." : ""}` : "No content yet.";
  const tools = [
    { label: "Bold", icon: Bold, insert: "**bold text**" },
    { label: "Italic", icon: Italic, insert: "_italic text_" },
    { label: "Underline", icon: Underline, insert: "<u>underlined text</u>" },
    { label: "Heading", icon: Heading1, insert: "## Heading" },
    { label: "List", icon: List, insert: "- List item" },
    { label: "Table", icon: Table2, insert: "| Column | Column |\n| --- | --- |\n| Text | Text |" },
    { label: "Image", icon: FileImage, insert: "![Image description](image-url)" },
    { label: "Link", icon: Link2, insert: "[Link text](https://)" },
  ];
  const append = (text: string) => onChange(value ? `${value}\n${text}` : text);

  const editor = <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 p-2 dark:border-slate-800">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white" key={tool.label} onClick={() => append(tool.insert)} title={tool.label} type="button"><Icon className="size-4" /></button>;
      })}
      <button className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white" onClick={() => document.execCommand("undo")} title="Undo" type="button"><Undo2 className="size-4" /></button>
      <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white" onClick={() => document.execCommand("redo")} title="Redo" type="button"><Redo2 className="size-4" /></button>
    </div>
    <textarea className="min-h-[100px] max-h-[300px] w-full resize-y bg-transparent px-4 py-3 text-sm leading-6 text-slate-900 outline-none dark:text-white" maxLength={5000} onChange={(event) => onChange(event.target.value)} rows={4} value={value} />
  </div>;

  return <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <span>{label}</span>
      <div className="flex gap-2">
        <button className="text-xs font-semibold text-sky-700 dark:text-sky-300" onClick={() => setCollapsed((current) => !current)} type="button">{collapsed ? "Show" : "Minimize"}</button>
        <button className="text-xs font-semibold text-sky-700 dark:text-sky-300" onClick={() => setExpanded(true)} type="button">Expand Editor</button>
      </div>
    </div>
    {collapsed ? <button className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm font-normal text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400" onClick={() => setCollapsed(false)} type="button">{preview}</button> : editor}
    <p className="mt-1 text-right text-xs font-normal text-slate-400 dark:text-slate-500">{value.length.toLocaleString()} / 5,000 characters</p>
    {expanded ? <div className="fixed inset-0 z-[60] bg-slate-950/60 p-4">
      <section className="mx-auto flex h-full max-w-5xl flex-col rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{label}</h2>
          <button className={secondaryButton} onClick={() => setExpanded(false)} type="button">Return to planner</button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">{editor}</div>
      </section>
    </div> : null}
  </div>;
}

export function LessonsPage() {
  return <LessonPlanner />;
}

export function CreateLessonPage() {
  return <LessonPlanner startCreating />;
}

export { TemplatesPage };
