import json
from pathlib import Path

def main():
    root = Path(__file__).resolve().parent.parent.parent
    json_path = root / "backend" / "app" / "infrastructure" / "datasets" / "manifests" / "core_scenarios.json"
    ts_path = root / "frontend" / "src" / "api" / "scenariosData.ts"
    
    print(f"Reading JSON manifest from: {json_path}")
    data = json.loads(json_path.read_text(encoding="utf-8"))
    
    # Wrap in TypeScript module
    ts_content = f"""// Generated automatically from core_scenarios.json. Do not edit directly.
import type {{ ScenarioType, TruthLabel }} from "../types";

export interface MockScenario {{
  dataset_key: string;
  scenario_type: ScenarioType;
  label: TruthLabel;
  title: string;
  difficulty: number;
  source: string;
  content: Record<string, any>;
  indicators: string[];
  explanation: string;
  tags: string[];
}}

export const scenariosData: MockScenario[] = {json.dumps(data, indent=2)};
"""
    
    print(f"Writing TypeScript module to: {ts_path}")
    ts_path.write_text(ts_content, encoding="utf-8")
    print("Conversion complete!")

if __name__ == "__main__":
    main()
