import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, Bot, CheckCircle2, Gauge, Lightbulb, RefreshCw, Send, Sparkles } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { ScenarioRenderer } from "../components/ScenarioRenderer";
import type { AIProviderAnalysis, AttemptResult, Scenario, ScenarioType, TrainingMode, TruthLabel } from "../types";

const scenarioTypes: Array<{ value: "" | ScenarioType; label: string }> = [
  { value: "", label: "Any" },
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
  { value: "qr_code", label: "QR" },
  { value: "website", label: "Website" }
];

export function TrainingPage() {
  const { token, refresh } = useAuth();
  const [params, setParams] = useSearchParams();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<TruthLabel | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mode = (params.get("mode") as TrainingMode) || "quick";
  const scenarioType = (params.get("scenario_type") as ScenarioType | null) || "";

  const title = useMemo(() => mode.replace("_", " "), [mode]);

  async function loadNext() {
    if (!token) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSelectedLabel(null);
    setReasoning("");
    try {
      setScenario(await api.nextScenario(token, mode, scenarioType));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load scenario");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, mode, scenarioType]);

  async function submit() {
    if (!token || !scenario || !selectedLabel) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.submitAttempt(token, {
        scenario_id: scenario.id,
        selected_label: selectedLabel,
        reasoning
      });
      setResult(response);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit attempt");
    } finally {
      setLoading(false);
    }
  }

  function updateScenarioType(value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set("scenario_type", value);
    else next.delete("scenario_type");
    setParams(next);
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
            <Sparkles size={14} />
            Dual AI Verification
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white capitalize">{title} Training</h1>
          <p className="mt-1 max-w-2xl text-slate-400 text-sm">
            Review realistic content, choose Fake or Genuine, then defend your decision with evidence.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <select
            className="focus-ring rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-300 font-semibold cursor-pointer"
            value={mode}
            onChange={(event) => setParams({ mode: event.target.value, scenario_type: scenarioType })}
          >
            {["quick", "text_only", "multimodal", "weakness_drill", "advanced"].map((item) => (
              <option key={item} value={item} className="bg-slate-950 text-slate-350">
                {item.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            className="focus-ring rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-300 font-semibold cursor-pointer"
            value={scenarioType}
            onChange={(event) => updateScenarioType(event.target.value)}
          >
            {scenarioTypes.map((item) => (
              <option key={item.value || "any"} value={item.value} className="bg-slate-950 text-slate-350">
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadNext}
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-850 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-900 transition-all duration-200"
          >
            <RefreshCw size={16} />
            Next
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-450">{error}</div>}
      {loading && !scenario && <div className="text-slate-450 font-semibold animate-pulse">Loading scenario...</div>}

      {scenario && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-400">
                {scenario.scenario_type.replace("_", " ")}
              </span>
              <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-400">
                Difficulty {scenario.difficulty}
              </span>
              {scenario.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-lg bg-slate-950/40 border border-slate-900 px-2.5 py-1 text-xs text-slate-400">
                  {tag.replace("_", " ")}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">{scenario.title}</h2>
            <ScenarioRenderer scenario={scenario} />
          </div>

          <aside className="grid content-start gap-4">
            <div className="panel p-6">
              <h3 className="text-lg font-bold tracking-tight text-white mb-4">Your Verdict</h3>
              <div className="grid grid-cols-2 gap-3.5">
                {(["fake", "genuine"] as TruthLabel[]).map((label) => (
                  <button
                    type="button"
                    key={label}
                    onClick={() => setSelectedLabel(label)}
                    aria-pressed={selectedLabel === label}
                    className={`focus-ring rounded-xl border px-4 py-3 text-sm font-bold capitalize transition-all duration-300 ${
                      selectedLabel === label
                        ? label === "fake"
                          ? "border-rose-500 bg-rose-500/15 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                          : "border-teal-500 bg-teal-500/15 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                        : "border-slate-800 bg-slate-950/30 text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-slate-900 bg-slate-950/40 px-4 py-3 text-sm text-slate-450">
                Selected answer:{" "}
                <span className={`font-bold capitalize tracking-wide ${selectedLabel === "fake" ? "text-rose-400" : selectedLabel === "genuine" ? "text-teal-400" : "text-slate-500"}`}>
                  {selectedLabel ?? "none"}
                </span>
              </div>
              <label className="mt-6 grid gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Reasoning
                <textarea
                  className="focus-ring min-h-36 resize-y rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder-slate-650 leading-relaxed transition-all"
                  value={reasoning}
                  onChange={(event) => setReasoning(event.target.value)}
                  placeholder="Cite the clues that drove your decision..."
                />
              </label>
              <button
                type="button"
                disabled={!selectedLabel || reasoning.trim().length < 5 || loading || Boolean(result)}
                onClick={submit}
                className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-3.5 shadow-[0_0_15px_rgba(20,184,166,0.25)] hover:shadow-[0_0_25px_rgba(20,184,166,0.35)] transition-all duration-300 disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none"
              >
                <Send size={16} />
                Submit
              </button>
            </div>

            {result && (
              <div className={`panel p-6 border-2 ${result.evaluation.is_correct ? "border-teal-500/30" : "border-rose-500/30"}`}>
                <div className="flex items-start gap-3">
                  {result.evaluation.is_correct ? (
                    <CheckCircle2 className="mt-0.5 shrink-0 text-teal-450" size={24} />
                  ) : (
                    <AlertCircle className="mt-0.5 shrink-0 text-rose-450" size={24} />
                  )}
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-white">
                      {result.evaluation.is_correct ? "Correct Verdict" : "Incorrect Verdict"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Correct label: <span className="font-semibold capitalize text-teal-400">{result.evaluation.correct_label}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-slate-900 bg-slate-950/30 p-4 text-sm leading-relaxed text-slate-300">
                  {result.evaluation.final_report?.educational_explanation ?? result.evaluation.explanation}
                </div>
                <AIResultReport result={result} />
                <button
                  type="button"
                  onClick={loadNext}
                  className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-850 bg-slate-900/60 px-4 py-3.5 text-sm font-semibold text-white hover:bg-slate-900 transition-all duration-300"
                >
                  <RefreshCw size={16} />
                  Continue Training
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function pct(value?: number) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

function ProviderPanel({ title, analysis }: { title: string; analysis?: AIProviderAnalysis | null }) {
  if (!analysis) {
    return (
      <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-4 text-sm text-slate-500">
        {title} analysis was not returned.
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-bold text-slate-200">
          <Bot size={16} className="text-teal-400" />
          {title}
        </div>
        <div className="text-[10px] font-mono text-slate-500">{analysis.model}</div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
        <span className="rounded bg-slate-900 border border-slate-850 px-2 py-1 font-semibold text-slate-300 capitalize">Verdict {analysis.verdict}</span>
        <span className="rounded bg-slate-900 border border-slate-850 px-2 py-1 font-semibold text-slate-300">Confidence {pct(analysis.confidence)}</span>
        <span className="rounded bg-slate-900 border border-slate-850 px-2 py-1 font-semibold text-slate-300">Reasoning {pct(analysis.reasoning_score)}</span>
      </div>
      <p className="mt-3.5 text-sm leading-relaxed text-slate-300">{analysis.analysis}</p>
      {analysis.evidence.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Evidence used</div>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-400">
            {analysis.evidence.slice(0, 3).map((item) => (
              <li key={item} className="flex items-start gap-1">
                <span className="text-teal-500 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {analysis.status !== "ok" && (
        <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-450">
          Provider status: {analysis.status}. Local evidence fallback was used for this panel.
        </div>
      )}
    </div>
  );
}

function AIResultReport({ result }: { result: AttemptResult }) {
  const report = result.evaluation.final_report;
  const missed = report?.missed_indicators ?? result.evaluation.missed_indicators;
  const tips = report?.improvement_tips ?? [result.evaluation.feedback];
  return (
    <div className="mt-5 grid gap-4">
      <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Gauge size={14} className="text-teal-400" />
          User Evaluation
        </div>
        <div className="mt-3 grid gap-2 text-sm text-slate-300">
          <div>
            You selected: <span className={`font-bold capitalize ${result.evaluation.selected_label === "fake" ? "text-rose-400" : "text-teal-400"}`}>{result.evaluation.selected_label}</span>.
          </div>
          <div>
            Final verdict: <span className="font-semibold capitalize text-teal-400">{report?.final_verdict ?? result.evaluation.correct_label}</span>.
          </div>
          <div>
            Overall score: <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{pct(result.evaluation.overall_score)}</span>.
          </div>
        </div>
      </div>

      <ProviderPanel title="Gemini Analysis" analysis={result.evaluation.gemini_analysis} />
      <ProviderPanel title="Hugging Face Model Analysis" analysis={result.evaluation.huggingface_analysis} />

      <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 shadow-[0_0_15px_rgba(20,184,166,0.05)]">
        <div className="text-sm font-bold text-teal-400">Final Combined Verdict</div>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{report?.disagreement_summary}</p>
        <div className="mt-4 grid grid-cols-3 gap-2.5 text-center text-xs">
          <div className="rounded-lg bg-slate-950/80 border border-slate-900 p-2">
            <div className="font-bold text-white">{pct(report?.confidence_scores.gemini)}</div>
            <div className="text-slate-500 mt-0.5">Gemini</div>
          </div>
          <div className="rounded-lg bg-slate-950/80 border border-slate-900 p-2">
            <div className="font-bold text-white">{pct(report?.confidence_scores.huggingface)}</div>
            <div className="text-slate-500 mt-0.5">HF</div>
          </div>
          <div className="rounded-lg bg-slate-950/80 border border-slate-900 p-2">
            <div className="font-bold text-teal-400">{pct(report?.confidence_scores.combined)}</div>
            <div className="text-slate-500 mt-0.5">Combined</div>
          </div>
        </div>
      </div>

      {missed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Lightbulb size={16} className="text-amber-500" />
            Missed Indicators
          </div>
          <ul className="mt-2.5 grid gap-2 text-sm text-slate-300">
            {missed.map((indicator) => (
              <li key={indicator} className="rounded-xl border border-slate-900 bg-slate-950/20 p-3 flex items-start gap-2">
                <span className="text-rose-450 shrink-0 mt-0.5">⚠</span>
                <span>{indicator}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="text-sm font-bold text-slate-200 mb-2.5">Improvement Tips</div>
        <ul className="grid gap-2 text-sm text-slate-300">
          {tips.map((tip) => (
            <li key={tip} className="rounded-xl border border-slate-900 bg-slate-950/20 p-3 flex items-start gap-2">
              <span className="text-teal-400 shrink-0 mt-0.5">✓</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl bg-gradient-to-r from-teal-950/40 to-slate-900 border border-teal-500/20 p-4 flex items-center justify-between shadow-[inset_0_0_20px_rgba(20,184,166,0.05)]">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-teal-400">Updated Skill Score</div>
          <div className="mt-1 text-3xl font-extrabold text-white">{result.stats.skill_score ?? 0}</div>
        </div>
        <div className="text-xs text-slate-450 font-semibold">Recalibrated after submission</div>
      </div>
    </div>
  );
}
