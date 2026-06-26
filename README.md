# DeepShield AI

AI-powered digital trust training platform for spotting fake and genuine digital content.

## Stack

- React, TypeScript, Tailwind, Vite
- FastAPI with clean architecture layers
- MongoDB via Motor
- JWT authentication
- Docker Compose
- Dual AI Verification Engine: Google Gemini primary reasoning plus a configurable Hugging Face open-source LLM through the Hugging Face router
- Optional local AI packages: Hugging Face `transformers` and `sentence-transformers` can be installed from `backend/requirements-local-ai.txt`

## Architecture

```text
backend/app
  domain/                 entities, enums, repository ports
  application/            auth, scenario, evaluation, analytics, recommendations
  infrastructure/         Mongo repositories, AI adapters, dataset and plugin implementations
  interfaces/api/         FastAPI routes and dependencies
frontend/src
  api/ auth/ components/ pages/
```

The Scenario Engine is plugin-oriented. Text scenarios are produced by `TextLLMScenarioPlugin` using an open-source model adapter with clear email, WhatsApp, chat, and SMS examples. Image, audio, video, QR, and website scenarios are supplied by `DatasetScenarioPlugin` from managed manifests in `backend/app/infrastructure/datasets/manifests`. Runtime assets are generated automatically under `/static/datasets`, so learners and admins do not upload content.

After a learner submits an answer, Gemini and the configured Hugging Face model both analyze the verdict and reasoning. The Comparison Engine merges both analyses into one educational report, explains disagreements by evidence strength, and updates progress, weaknesses, achievements, and skill score.

To add a new type, implement the `ScenarioPlugin` contract, register it in `backend/app/main.py`, and add a frontend renderer branch for that scenario type.

## Run With Docker

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend health: http://localhost:8000/api/health
- Seeded admin: `admin@deepshield.local` / `AdminPass123!`

Put `GEMINI_API_KEY` and `HF_TOKEN` in `.env`. Do not commit real keys. `HF_MODEL_NAME` can be changed to swap models without changing application code, for example `meta-llama/Llama-3.1-8B-Instruct` if it is available to your Hugging Face account.

If API keys are absent or a provider is unavailable, DeepShield still returns a marked local evidence fallback so the training flow keeps working in development. Production deployments should set both keys.

## Local Development

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

For optional local Hugging Face model generation:

```bash
pip install -r requirements-local-ai.txt
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

MongoDB must be running locally on `mongodb://localhost:27017`, or set `MONGODB_URI`.

## Implemented Phases

1. Project structure: separate backend/frontend/deployment roots
2. Database schema: users, scenarios, attempts, stats, indexes
3. Backend APIs: auth, scenario delivery, attempt submission, analytics, leaderboard, admin monitoring
4. Frontend pages: dashboard, training modes, training flow, progress, leaderboard, analytics, admin
5. AI integration: local OSS LLM adapter plus optional embedding reasoning model
6. Evaluation engine: Gemini analysis, Hugging Face analysis, confidence comparison, indicators, explanations
7. Analytics: weaknesses, recommendations, achievements, leaderboard, admin inventory
8. Testing: focused backend tests for scoring and plugin seams
9. Docker deployment: Mongo, FastAPI, Nginx-served React app

## Test

```bash
cd backend
pytest
```
# Deep-Shield-1
