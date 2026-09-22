import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import { LoginPage } from "./LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { RegisterPage } from "./RegisterPage";

const CalendarPage = lazy(() => import("./pages/CalendarPage").then(({ CalendarPage: Page }) => ({ default: Page })));
const ModulePage = lazy(() => import("./pages/ModulePage").then(({ ModulePage: Page }) => ({ default: Page })));
const PacingPage = lazy(() => import("./pages/ModulePage").then(({ PacingPage: Page }) => ({ default: Page })));
const ReportsPage = lazy(() => import("./pages/ModulePage").then(({ ReportsPage: Page }) => ({ default: Page })));
const SettingsPage = lazy(() => import("./pages/ModulePage").then(({ SettingsPage: Page }) => ({ default: Page })));
const AlignmentPage = lazy(() => import("./pages/TeachingPages").then(({ AlignmentPage: Page }) => ({ default: Page })));
const AssessmentsPage = lazy(() => import("./pages/TeachingPages").then(({ AssessmentsPage: Page }) => ({ default: Page })));
const LessonsPage = lazy(() => import("./pages/LessonPlannerPage").then(({ LessonsPage: Page }) => ({ default: Page })));
const CreateLessonPage = lazy(() => import("./pages/LessonPlannerPage").then(({ CreateLessonPage: Page }) => ({ default: Page })));
const TemplatesPage = lazy(() => import("./pages/LessonPlannerPage").then(({ TemplatesPage: Page }) => ({ default: Page })));
const NotificationsPage = lazy(() => import("./pages/TeachingPages").then(({ NotificationsPage: Page }) => ({ default: Page })));
const ResourcesPage = lazy(() => import("./pages/TeachingPages").then(({ ResourcesPage: Page }) => ({ default: Page })));
const AdministrationPage = lazy(() => import("./pages/AdministrationPage").then(({ AdministrationPage: Page }) => ({ default: Page })));
const UserManagementPage = lazy(() => import("./pages/UserManagementPage").then(({ UserManagementPage: Page }) => ({ default: Page })));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage").then(({ AdminDashboardPage: Page }) => ({ default: Page })));

function PageLoader() {
  return <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">Loading page...</div>;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}><Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/competencies" element={<ModulePage module="competencies" />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/lessons/create" element={<CreateLessonPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/alignment" element={<AlignmentPage />} />
          <Route path="/administration" element={<AdministrationPage />} />
          <Route path="/administration/users" element={<UserManagementPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/pacing" element={<PacingPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></Suspense>
  );
}
