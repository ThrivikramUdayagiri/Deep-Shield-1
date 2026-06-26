import type {
  AttemptResult,
  DashboardData,
  ProgressData,
  Scenario,
  ScenarioType,
  TrainingMode,
  TrainingModeInfo,
  TruthLabel,
  User
} from "../types";
import { mockApi } from "./mockData";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const isGitHubPages = window.location.hostname.includes("github.io");
let useMockMode = isGitHubPages || import.meta.env.VITE_USE_MOCK_API === "true";

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

function formatApiError(detail: unknown): string | null {
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => formatApiError(item))
      .filter((message): message is string => Boolean(message));
    return messages.length > 0 ? messages.join(" ") : null;
  }
  if (detail && typeof detail === "object") {
    const value = detail as { msg?: unknown; message?: unknown; detail?: unknown; loc?: unknown };
    const message = value.msg ?? value.message ?? value.detail;
    const formatted = formatApiError(message);
    if (!formatted) {
      return JSON.stringify(detail);
    }
    if (Array.isArray(value.loc) && value.loc.length > 0) {
      const field = String(value.loc[value.loc.length - 1]).replace(/_/g, " ");
      return `${field}: ${formatted}`;
    }
    return formatted;
  }
  return null;
}

function routeMockRequest<T>(path: string, options: RequestInit, token?: string | null): Promise<T> {
  const cleanPath = path.split("?")[0];
  const params = new URLSearchParams(path.split("?")[1] || "");
  const body = options.body ? JSON.parse(options.body as string) : null;
  
  if (cleanPath === "/api/auth/register") {
    return mockApi.register(body) as any;
  }
  if (cleanPath === "/api/auth/login") {
    return mockApi.login(body) as any;
  }
  if (cleanPath === "/api/auth/me") {
    return mockApi.me(token || "") as any;
  }
  if (cleanPath === "/api/scenarios/modes") {
    return mockApi.modes(token || "") as any;
  }
  if (cleanPath.startsWith("/api/scenarios/next")) {
    const mode = params.get("mode") || "quick";
    const scenarioType = params.get("scenario_type") as any;
    return mockApi.nextScenario(token || "", mode, scenarioType) as any;
  }
  if (cleanPath === "/api/scenarios/attempts") {
    return mockApi.submitAttempt(token || "", body) as any;
  }
  if (cleanPath === "/api/analytics/dashboard") {
    return mockApi.dashboard(token || "") as any;
  }
  if (cleanPath === "/api/analytics/progress") {
    return mockApi.progress(token || "") as any;
  }
  if (cleanPath === "/api/analytics/leaderboard") {
    return mockApi.leaderboard(token || "") as any;
  }
  if (cleanPath === "/api/admin/monitoring") {
    return mockApi.adminMonitoring(token || "") as any;
  }
  
  throw new Error(`Unsupported mock route: ${path}`);
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  if (useMockMode) {
    return routeMockRequest<T>(path, options, token);
  }

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!response.ok) {
      let message = response.statusText;
      try {
        const data = await response.json();
        message = formatApiError(data.detail ?? data.message ?? data) ?? message;
      } catch {
        // Keep the HTTP status text when the body is not JSON.
      }
      throw new Error(message);
    }
    return response.json() as Promise<T>;
  } catch (error: any) {
    // If the network call failed because the backend server is stopped/offline
    if (error.name === "TypeError") {
      console.warn("Backend server connection failed. Switching to local simulated client.", error);
      useMockMode = true;
      return routeMockRequest<T>(path, options, token);
    }
    throw error;
  }
}

export const api = {
  register(payload: { email: string; password: string; full_name: string }) {
    if (useMockMode) return mockApi.register(payload);
    return request<TokenResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  login(payload: { email: string; password: string }) {
    if (useMockMode) return mockApi.login(payload);
    return request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  me(token: string) {
    if (useMockMode) return mockApi.me(token);
    return request<User>("/api/auth/me", {}, token);
  },
  modes(token: string) {
    if (useMockMode) return mockApi.modes(token);
    return request<TrainingModeInfo[]>("/api/scenarios/modes", {}, token);
  },
  nextScenario(token: string, mode: TrainingMode, scenarioType?: ScenarioType | "") {
    if (useMockMode) return mockApi.nextScenario(token, mode, scenarioType);
    const params = new URLSearchParams({ mode });
    if (scenarioType) {
      params.set("scenario_type", scenarioType);
    }
    return request<Scenario>(`/api/scenarios/next?${params.toString()}`, {}, token);
  },
  submitAttempt(
    token: string,
    payload: { scenario_id: string; selected_label: TruthLabel; reasoning: string }
  ) {
    if (useMockMode) return mockApi.submitAttempt(token, payload);
    return request<AttemptResult>(
      "/api/scenarios/attempts",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      token
    );
  },
  dashboard(token: string) {
    if (useMockMode) return mockApi.dashboard(token);
    return request<DashboardData>("/api/analytics/dashboard", {}, token);
  },
  progress(token: string) {
    if (useMockMode) return mockApi.progress(token);
    return request<ProgressData>("/api/analytics/progress", {}, token);
  },
  leaderboard(token: string) {
    if (useMockMode) return mockApi.leaderboard(token);
    return request<any[]>("/api/analytics/leaderboard", {}, token);
  },
  adminMonitoring(token: string) {
    if (useMockMode) return mockApi.adminMonitoring(token);
    return request<any>("/api/admin/monitoring", {}, token);
  }
};
