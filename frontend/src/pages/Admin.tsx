import { useEffect, useState } from "react";
import { Activity, Database, ShieldCheck, Users } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { StatCard } from "../components/StatCard";

export function AdminPage() {
  const { token } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api.adminMonitoring(token).then(setData).catch((err) => setError(err.message));
  }, [token]);

  if (error) return <div className="rounded-md bg-rose-50 p-4 text-rose-700">{error}</div>;
  if (!data) return <div className="text-slate-500">Loading admin monitoring...</div>;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">Admin Monitoring</h1>
        <p className="mt-1 text-slate-500">Operational view across users, attempts, and managed scenarios.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Users" value={data.user_count} detail="Registered accounts" icon={Users} tone="teal" />
        <StatCard title="Attempts" value={data.attempt_count} detail="Total submitted decisions" icon={Activity} tone="indigo" />
        <StatCard title="Today" value={data.attempts_today} detail="Attempts since midnight UTC" icon={ShieldCheck} tone="amber" />
        <StatCard title="Scenario Types" value={data.scenario_counts.length} detail="Plugin-backed content categories" icon={Database} tone="rose" />
      </section>
      <section className="panel p-5">
        <h2 className="text-lg font-semibold tracking-normal">Scenario Inventory</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.scenario_counts.map((row: any) => (
            <div key={row.scenario_type} className="rounded-md border border-slate-200 p-4">
              <div className="font-medium capitalize text-slate-950">{row.scenario_type.replace("_", " ")}</div>
              <div className="mt-2 text-2xl font-semibold">{row.count}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold tracking-normal">Top Learners</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Learner</th>
                <th className="px-5 py-3">Accuracy</th>
                <th className="px-5 py-3">Attempts</th>
                <th className="px-5 py-3">Reasoning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.leaderboard.map((row: any) => (
                <tr key={row.user_id}>
                  <td className="px-5 py-3 font-medium">{row.full_name}</td>
                  <td className="px-5 py-3">{Math.round(row.accuracy * 100)}%</td>
                  <td className="px-5 py-3">{row.attempts}</td>
                  <td className="px-5 py-3">{Math.round(row.reasoning_average * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
