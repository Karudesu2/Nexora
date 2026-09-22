import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import { LoginPage } from "./LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { RegisterPage } from "./RegisterPage";
import { ModulePage, PacingPage, ReportsPage, SettingsPage } from "./pages/ModulePage";
import { AlignmentPage, AssessmentsPage, LessonsPage, NotificationsPage, ResourcesPage } from "./pages/TeachingPages";
import { AdministrationPage } from "./pages/AdministrationPage";
import { CalendarPage } from "./pages/CalendarPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/competencies" element={<ModulePage module="competencies" />} />
          <Route path="/lessons" element={<LessonsPage />} />
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
    </Routes>
  );
}
