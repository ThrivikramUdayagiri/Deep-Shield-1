import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Brain, CheckCircle2, Flame, ShieldCheck, Trophy } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { StatCard } from "../components/StatCard";
import type { DashboardData } from "../types";

function percent(value?: number) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

export function DashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api.dashboard(token).then(setData).catch((err) => setError(err.message));
  }, [token]);

  if (error) return <div className="rounded-md bg-rose-50 p-4 text-rose-700">{error}</div>;
  if (!data) return <div className="text-slate-500">Loading dashboard...</div>;

  const stats = data.stats;
  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold uppercase text-white">
            <ShieldCheck size={14} />
            DeepShield Control Center
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">Dashboard</h1>
          <p className="mt-1 text-slate-500">Your digital trust performance, skill score, and next best practice areas.</p>
        </div>
        <Link
          to="/training?mode=quick"
          className="focus-ring inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Start quick training
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Skill Score" value={stats.skill_score ?? 0} detail="Blends accuracy, reasoning, streak, and breadth" icon={ShieldCheck} tone="teal" />
        <StatCard title="Attempts" value={stats.attempts} detail="Completed decisions" icon={Activity} tone="teal" />
        <StatCard title="Accuracy" value={percent(stats.accuracy)} detail={`${stats.correct} correct answers`} icon={CheckCircle2} tone="indigo" />
        <StatCard title="Reasoning" value={percent(stats.reasoning_average)} detail="Evidence quality average" icon={Brain} tone="amber" />
        <StatCard title="Streak" value={stats.streak} detail={`Best streak ${stats.best_streak}`} icon={Flame} tone="rose" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="panel p-5">
          <h2 className="text-lg font-semibold tracking-normal">Personalized Recommendations</h2>
          <div className="mt-4 grid gap-3">
            {data.recommendations.map((rec) => (
              <Link
                key={`${rec.title}-${rec.scenario_type}`}
                to={`/training?mode=weakness_drill&scenario_type=${rec.scenario_type === "multimodal" ? "" : rec.scenario_type}`}
                className="rounded-md border border-slate-200 p-4 hover:border-teal-300 hover:bg-teal-50/50"
              >
                <div className="font-medium text-slate-950">{rec.title}</div>
                <div className="mt-1 text-sm leading-6 text-slate-600">{rec.reason}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-lg font-semibold tracking-normal">Achievements</h2>
          <div className="mt-4 grid gap-3">
            {stats.achievements.length === 0 && (
              <div className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Complete a challenge to unlock your first achievement.
              </div>
            )}
            {stats.achievements.map((achievement) => (
              <div key={achievement.id} className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
                <Trophy className="mt-0.5 shrink-0 text-amber-600" size={18} />
                <div>
                  <div className="font-medium text-slate-950">{achievement.title}</div>
                  <div className="mt-1 text-sm text-slate-600">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-lg font-semibold tracking-normal">Weakness Detection</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.weaknesses.length === 0 && <div className="text-sm text-slate-500">No weaknesses yet. Train across a few scenarios to calibrate.</div>}
          {data.weaknesses.map((weakness) => (
            <div key={weakness.scenario_type} className="rounded-md border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium capitalize text-slate-950">{weakness.scenario_type.replace("_", " ")}</div>
                <div className="text-sm font-semibold text-rose-700">Risk {percent(weakness.risk)}</div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-rose-500" style={{ width: percent(weakness.risk) }} />
              </div>
              <div className="mt-3 text-sm text-slate-500">
                Accuracy {percent(weakness.accuracy)} · Reasoning {percent(weakness.reasoning_average)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
