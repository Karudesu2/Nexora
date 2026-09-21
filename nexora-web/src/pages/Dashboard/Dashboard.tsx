import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Loader2,
  CalendarDays,
} from "lucide-react";
import api from "../../services/api";

interface Lesson {
  id: number;
  title: string;
  lesson_date: string;
  status: string;
  subject?: {
    id: number;
    name: string;
  };
  grade?: {
    id: number;
    name: string;
  };
}

interface DashboardData {
  teacher: {
    id: number;
    name: string;
    email: string;
  };
  stats: {
    total_lessons: number;
    completed_lessons: number;
    pending_lessons: number;
    competencies: number;
    assessments: number;
  };
  today: {
    date: string;
    lessons: Lesson[];
  };
  upcoming_lessons: Lesson[];
  calendar_events: unknown[];
}

interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
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
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error || "No dashboard data available."}
      </div>
    );
  }

  const stats = [
    {
      label: "Total Lessons",
      value: dashboard.stats.total_lessons,
      icon: BookOpen,
    },
    {
      label: "Completed",
      value: dashboard.stats.completed_lessons,
      icon: CheckCircle2,
    },
    {
      label: "Pending",
      value: dashboard.stats.pending_lessons,
      icon: Clock3,
    },
    {
      label: "Competencies",
      value: dashboard.stats.competencies,
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-slate-500">Teacher Dashboard</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Welcome, {dashboard.teacher.name}
        </h1>

        <p className="mt-2 text-slate-500">
          Here is your current teaching and planning overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 p-3">
                  <Icon className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">Today's Lessons</h2>
            <p className="mt-1 text-sm text-slate-500">
              {dashboard.today.date}
            </p>
          </div>

          <div className="p-5">
            {dashboard.today.lessons.length === 0 ? (
              <p className="text-sm text-slate-500">
                No lessons scheduled for today.
              </p>
            ) : (
              <div className="space-y-3">
                {dashboard.today.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <h3 className="font-medium text-slate-900">
                      {lesson.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {lesson.subject?.name || "No subject"} •{" "}
                      {lesson.grade?.name || "No grade"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Upcoming Lessons
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your next scheduled lessons
            </p>
          </div>

          <div className="p-5">
            {dashboard.upcoming_lessons.length === 0 ? (
              <p className="text-sm text-slate-500">
                No upcoming lessons.
              </p>
            ) : (
              <div className="space-y-3">
                {dashboard.upcoming_lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <h3 className="font-medium text-slate-900">
                      {lesson.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {lesson.lesson_date} •{" "}
                      {lesson.subject?.name || "No subject"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

