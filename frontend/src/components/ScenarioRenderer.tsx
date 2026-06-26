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
          <div className="border-b border-slate-200 bg-emerald-50 px-5 py-3">
            <div className="text-sm font-semibold capitalize text-slate-950">{channel} message</div>
            <div className="mt-1 text-xs text-slate-600">From {content.sender ?? "unknown sender"}</div>
          </div>
          <div className="bg-slate-100 p-5">
            <div className="max-w-[82%] whitespace-pre-line rounded-md bg-white p-4 leading-7 text-slate-950 shadow-sm">
              {content.body}
            </div>
          </div>
          {content.context && <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-600">{content.context}</div>}
        </section>
      );
    }
    return (
      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium capitalize text-slate-500">
          <FileText size={18} />
          {channel} from {content.sender ?? "unknown sender"}
        </div>
        <div className="whitespace-pre-line rounded-md border border-slate-200 bg-slate-50 p-4 text-base leading-7 text-slate-950">
          {content.body}
        </div>
        {content.context && <div className="mt-3 text-sm text-slate-500">{content.context}</div>}
      </section>
    );
  }

  if (scenario.scenario_type === "image") {
    return (
      <section className="panel overflow-hidden">
        <img src={content.asset_url} alt={content.alt ?? scenario.title} className="w-full bg-white object-contain" />
      </section>
    );
  }

  if (scenario.scenario_type === "audio") {
    return (
      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500">
          <Headphones size={18} />
          Voice message: {content.speaker ?? "Audio evidence"}
        </div>
        <audio controls className="w-full" src={content.asset_url} />
        <button
          type="button"
          onClick={speakTranscript}
          className="focus-ring mt-3 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Play transcript as voice
        </button>
        <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase text-slate-500">Transcript</div>
          <p className="mt-2 leading-7 text-slate-900">{content.transcript}</p>
          <div className="mt-3 text-sm text-slate-500">{content.context}</div>
        </div>
      </section>
    );
  }

  if (scenario.scenario_type === "video") {
    return (
      <section className="panel overflow-hidden">
        <div className="relative bg-slate-950">
          <img src={content.poster_url} alt={scenario.title} className="w-full object-cover" />
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-2 text-sm font-medium text-slate-900">
            <PlaySquare size={16} />
            Video evidence
          </div>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Transcript</div>
            <p className="mt-2 leading-7 text-slate-900">{content.transcript}</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Observed details</div>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {(content.observations ?? []).map((item: string) => (
                <li key={item}>{item}</li>
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
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500">
          <QrCode size={18} />
          {content.placement}
        </div>
        <div className="grid items-center gap-5 md:grid-cols-[320px_1fr]">
          <img src={content.asset_url} alt="QR code" className="w-full max-w-xs rounded-md border border-slate-200 bg-white" />
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Link2 size={16} />
              Scanner preview
            </div>
            <div className="mt-3 break-words text-lg font-semibold text-slate-950">{content.destination_url}</div>
            <p className="mt-3 text-sm text-slate-600">{content.preview_text}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-600">
          <Monitor size={18} className="shrink-0" />
          <span className="truncate">{content.display_domain ?? "website capture"}</span>
        </div>
        <a
          href={content.asset_url}
          target="_blank"
          rel="noreferrer"
          className="focus-ring inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm text-teal-700 hover:bg-teal-50"
        >
          <ExternalLink size={16} />
          Open
        </a>
      </div>
      <iframe title={scenario.title} src={content.asset_url} className="h-[420px] w-full bg-white" sandbox="" />
    </section>
  );
}
