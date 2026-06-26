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
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">Training Modes</h1>
        <p className="mt-1 text-slate-500">Choose the practice loop that matches the skill you want to sharpen.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modes.map((mode) => {
          const Icon = icons[mode.id] ?? Sparkles;
          return (
            <Link key={mode.id} to={`/training?mode=${mode.id}`} className="panel p-5 hover:border-teal-300">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-50 text-teal-700">
                <Icon size={22} />
              </div>
              <h2 className="mt-5 text-lg font-semibold tracking-normal text-slate-950">{mode.title}</h2>
              <p className="mt-2 leading-6 text-slate-600">{mode.description}</p>
            </Link>
          );
        })}
      </section>
      <section className="panel p-5">
        <h2 className="text-lg font-semibold tracking-normal">Content Types</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {["text", "image", "audio", "video", "qr_code", "website"].map((type) => (
            <Link
              key={type}
              to={`/training?mode=quick&scenario_type=${type}`}
              className="focus-ring rounded-md border border-slate-200 px-3 py-2 text-sm font-medium capitalize text-slate-700 hover:bg-slate-100"
            >
              {type.replace("_", " ")}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
