import { useEffect, useState } from "react";
import { Brain, ScanSearch, TrendingUp } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { StatCard } from "../components/StatCard";
import type { DashboardData, ProgressData } from "../types";

function pct(value?: number) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

export function AnalyticsPage() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([api.dashboard(token), api.progress(token)]).then(([dash, prog]) => {
      setDashboard(dash);
      setProgress(prog);
    });
  }, [token]);

  if (!dashboard || !progress) return <div className="text-slate-500">Loading analytics...</div>;

  const stats = dashboard.stats;
  const lastTen = progress.history.slice(-10);
  const lastTenAccuracy = lastTen.length
    ? lastTen.filter((attempt) => attempt.is_correct).length / lastTen.length
    : 0;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">Analytics</h1>
        <p className="mt-1 text-slate-500">Signals that explain skill growth, weak spots, and reasoning maturity.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Recent Accuracy" value={pct(lastTenAccuracy)} detail="Last 10 attempts" icon={TrendingUp} tone="teal" />
        <StatCard title="Reasoning Average" value={pct(stats.reasoning_average)} detail="All attempts" icon={Brain} tone="amber" />
        <StatCard title="Weak Areas" value={dashboard.weaknesses.length} detail="Detected from answer and reasoning quality" icon={ScanSearch} tone="rose" />
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-lg font-semibold tracking-normal">Weakness Risk Model</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.weaknesses.map((weakness) => (
              <div key={weakness.scenario_type} className="rounded-md border border-slate-200 p-4">
                <div className="flex justify-between gap-3">
                  <span className="font-medium capitalize">{weakness.scenario_type.replace("_", " ")}</span>
                  <span className="text-sm text-rose-700">{pct(weakness.risk)}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-rose-500" style={{ width: pct(weakness.risk) }} />
                </div>
              </div>
            ))}
            {dashboard.weaknesses.length === 0 && <div className="text-sm text-slate-500">No risk model yet.</div>}
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="text-lg font-semibold tracking-normal">Recommendation Queue</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.recommendations.map((rec) => (
              <div key={rec.title} className="rounded-md border border-slate-200 p-4">
                <div className="font-medium text-slate-950">{rec.title}</div>
                <div className="mt-1 text-sm leading-6 text-slate-600">{rec.reason}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
