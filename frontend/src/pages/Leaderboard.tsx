import { useEffect, useState } from "react";
import { Medal } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

function pct(value?: number) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

export function LeaderboardPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (token) api.leaderboard(token).then(setRows);
  }, [token]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">Leaderboard</h1>
        <p className="mt-1 text-slate-500">Ranked by accuracy, correct answers, and reasoning quality.</p>
      </div>
      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Rank</th>
                <th className="px-5 py-3">Learner</th>
                <th className="px-5 py-3">Accuracy</th>
                <th className="px-5 py-3">Correct</th>
                <th className="px-5 py-3">Reasoning</th>
                <th className="px-5 py-3">Attempts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.user_id}>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 font-semibold text-slate-950">
                      <Medal size={16} className={row.rank <= 3 ? "text-amber-500" : "text-slate-400"} />
                      {row.rank}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-950">{row.full_name}</td>
                  <td className="px-5 py-4">{pct(row.accuracy)}</td>
                  <td className="px-5 py-4">{row.correct}</td>
                  <td className="px-5 py-4">{pct(row.reasoning_average)}</td>
                  <td className="px-5 py-4">{row.attempts}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-slate-500" colSpan={6}>
                    No attempts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
