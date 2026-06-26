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
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    indigo: "bg-indigo-50 text-indigo-700"
  };
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-500">{title}</div>
          <div className="metric mt-2">{value}</div>
        </div>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 text-sm text-slate-500">{detail}</div>
    </div>
  );
}
