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
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft lg:grid-cols-[1fr_1.1fr]">
        <div className="bg-slate-950 p-8 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-500">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="font-semibold">DeepShield AI</div>
              <div className="text-sm text-slate-300">Digital trust training</div>
            </div>
          </div>
          <div className="mt-12 max-w-md">
            <h1 className="text-3xl font-semibold tracking-normal">Practice decisions on realistic digital content.</h1>
            <p className="mt-4 leading-7 text-slate-300">
              Train across generated text and managed multimodal datasets, then get feedback on both the verdict and reasoning.
            </p>
          </div>
          <div className="mt-10 grid gap-3 text-sm text-slate-300">
            <div className="rounded-md border border-slate-700 p-3">JWT-secured learner and admin workflows</div>
            <div className="rounded-md border border-slate-700 p-3">Plugin-ready scenario engine</div>
            <div className="rounded-md border border-slate-700 p-3">Weakness detection and recommendations</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-8">
          <div className="mb-6 inline-flex rounded-md border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              className={`rounded px-4 py-2 text-sm font-medium ${mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"}`}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`rounded px-4 py-2 text-sm font-medium ${mode === "register" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"}`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
            {mode === "login" ? "Welcome back" : "Create learner account"}
          </h2>
          <div className="mt-6 grid gap-4">
            {mode === "register" && (
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Full name
                <input
                  className="focus-ring rounded-md border border-slate-300 px-3 py-2"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </label>
            )}
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input
                className="focus-ring rounded-md border border-slate-300 px-3 py-2"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Password
              <input
                className="focus-ring rounded-md border border-slate-300 px-3 py-2"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
          </div>
          {error && <div className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
          <button
            disabled={loading}
            className="focus-ring mt-6 w-full rounded-md bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
          <p className="mt-4 text-sm text-slate-500">
            Admin seed: admin@deepshield.local / AdminPass123!
          </p>
        </form>
      </section>
    </main>
  );
}
