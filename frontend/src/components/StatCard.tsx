import type { LucideIcon } from "lucide-react";

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "teal"
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone?: "teal" | "amber" | "rose" | "indigo";
}) {
  const tones = {
    teal: "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    rose: "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]",
    indigo: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
  };
  return (
    <div className="panel p-5 relative overflow-hidden group">
      {/* Dynamic hover background light */}
      <div className="absolute -inset-y-0 -left-4 w-12 bg-white/5 skew-x-12 -translate-x-full group-hover:translate-x-[400px] transition-all duration-1000 ease-out pointer-events-none"></div>
      
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold tracking-wide text-slate-400 uppercase">{title}</div>
          <div className="metric mt-2">{value}</div>
        </div>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all duration-300 group-hover:scale-110 ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 text-xs text-slate-400 tracking-wide">{detail}</div>
    </div>
  );
}
