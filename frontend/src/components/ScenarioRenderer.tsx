import { ExternalLink, FileText, Headphones, Link2, Monitor, PlaySquare, QrCode } from "lucide-react";
import type { Scenario } from "../types";

export function ScenarioRenderer({ scenario }: { scenario: Scenario }) {
  const content = scenario.content ?? {};
  const channel = String(content.channel ?? "message").toLowerCase();

  function speakTranscript() {
    if (!content.transcript || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content.transcript);
    utterance.rate = content.suspicious ? 1.08 : 0.96;
    window.speechSynthesis.speak(utterance);
  }

  if (scenario.scenario_type === "text") {
    if (channel === "whatsapp" || channel === "chat") {
      return (
        <section className="panel overflow-hidden">
          <div className="border-b border-slate-850 bg-emerald-500/5 px-5 py-3">
            <div className="text-sm font-bold capitalize text-emerald-450">{channel} message</div>
            <div className="mt-1 text-xs text-slate-400">From {content.sender ?? "unknown sender"}</div>
          </div>
          <div className="bg-slate-950/50 p-5">
            <div className="max-w-[85%] whitespace-pre-line rounded-xl bg-emerald-950/30 border border-emerald-900/20 p-4 text-sm leading-relaxed text-slate-100 shadow-lg">
              {content.body}
            </div>
          </div>
          {content.context && <div className="border-t border-slate-850 bg-slate-950/25 px-5 py-3.5 text-xs text-slate-400 leading-relaxed">{content.context}</div>}
        </section>
      );
    }
    return (
      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <FileText size={18} className="text-teal-400" />
          {channel} from {content.sender ?? "unknown sender"}
        </div>
        <div className="whitespace-pre-line rounded-xl border border-slate-850 bg-slate-950/35 p-5 text-sm leading-relaxed text-slate-200">
          {content.body}
        </div>
        {content.context && <div className="mt-3.5 text-xs text-slate-400 leading-relaxed">{content.context}</div>}
      </section>
    );
  }

  if (scenario.scenario_type === "image") {
    return (
      <section className="panel overflow-hidden p-2 bg-slate-950/20">
        <img src={content.asset_url} alt={content.alt ?? scenario.title} className="w-full rounded-lg bg-slate-950/50 object-contain max-h-[500px]" />
      </section>
    );
  }

  if (scenario.scenario_type === "audio") {
    return (
      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Headphones size={18} className="text-teal-400" />
          Voice message: {content.speaker ?? "Audio evidence"}
        </div>
        <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-900 mb-3">
          <audio controls className="w-full accent-teal-500" src={content.asset_url} />
        </div>
        <button
          type="button"
          onClick={speakTranscript}
          className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-all duration-200"
        >
          Play transcript as voice
        </button>
        <div className="mt-5 rounded-xl border border-slate-850 bg-slate-950/35 p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Transcript</div>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-200">{content.transcript}</p>
          {content.context && <div className="mt-3.5 text-xs text-slate-400 border-t border-slate-850/60 pt-3">{content.context}</div>}
        </div>
      </section>
    );
  }

  if (scenario.scenario_type === "video") {
    return (
      <section className="panel overflow-hidden">
        <div className="relative bg-slate-950 border-b border-slate-900">
          <img src={content.poster_url} alt={scenario.title} className="w-full object-cover max-h-[360px]" />
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-lg bg-slate-900/90 border border-slate-800 px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-teal-400 shadow-lg">
            <PlaySquare size={16} />
            Video evidence
          </div>
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Transcript</div>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-200">{content.transcript}</p>
          </div>
          <div className="border-l border-slate-900/80 pl-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Observed details</div>
            <ul className="mt-2.5 space-y-2 text-xs text-slate-350">
              {(content.observations ?? []).map((item: string) => (
                <li key={item} className="flex items-start gap-1">
                  <span className="text-rose-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  if (scenario.scenario_type === "qr_code") {
    return (
      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <QrCode size={18} className="text-teal-400" />
          {content.placement}
        </div>
        <div className="grid items-center gap-6 md:grid-cols-[280px_1fr]">
          <div className="p-3 bg-white rounded-xl border border-slate-800 flex justify-center shadow-lg">
            <img src={content.asset_url} alt="QR code" className="w-full max-w-[200px]" />
          </div>
          <div className="rounded-xl border border-slate-850 bg-slate-950/35 p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Link2 size={16} className="text-teal-400" />
              Scanner preview
            </div>
            <div className="mt-3.5 break-all text-lg font-bold text-teal-450 select-all tracking-wide">{content.destination_url}</div>
            <p className="mt-3 text-sm text-slate-350 leading-relaxed">{content.preview_text}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-900 bg-slate-950/40 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-350">
          <Monitor size={18} className="shrink-0 text-teal-400" />
          <span className="truncate">{content.display_domain ?? "website capture"}</span>
        </div>
        <a
          href={content.asset_url}
          target="_blank"
          rel="noreferrer"
          className="focus-ring inline-flex items-center gap-2 rounded-lg bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 text-xs font-bold text-teal-400 hover:bg-teal-500/20 transition-all duration-200"
        >
          <ExternalLink size={14} />
          Open website
        </a>
      </div>
      <iframe title={scenario.title} src={content.asset_url} className="h-[420px] w-full bg-white border-none" sandbox="" />
    </section>
  );
}
