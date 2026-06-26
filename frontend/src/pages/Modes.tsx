import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Images, Layers, Sparkles, Target } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { TrainingModeInfo } from "../types";

const icons = {
  quick: Sparkles,
  text_only: Bot,
  multimodal: Images,
  weakness_drill: Target,
  advanced: Layers
};

export function ModesPage() {
  const { token } = useAuth();
  const [modes, setModes] = useState<TrainingModeInfo[]>([]);

  useEffect(() => {
    if (token) api.modes(token).then(setModes);
  }, [token]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Training Modes</h1>
        <p className="mt-1 text-slate-450 text-sm">Choose the practice loop that matches the skill you want to sharpen.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modes.map((mode) => {
          const Icon = icons[mode.id] ?? Sparkles;
          return (
            <Link
              key={mode.id}
              to={`/training?mode=${mode.id}`}
              className="panel p-6 hover:border-teal-500/35 group transition-all duration-300"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)] group-hover:scale-110 transition-all duration-300">
                <Icon size={22} />
              </div>
              <h2 className="mt-5 text-lg font-bold tracking-tight text-slate-200 group-hover:text-teal-450 transition-colors">
                {mode.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{mode.description}</p>
            </Link>
          );
        })}
      </section>
      <section className="panel p-6">
        <h2 className="text-lg font-bold tracking-tight text-white mb-4">Content Types</h2>
        <div className="flex flex-wrap gap-2.5">
          {["text", "image", "audio", "video", "qr_code", "website"].map((type) => (
            <Link
              key={type}
              to={`/training?mode=quick&scenario_type=${type}`}
              className="focus-ring rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-2.5 text-sm font-semibold capitalize text-slate-350 hover:border-teal-500/30 hover:bg-teal-500/10 hover:text-teal-400 transition-all duration-200"
            >
              {type.replace("_", " ")}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
