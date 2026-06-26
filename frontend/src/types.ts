export type ScenarioType = "text" | "image" | "audio" | "video" | "qr_code" | "website";
export type TruthLabel = "fake" | "genuine";
export type TrainingMode = "quick" | "text_only" | "multimodal" | "weakness_drill" | "advanced";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "learner" | "admin";
  stats: UserStats;
}

export interface UserStats {
  attempts: number;
  correct: number;
  accuracy: number;
  streak: number;
  best_streak: number;
  reasoning_average: number;
  skill_score: number;
  by_type: Record<string, TypeStats>;
  achievements: Achievement[];
  last_attempt_at?: string | null;
}

export interface TypeStats {
  attempts: number;
  correct: number;
  accuracy: number;
  reasoning_average: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export interface Scenario {
  id: string;
  scenario_type: ScenarioType;
  title: string;
  content: Record<string, any>;
  difficulty: number;
  tags: string[];
  source: string;
}

export interface DashboardData {
  stats: UserStats;
  recent_attempts: any[];
  recommendations: Recommendation[];
  weaknesses: Weakness[];
}

export interface Recommendation {
  title: string;
  reason: string;
  action: string;
  scenario_type: string;
}

export interface Weakness {
  scenario_type: ScenarioType;
  accuracy: number;
  reasoning_average: number;
  attempts: number;
  risk: number;
}

export interface ProgressData {
  stats: UserStats;
  history: any[];
  by_type: Record<string, TypeStats>;
}

export interface AttemptResult {
  attempt: any;
  evaluation: {
    is_correct: boolean;
    correct_label: TruthLabel;
    selected_label: TruthLabel;
    reasoning_score: number;
    overall_score: number;
    feedback: string;
    matched_indicators: string[];
    missed_indicators: string[];
    indicators: string[];
    explanation: string;
    gemini_analysis?: AIProviderAnalysis | null;
    huggingface_analysis?: AIProviderAnalysis | null;
    final_report?: FinalAIReport;
  };
  scenario: {
    id: string;
    scenario_type: ScenarioType;
    title: string;
    label: TruthLabel;
    indicators: string[];
    explanation: string;
  };
  stats: UserStats;
}

export interface AIProviderAnalysis {
  provider: string;
  model: string;
  verdict: TruthLabel | "uncertain";
  confidence: number;
  is_user_correct: boolean;
  reasoning_score: number;
  analysis: string;
  evidence: string[];
  missed_indicators: string[];
  improvement_tips: string[];
  status: string;
  error?: string | null;
}

export interface FinalAIReport {
  final_verdict: TruthLabel;
  confidence: number;
  models_agree: boolean;
  stronger_provider: string;
  disagreement_summary: string;
  educational_explanation: string;
  missed_indicators: string[];
  improvement_tips: string[];
  confidence_scores: {
    gemini: number;
    huggingface: number;
    combined: number;
  };
}

export interface TrainingModeInfo {
  id: TrainingMode;
  title: string;
  description: string;
}
