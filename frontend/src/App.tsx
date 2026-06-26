import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAuth } from "./auth/AuthContext";
import { LoginPage } from "./pages/Login";
import { DashboardPage } from "./pages/Dashboard";
import { ModesPage } from "./pages/Modes";
import { TrainingPage } from "./pages/Training";
import { ProgressPage } from "./pages/Progress";
import { LeaderboardPage } from "./pages/Leaderboard";
import { AnalyticsPage } from "./pages/Analytics";
import { AdminPage } from "./pages/Admin";

function Protected({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-600">Loading DeepShield...</div>;
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminOnly({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="modes" element={<ModesPage />} />
        <Route path="training" element={<TrainingPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route
          path="admin"
          element={
            <AdminOnly>
              <AdminPage />
            </AdminOnly>
          }
        />
      </Route>
    </Routes>
  );
}
