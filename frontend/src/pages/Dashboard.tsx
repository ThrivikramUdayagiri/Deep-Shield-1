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

  if (error) return <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-450">{error}</div>;
  if (!data) return <div className="text-slate-450 font-semibold animate-pulse">Loading dashboard...</div>;

  const stats = data.stats;
  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.1)]">
            <ShieldCheck size={14} />
            DeepShield Control Center
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-slate-400 text-sm">Your digital trust performance, skill score, and next best practice areas.</p>
        </div>
        <Link
          to="/training?mode=quick"
          className="focus-ring inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white hover:from-teal-600 hover:to-emerald-600 shadow-[0_0_15px_rgba(20,184,166,0.2)] hover:shadow-[0_0_25px_rgba(20,184,166,0.35)] transition-all duration-300"
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
        <div className="panel p-6">
          <h2 className="text-lg font-bold tracking-tight text-white">Personalized Recommendations</h2>
          <div className="mt-4 grid gap-3">
            {data.recommendations.map((rec) => (
              <Link
                key={`${rec.title}-${rec.scenario_type}`}
                to={`/training?mode=weakness_drill&scenario_type=${rec.scenario_type === "multimodal" ? "" : rec.scenario_type}`}
                className="rounded-xl border border-slate-800/80 bg-slate-950/20 p-4 transition-all duration-300 hover:border-teal-500/30 hover:bg-teal-500/5 group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-teal-400 transition-colors">{rec.title}</div>
                <div className="mt-1.5 text-sm leading-6 text-slate-400">{rec.reason}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="text-lg font-bold tracking-tight text-white">Achievements</h2>
          <div className="mt-4 grid gap-3">
            {stats.achievements.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/10 p-5 text-sm text-slate-500 text-center">
                Complete a challenge to unlock your first achievement.
              </div>
            )}
            {stats.achievements.map((achievement) => (
              <div key={achievement.id} className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                <Trophy className="mt-0.5 shrink-0 text-amber-500" size={18} />
                <div>
                  <div className="font-semibold text-slate-200">{achievement.title}</div>
                  <div className="mt-1 text-sm text-slate-400">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="text-lg font-bold tracking-tight text-white">Weakness Detection</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.weaknesses.length === 0 && <div className="text-sm text-slate-500 py-2">No weaknesses yet. Train across a few scenarios to calibrate.</div>}
          {data.weaknesses.map((weakness) => (
            <div key={weakness.scenario_type} className="rounded-xl border border-slate-800/80 bg-slate-950/20 p-4 hover:border-slate-700/80 transition-all duration-300">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold capitalize text-slate-200">{weakness.scenario_type.replace("_", " ")}</div>
                <div className="text-xs font-bold uppercase px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">Risk {percent(weakness.risk)}</div>
              </div>
              <div className="mt-3 text-xs text-slate-400">{weakness.attempts} attempts ({percent(weakness.accuracy)} accuracy)</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
