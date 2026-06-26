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

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

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

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
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
}

export const api = {
  register(payload: { email: string; password: string; full_name: string }) {
    return request<TokenResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  login(payload: { email: string; password: string }) {
    return request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  me(token: string) {
    return request<User>("/api/auth/me", {}, token);
  },
  modes(token: string) {
    return request<TrainingModeInfo[]>("/api/scenarios/modes", {}, token);
  },
  nextScenario(token: string, mode: TrainingMode, scenarioType?: ScenarioType | "") {
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
    return request<DashboardData>("/api/analytics/dashboard", {}, token);
  },
  progress(token: string) {
    return request<ProgressData>("/api/analytics/progress", {}, token);
  },
  leaderboard(token: string) {
    return request<any[]>("/api/analytics/leaderboard", {}, token);
  },
  adminMonitoring(token: string) {
    return request<any>("/api/admin/monitoring", {}, token);
  }
};
