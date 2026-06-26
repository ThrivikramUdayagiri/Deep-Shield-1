import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { token, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("admin@deepshield.local");
  const [password, setPassword] = useState("AdminPass123!");
  const [fullName, setFullName] = useState("DeepShield Learner");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({ email, password, full_name: fullName });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none"></div>

      <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-850 bg-slate-900/35 backdrop-blur-xl shadow-2xl relative z-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 lg:p-12 text-white border-r border-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]">
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="font-bold text-lg tracking-wide">DeepShield AI</div>
                <div className="text-xs text-slate-400">Digital trust training</div>
              </div>
            </div>
            <div className="mt-16 max-w-md">
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Practice decisions on realistic digital content.
              </h1>
              <p className="mt-6 leading-7 text-slate-400 text-sm lg:text-base">
                Train across generated text and managed multimodal datasets, then get feedback on both the verdict and reasoning.
              </p>
            </div>
          </div>
          <div className="mt-12 grid gap-3 text-sm">
            <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-4 text-slate-300 hover:border-teal-500/20 hover:bg-slate-950/80 transition-all duration-300">
              <span className="font-semibold text-teal-400 block mb-1">Secure Workspace</span>
              JWT-secured learner and admin workflows.
            </div>
            <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-4 text-slate-300 hover:border-teal-500/20 hover:bg-slate-950/80 transition-all duration-300">
              <span className="font-semibold text-teal-400 block mb-1">Flex Scenario Engine</span>
              Plugin-ready verification for multiple channels.
            </div>
            <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-4 text-slate-300 hover:border-teal-500/20 hover:bg-slate-950/80 transition-all duration-300">
              <span className="font-semibold text-teal-400 block mb-1">Calibration Insights</span>
              Weakness detection and personalized training recommendations.
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-8 inline-flex rounded-xl border border-slate-800 bg-slate-950/80 p-1 self-start">
            <button
              type="button"
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                mode === "login"
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                mode === "register"
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>
          
          <h2 className="text-2xl font-extrabold tracking-tight text-white mb-2">
            {mode === "login" ? "Welcome back" : "Create learner account"}
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            {mode === "login" ? "Enter your credentials to enter the training center." : "Get started with your digital trust training today."}
          </p>

          <div className="grid gap-5">
            {mode === "register" && (
              <label className="grid gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Full name
                <input
                  className="focus-ring rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-sm text-white placeholder-slate-600 transition-all duration-200"
                  placeholder="DeepShield Learner"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </label>
            )}
            <label className="grid gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Email
              <input
                className="focus-ring rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-sm text-white placeholder-slate-600 transition-all duration-200"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Password
              <input
                className="focus-ring rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-sm text-white placeholder-slate-600 transition-all duration-200"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
          </div>

          {error && (
            <div className="mt-5 rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-450">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="focus-ring mt-8 w-full rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-3 px-4 shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.35)] transition-all duration-300 disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none"
          >
            {loading ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
          
          <div className="mt-8 rounded-lg border border-slate-800/40 bg-slate-950/30 px-4 py-3 text-xs text-slate-400 flex items-center justify-between">
            <span>Admin seed credentials:</span>
            <span className="font-mono text-teal-400 font-semibold select-all">admin@deepshield.local / AdminPass123!</span>
          </div>
        </form>
      </section>
    </main>
  );
}
