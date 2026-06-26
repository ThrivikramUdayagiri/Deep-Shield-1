import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { ProgressData } from "../types";

function pct(value?: number) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

export function ProgressPage() {
  const { token } = useAuth();
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    if (token) api.progress(token).then(setData);
  }, [token]);

  if (!data) return <div className="text-slate-500">Loading progress...</div>;

  const rows = Object.entries(data.by_type);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">Progress Tracking</h1>
        <p className="mt-1 text-slate-500">Track accuracy and reasoning quality by scenario type.</p>
      </div>

      <section className="panel p-5">
        <h2 className="text-lg font-semibold tracking-normal">Performance by Type</h2>
        <div className="mt-5 grid gap-4">
          {rows.length === 0 && <div className="text-sm text-slate-500">Complete training scenarios to populate progress.</div>}
          {rows.map(([type, stats]) => (
            <div key={type} className="grid gap-2 rounded-md border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-medium capitalize text-slate-950">{type.replace("_", " ")}</div>
                <div className="text-sm text-slate-500">{stats.correct}/{stats.attempts} correct</div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase text-slate-500">Accuracy {pct(stats.accuracy)}</div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-teal-500" style={{ width: pct(stats.accuracy) }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase text-slate-500">Reasoning {pct(stats.reasoning_average)}</div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-amber-500" style={{ width: pct(stats.reasoning_average) }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold tracking-normal">Recent Attempts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Verdict</th>
                <th className="px-5 py-3">Correct</th>
                <th className="px-5 py-3">Reasoning</th>
                <th className="px-5 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.history.map((attempt) => (
                <tr key={attempt.id}>
                  <td className="px-5 py-3 capitalize">{attempt.scenario_type.replace("_", " ")}</td>
                  <td className="px-5 py-3 capitalize">{attempt.selected_label}</td>
                  <td className="px-5 py-3">{attempt.is_correct ? "Yes" : "No"}</td>
                  <td className="px-5 py-3">{pct(attempt.reasoning_score)}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(attempt.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
