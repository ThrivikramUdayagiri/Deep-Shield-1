import { scenariosData, MockScenario } from "./scenariosData";
import type { Achievement, AttemptResult, DashboardData, ProgressData, Scenario, ScenarioType, TruthLabel, User } from "../types";

function generateAssetUrl(scenario: MockScenario): string {
  const content = scenario.content;
  const kind = content.asset_kind;
  const suspicious = content.suspicious;
  const accent = suspicious ? "#ef4444" : "#14b8a6";
  const muted = suspicious ? "#fee2e2" : "#ccfbf1";
  const headline = content.headline || scenario.title;
  const subhead = content.subhead || "Verification sample";
  const detail = content.detail || "Check alignment, dates, domains, and visual consistency.";
  const stamp = suspicious ? "REVIEW" : "VERIFIED";

  if (kind === "svg_image") {
    let body = "";
    if (content.template === "profile") {
      body = `
        <circle cx="120" cy="132" r="48" fill="#cbd5e1"/>
        <rect x="190" y="88" width="280" height="20" rx="5" fill="#0f172a"/>
        <rect x="190" y="126" width="210" height="16" rx="4" fill="#64748b"/>
        <rect x="190" y="158" width="250" height="16" rx="4" fill="#94a3b8"/>
        <rect x="70" y="232" width="420" height="52" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      `;
    } else {
      body = `
        <rect x="74" y="92" width="372" height="230" rx="10" fill="#ffffff" stroke="#cbd5e1"/>
        <rect x="104" y="132" width="170" height="18" rx="4" fill="#0f172a"/>
        <rect x="104" y="172" width="286" height="12" rx="3" fill="#94a3b8"/>
        <rect x="104" y="202" width="246" height="12" rx="3" fill="#94a3b8"/>
        <rect x="104" y="232" width="300" height="12" rx="3" fill="#94a3b8"/>
        <rect x="104" y="274" width="126" height="22" rx="5" fill="#e2e8f0"/>
      `;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="380" viewBox="0 0 560 380">
      <rect width="560" height="380" fill="#f8fafc"/>
      <rect x="24" y="24" width="512" height="332" rx="18" fill="${muted}" stroke="#cbd5e1"/>
      <text x="54" y="62" font-family="Inter, Arial" font-size="22" font-weight="700" fill="#0f172a">${headline}</text>
      <text x="54" y="88" font-family="Inter, Arial" font-size="13" fill="#475569">${subhead}</text>
      ${body}
      <rect x="360" y="278" width="118" height="36" rx="8" fill="${accent}"/>
      <text x="419" y="302" text-anchor="middle" font-family="Inter, Arial" font-size="14" font-weight="700" fill="#ffffff">${stamp}</text>
      <text x="54" y="342" font-family="Inter, Arial" font-size="12" fill="#475569">${detail}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (kind === "qr_svg") {
    const target = content.destination_url || "https://example.com";
    let squares = [
      [0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2],
      [6, 0], [7, 0], [8, 0], [6, 1], [8, 1], [6, 2], [7, 2], [8, 2],
      [0, 6], [1, 6], [2, 6], [0, 7], [2, 7], [0, 8], [1, 8], [2, 8],
      [4, 4], [5, 5], [7, 4], [3, 7], [5, 8], [8, 6]
    ];
    if (suspicious) {
      squares.push([4, 1], [5, 2], [3, 3], [6, 6], [7, 8]);
    } else {
      squares.push([5, 1], [4, 2], [6, 4], [3, 5], [7, 7]);
    }
    const cells = squares.map(([x, y]) => 
      `<rect x="${60 + x * 24}" y="${58 + y * 24}" width="20" height="20" rx="2" fill="#0f172a"/>`
    ).join("\n");
    const badge = suspicious ? "#ef4444" : "#14b8a6";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360">
      <rect width="360" height="360" fill="#ffffff"/>
      <rect x="42" y="40" width="276" height="276" rx="16" fill="#f8fafc" stroke="#cbd5e1"/>
      ${cells}
      <rect x="56" y="324" width="248" height="24" rx="6" fill="${badge}"/>
      <text x="180" y="341" text-anchor="middle" font-family="Inter, Arial" font-size="11" font-weight="700" fill="#ffffff">${target}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (kind === "video_poster") {
    const title = content.headline || "Video clip";
    const detail = content.detail || "Review lighting, lip sync, edits, and source context.";
    const progressFill = suspicious ? "290" : "180";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <rect width="640" height="360" fill="#111827"/>
      <rect x="42" y="38" width="556" height="284" rx="18" fill="#1f2937" stroke="#475569"/>
      <circle cx="210" cy="168" r="72" fill="#334155"/>
      <rect x="312" y="104" width="188" height="18" rx="5" fill="#cbd5e1"/>
      <rect x="312" y="142" width="232" height="12" rx="4" fill="#94a3b8"/>
      <rect x="312" y="172" width="204" height="12" rx="4" fill="#94a3b8"/>
      <polygon points="224,168 190,145 190,191" fill="${accent}"/>
      <rect x="86" y="278" width="468" height="8" rx="4" fill="#475569"/>
      <rect x="86" y="278" width="${progressFill}" height="8" rx="4" fill="${accent}"/>
      <text x="54" y="70" font-family="Inter, Arial" font-size="18" font-weight="700" fill="#f8fafc">${title}</text>
      <text x="54" y="334" font-family="Inter, Arial" font-size="12" fill="#cbd5e1">${detail}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (kind === "website_html") {
    const brand = content.brand || "Account Portal";
    const domain = content.display_domain || "example.com";
    const call_to_action = content.call_to_action || "Continue";
    const website_accent = suspicious ? "#dc2626" : "#0f766e";
    const warning = suspicious ? "Secure your account in 10 minutes" : "Review your account settings";
    const body = content.body || "Use this page to review the trust indicators in a realistic website capture.";
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${brand}</title>
  <style>
    body { margin:0; font-family: Arial, sans-serif; color:#0f172a; background:#f8fafc; }
    header { display:flex; justify-content:space-between; align-items:center; padding:18px 28px; background:white; border-bottom:1px solid #e2e8f0; }
    main { max-width:760px; margin:34px auto; background:white; border:1px solid #e2e8f0; padding:28px; border-radius:14px; }
    .domain { font-size:12px; color:#64748b; }
    button { background:${website_accent}; color:white; border:0; border-radius:8px; padding:12px 18px; font-weight:700; cursor:pointer; }
    input { display:block; width:100%; box-sizing:border-box; margin:12px 0; padding:12px; border:1px solid #cbd5e1; border-radius:8px; }
  </style>
</head>
<body>
  <header><strong>${brand}</strong><span class="domain">${domain}</span></header>
  <main>
    <h1>${warning}</h1>
    <p>${body}</p>
    <input placeholder="Email address" />
    <input placeholder="Password" type="password" />
    <button>${call_to_action}</button>
  </main>
</body>
</html>`;
    return `data:text/html;utf8,${encodeURIComponent(html)}`;
  }

  if (kind === "audio_wav") {
    return "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA";
  }

  return "";
}

function defaultStats() {
  return {
    attempts: 0,
    correct: 0,
    accuracy: 0.0,
    streak: 0,
    best_streak: 0,
    reasoning_average: 0.0,
    skill_score: 0,
    by_type: {},
    achievements: [],
    last_attempt_at: null
  };
}

function getStoredUser(email?: string): User {
  const stored = localStorage.getItem("deepshield_user");
  if (stored) {
    return JSON.parse(stored);
  }
  const defaultUser: User = {
    id: "mock-user-123",
    email: email || "admin@deepshield.local",
    full_name: email ? email.split("@")[0] : "DeepShield Learner",
    role: "learner",
    stats: defaultStats()
  };
  localStorage.setItem("deepshield_user", JSON.stringify(defaultUser));
  return defaultUser;
}

function getStoredAttempts(): any[] {
  const stored = localStorage.getItem("deepshield_attempts");
  return stored ? JSON.parse(stored) : [];
}

function saveStoredAttempts(attempts: any[]) {
  localStorage.setItem("deepshield_attempts", JSON.stringify(attempts));
}

function saveUser(user: User) {
  localStorage.setItem("deepshield_user", JSON.stringify(user));
}

export const mockApi = {
  async register(payload: { email: string; password: string; full_name: string }) {
    const user: User = {
      id: "mock-user-" + Math.random().toString(36).substring(2, 9),
      email: payload.email,
      full_name: payload.full_name,
      role: "learner",
      stats: defaultStats()
    };
    saveUser(user);
    return {
      access_token: "mock-token-jwt",
      token_type: "bearer",
      user
    };
  },

  async login(payload: { email: string; password: string }) {
    const user = getStoredUser(payload.email);
    user.email = payload.email;
    user.full_name = payload.email.split("@")[0].replace(/[^a-zA-Z]/g, " ");
    saveUser(user);
    return {
      access_token: "mock-token-jwt",
      token_type: "bearer",
      user
    };
  },

  async me(token: string): Promise<User> {
    return getStoredUser();
  },

  async modes(token: string): Promise<any[]> {
    return [
      { id: "quick", title: "Quick Mix", description: "A short mix across all available scenario types." },
      { id: "text_only", title: "Text Signals", description: "Generated messages, posts, and emails from local open-source models." },
      { id: "multimodal", title: "Multimodal Lab", description: "Images, audio, video, QR, and website evidence from managed datasets." },
      { id: "weakness_drill", title: "Weakness Drill", description: "Personalized practice based on your lowest scoring content type." },
      { id: "advanced", title: "Advanced Review", description: "Harder scenarios with subtle manipulation patterns." }
    ];
  },

  async nextScenario(token: string, mode: string, scenarioType?: ScenarioType | ""): Promise<Scenario> {
    let list = [...scenariosData];

    // Filter by type
    if (scenarioType) {
      list = list.filter((s) => s.scenario_type === scenarioType);
    }

    if (mode === "text_only") {
      list = list.filter((s) => s.scenario_type === "text");
    } else if (mode === "multimodal") {
      list = list.filter((s) => s.scenario_type !== "text");
    } else if (mode === "advanced") {
      list = list.filter((s) => s.difficulty >= 3);
    } else if (mode === "weakness_drill") {
      const user = getStoredUser();
      const byType = user.stats.by_type || {};
      let weakestType: ScenarioType = "image";
      let lowestAccuracy = 1.1;

      const types: ScenarioType[] = ["text", "image", "audio", "video", "qr_code", "website"];
      types.forEach((t) => {
        const stats = byType[t] || { attempts: 0, correct: 0 };
        const acc = stats.attempts > 0 ? stats.correct / stats.attempts : 0;
        if (acc < lowestAccuracy) {
          lowestAccuracy = acc;
          weakestType = t;
        }
      });
      list = list.filter((s) => s.scenario_type === weakestType);
    }

    if (list.length === 0) {
      list = [...scenariosData];
    }

    const selected = list[Math.floor(Math.random() * list.length)];
    const content = { ...selected.content };

    // Hydrate asset URL client-side
    const assetUrl = generateAssetUrl(selected);
    if (assetUrl) {
      if (selected.content.asset_kind === "video_poster") {
        content.poster_url = assetUrl;
      } else {
        content.asset_url = assetUrl;
      }
    }

    return {
      id: selected.dataset_key,
      scenario_type: selected.scenario_type,
      title: selected.title,
      content,
      difficulty: selected.difficulty,
      tags: selected.tags,
      source: selected.source
    } as Scenario;
  },

  async submitAttempt(
    token: string,
    payload: { scenario_id: string; selected_label: TruthLabel; reasoning: string }
  ): Promise<AttemptResult> {
    const scenario = scenariosData.find((s) => s.dataset_key === payload.scenario_id);
    if (!scenario) throw new Error("Scenario not found");

    const isCorrect = payload.selected_label === scenario.label;
    const reasoningScore = Math.min(100, Math.max(40, 60 + Math.floor(Math.random() * 35)));
    const overallScore = isCorrect ? reasoningScore : Math.floor(reasoningScore * 0.4);

    const feedback = isCorrect
      ? `Correct! Your analysis matches the ground truth. You spotted the key signals: ${scenario.indicators.slice(0, 2).join(", ")}.`
      : `Incorrect. This is actually ${scenario.label.toUpperCase()}. Watch out for: ${scenario.indicators.slice(0, 2).join(", ")}.`;

    const attempt = {
      id: "attempt-" + Math.random().toString(36).substring(2, 9),
      user_id: "mock-user-123",
      scenario_id: payload.scenario_id,
      scenario_type: scenario.scenario_type,
      selected_label: payload.selected_label,
      correct_label: scenario.label,
      reasoning: payload.reasoning,
      is_correct: isCorrect,
      reasoning_score: reasoningScore,
      overall_score: overallScore,
      feedback,
      matched_indicators: isCorrect ? scenario.indicators : [],
      missed_indicators: isCorrect ? [] : scenario.indicators,
      gemini_analysis: `Client Evaluation: The user verdict of ${payload.selected_label} is ${isCorrect ? "correct" : "incorrect"}. Explanation: ${scenario.explanation}`,
      huggingface_analysis: "Local validation checks complete.",
      final_report: scenario.explanation,
      created_at: new Date().toISOString()
    };

    // Save attempt
    const attempts = getStoredAttempts();
    attempts.unshift(attempt);
    saveStoredAttempts(attempts);

    // Update user stats
    const user = getStoredUser();
    const stats = user.stats;
    stats.attempts += 1;
    if (isCorrect) stats.correct += 1;
    stats.accuracy = Number((stats.correct / stats.attempts).toFixed(3));

    // Streak logic
    if (isCorrect) {
      stats.streak += 1;
      if (stats.streak > stats.best_streak) {
        stats.best_streak = stats.streak;
      }
    } else {
      stats.streak = 0;
    }

    // Average reasoning
    stats.reasoning_average = Number(
      ((stats.reasoning_average * (stats.attempts - 1) + reasoningScore) / stats.attempts).toFixed(1)
    );

    // Skill score
    stats.skill_score = Math.floor(stats.correct * 10 + stats.streak * 5 + stats.best_streak * 2);

    // By type stats
    const t = scenario.scenario_type;
    if (!stats.by_type[t]) {
      stats.by_type[t] = { attempts: 0, correct: 0, accuracy: 0.0, reasoning_average: 0.0 };
    }
    stats.by_type[t].attempts += 1;
    if (isCorrect) stats.by_type[t].correct += 1;
    stats.by_type[t].accuracy = Number((stats.by_type[t].correct / stats.by_type[t].attempts).toFixed(3));
    stats.by_type[t].reasoning_average = Number(
      ((stats.by_type[t].reasoning_average * (stats.by_type[t].attempts - 1) + reasoningScore) / stats.by_type[t].attempts).toFixed(1)
    );

    // Achievements check
    const achievements: Achievement[] = stats.achievements || [];
    const hasFirstStep = achievements.some(a => a.id === "first_step");
    const hasTrustInitiate = achievements.some(a => a.id === "trust_initiate");
    const hasSharpEye = achievements.some(a => a.id === "sharp_eye");

    if (stats.attempts >= 1 && !hasFirstStep) {
      achievements.push({ id: "first_step", title: "First Step", description: "Completed your first digital trust scenario." });
    }
    if (stats.attempts >= 10 && !hasTrustInitiate) {
      achievements.push({ id: "trust_initiate", title: "Trust Initiate", description: "Successfully reviewed 10 scenarios." });
    }
    if (stats.streak >= 5 && !hasSharpEye) {
      achievements.push({ id: "sharp_eye", title: "Sharp Eye", description: "Achieved a streak of 5 correct verdicts." });
    }
    stats.achievements = achievements;

    user.stats = stats;
    saveUser(user);

    // Prepare result scenario hydrated
    const content = { ...scenario.content };
    const assetUrl = generateAssetUrl(scenario);
    if (assetUrl) {
      if (scenario.content.asset_kind === "video_poster") {
        content.poster_url = assetUrl;
      } else {
        content.asset_url = assetUrl;
      }
    }

    const resultScenario = {
      id: scenario.dataset_key,
      scenario_type: scenario.scenario_type,
      title: scenario.title,
      content,
      difficulty: scenario.difficulty,
      tags: scenario.tags,
      source: scenario.source,
      label: scenario.label,
      indicators: scenario.indicators,
      explanation: scenario.explanation
    };

    return {
      attempt,
      evaluation: {
        is_correct: isCorrect,
        reasoning_score: reasoningScore,
        overall_score: overallScore,
        feedback,
        matched_indicators: isCorrect ? scenario.indicators : [],
        missed_indicators: isCorrect ? [] : scenario.indicators,
        final_report: scenario.explanation
      },
      scenario: resultScenario,
      stats
    } as any;
  },

  async dashboard(token: string): Promise<DashboardData> {
    const user = getStoredUser();
    const attempts = getStoredAttempts().slice(0, 5);

    // Dynamic weakness based on actual stats
    const byType = user.stats.by_type || {};
    let weakestType: ScenarioType = "image";
    let lowestAccuracy = 1.1;
    const types: ScenarioType[] = ["text", "image", "audio", "video", "qr_code", "website"];
    types.forEach((t) => {
      const stats = byType[t] || { attempts: 0, correct: 0 };
      const acc = stats.attempts > 0 ? stats.correct / stats.attempts : 0;
      if (acc < lowestAccuracy) {
        lowestAccuracy = acc;
        weakestType = t;
      }
    });

    const recommendations = [
      {
        scenario_type: weakestType,
        title: `Sharpen your ${weakestType.replace("_", " ")} signals`,
        reason: `Your accuracy in this category is currently lower. Practice is recommended.`,
        action: `Start drill`
      }
    ];

    const weaknesses = types.map((t) => {
      const stats = byType[t] || { attempts: 0, correct: 0, accuracy: 0.0, reasoning_average: 0.0 };
      const accuracy = stats.attempts > 0 ? stats.correct / stats.attempts : 0.0;
      return {
        scenario_type: t,
        accuracy,
        reasoning_average: stats.reasoning_average || 0.0,
        attempts: stats.attempts,
        risk: Math.max(0, Math.floor((1 - accuracy) * 100))
      };
    });

    return {
      stats: user.stats,
      recent_attempts: attempts,
      recommendations,
      weaknesses
    };
  },

  async progress(token: string): Promise<ProgressData> {
    const user = getStoredUser();
    const attempts = getStoredAttempts();
    return {
      stats: user.stats,
      history: attempts,
      by_type: user.stats.by_type
    };
  },

  async leaderboard(token: string): Promise<any[]> {
    const user = getStoredUser();
    return [
      { rank: 1, full_name: "DeepShield Expert", skill_score: 950, accuracy: 0.94 },
      { rank: 2, full_name: "Security Analyst", skill_score: 720, accuracy: 0.88 },
      { rank: 3, full_name: user.full_name || "You", skill_score: user.stats.skill_score, accuracy: user.stats.accuracy }
    ];
  },

  async adminMonitoring(token: string): Promise<any> {
    return {
      system_status: "Healthy (Client-Side Simulated)",
      uptime: "99.9%",
      database_connection: "Connected",
      total_users: 1,
      total_attempts: getStoredAttempts().length,
      model_status: "Active"
    };
  }
};
