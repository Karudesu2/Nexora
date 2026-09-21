import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import { LoginPage } from "./LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";

function Calendar() {
  return <div>Calendar</div>;
}

function Competencies() {
  return <div>Competencies</div>;
}

function Lessons() {
  return <div>Lessons</div>;
}

function Assessments() {
  return <div>Assessments</div>;
}

function Pacing() {
  return <div>Pacing</div>;
}

function Reports() {
  return <div>Reports</div>;
}

function Settings() {
  return <div>Settings</div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/competencies" element={<Competencies />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/pacing" element={<Pacing />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
