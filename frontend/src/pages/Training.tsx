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
          <div className="inline-flex items-center gap-2 rounded-md bg-teal-50 px-3 py-1 text-xs font-semibold uppercase text-teal-800">
            <Sparkles size={14} />
            Dual AI Verification
          </div>
          <h1 className="mt-3 text-2xl font-semibold capitalize tracking-normal text-slate-950">{title} Training</h1>
          <p className="mt-1 max-w-2xl text-slate-500">
            Review realistic content, choose Fake or Genuine, then defend your decision with evidence.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={mode}
            onChange={(event) => setParams({ mode: event.target.value, scenario_type: scenarioType })}
          >
            {["quick", "text_only", "multimodal", "weakness_drill", "advanced"].map((item) => (
              <option key={item} value={item}>
                {item.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={scenarioType}
            onChange={(event) => updateScenarioType(event.target.value)}
          >
            {scenarioTypes.map((item) => (
              <option key={item.value || "any"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadNext}
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <RefreshCw size={16} />
            Next
          </button>
        </div>
      </div>

      {error && <div className="rounded-md bg-rose-50 p-4 text-rose-700">{error}</div>}
      {loading && !scenario && <div className="text-slate-500">Loading scenario...</div>}

      {scenario && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold uppercase text-slate-700">
                {scenario.scenario_type.replace("_", " ")}
              </span>
              <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                Difficulty {scenario.difficulty}
              </span>
              {scenario.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-md bg-white px-2 py-1 text-xs text-slate-500 ring-1 ring-slate-200">
                  {tag.replace("_", " ")}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-semibold tracking-normal text-slate-950">{scenario.title}</h2>
            <ScenarioRenderer scenario={scenario} />
          </div>

          <aside className="grid content-start gap-4">
            <div className="panel p-5">
              <h3 className="text-lg font-semibold tracking-normal">Your Verdict</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {(["fake", "genuine"] as TruthLabel[]).map((label) => (
                  <button
                    type="button"
                    key={label}
                    onClick={() => setSelectedLabel(label)}
                    aria-pressed={selectedLabel === label}
                    className={`focus-ring rounded-md border px-4 py-3 text-sm font-semibold capitalize ${
                      selectedLabel === label
                        ? label === "fake"
                          ? "border-rose-500 bg-rose-50 text-rose-700"
                          : "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Selected answer:{" "}
                <span className={`font-semibold capitalize ${selectedLabel === "fake" ? "text-rose-700" : selectedLabel === "genuine" ? "text-teal-700" : "text-slate-500"}`}>
                  {selectedLabel ?? "none"}
                </span>
              </div>
              <label className="mt-5 grid gap-2 text-sm font-medium text-slate-700">
                Reasoning
                <textarea
                  className="focus-ring min-h-36 resize-y rounded-md border border-slate-300 px-3 py-2 leading-6"
                  value={reasoning}
                  onChange={(event) => setReasoning(event.target.value)}
                  placeholder="Cite the clues that drove your decision."
                />
              </label>
              <button
                type="button"
                disabled={!selectedLabel || reasoning.trim().length < 5 || loading || Boolean(result)}
                onClick={submit}
                className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Send size={16} />
                Submit
              </button>
            </div>

            {result && (
              <div className={`panel p-5 ${result.evaluation.is_correct ? "border-teal-300" : "border-rose-300"}`}>
                <div className="flex items-start gap-3">
                  {result.evaluation.is_correct ? (
                    <CheckCircle2 className="mt-1 shrink-0 text-teal-600" size={22} />
                  ) : (
                    <AlertCircle className="mt-1 shrink-0 text-rose-600" size={22} />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold tracking-normal">
                  {result.evaluation.is_correct ? "Correct" : "Not quite"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Correct label: <span className="font-semibold capitalize">{result.evaluation.correct_label}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {result.evaluation.final_report?.educational_explanation ?? result.evaluation.explanation}
                </div>
                <AIResultReport result={result} />
                <button
                  type="button"
                  onClick={loadNext}
                  className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <RefreshCw size={16} />
                  Continue
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
      <div className="rounded-md border border-slate-200 p-3 text-sm text-slate-500">
        {title} analysis was not returned.
      </div>
    );
  }
  return (
    <div className="rounded-md border border-slate-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-semibold text-slate-950">
          <Bot size={16} />
          {title}
        </div>
        <div className="text-xs text-slate-500">{analysis.model}</div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <span className="rounded bg-slate-100 px-2 py-1 capitalize">Verdict {analysis.verdict}</span>
        <span className="rounded bg-slate-100 px-2 py-1">Confidence {pct(analysis.confidence)}</span>
        <span className="rounded bg-slate-100 px-2 py-1">Reasoning {pct(analysis.reasoning_score)}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{analysis.analysis}</p>
      {analysis.evidence.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-semibold uppercase text-slate-500">Evidence used</div>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {analysis.evidence.slice(0, 3).map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      )}
      {analysis.status !== "ok" && (
        <div className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-800">
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
      <div className="rounded-md border border-slate-200 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
          <Gauge size={14} />
          User Answer
        </div>
        <div className="mt-2 grid gap-2 text-sm text-slate-700">
          <div>
            You selected <span className="font-semibold capitalize">{result.evaluation.selected_label}</span>.
          </div>
          <div>
            Final verdict: <span className="font-semibold capitalize">{report?.final_verdict ?? result.evaluation.correct_label}</span>.
          </div>
          <div>
            Overall score: <span className="font-semibold">{pct(result.evaluation.overall_score)}</span>.
          </div>
        </div>
      </div>

      <ProviderPanel title="Gemini Analysis" analysis={result.evaluation.gemini_analysis} />
      <ProviderPanel title="Hugging Face Model Analysis" analysis={result.evaluation.huggingface_analysis} />

      <div className="rounded-md border border-teal-200 bg-teal-50 p-3">
        <div className="text-sm font-semibold text-teal-950">Final Combined Verdict</div>
        <p className="mt-2 text-sm leading-6 text-teal-900">{report?.disagreement_summary}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded bg-white p-2">
            <div className="font-semibold text-slate-950">{pct(report?.confidence_scores.gemini)}</div>
            <div className="text-slate-500">Gemini</div>
          </div>
          <div className="rounded bg-white p-2">
            <div className="font-semibold text-slate-950">{pct(report?.confidence_scores.huggingface)}</div>
            <div className="text-slate-500">HF</div>
          </div>
          <div className="rounded bg-white p-2">
            <div className="font-semibold text-slate-950">{pct(report?.confidence_scores.combined)}</div>
            <div className="text-slate-500">Combined</div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Lightbulb size={16} />
          Missed Indicators
        </div>
        <ul className="mt-2 grid gap-2 text-sm text-slate-600">
          {missed.map((indicator) => (
            <li key={indicator} className="rounded-md border border-slate-200 p-2">
              {indicator}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="text-sm font-semibold text-slate-700">Improvement Tips</div>
        <ul className="mt-2 grid gap-2 text-sm text-slate-600">
          {tips.map((tip) => (
            <li key={tip} className="rounded-md border border-slate-200 p-2">
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-md bg-slate-950 p-3 text-white">
        <div className="text-xs uppercase text-slate-300">Updated Skill Score</div>
        <div className="mt-1 text-2xl font-semibold">{result.stats.skill_score ?? 0}</div>
      </div>
    </div>
  );
}
