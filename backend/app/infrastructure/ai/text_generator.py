from __future__ import annotations

import asyncio
import json
import random
import re
from typing import Any

from app.domain.enums import TruthLabel


class OpenSourceTextGenerator:
    """Local open-source text generation adapter.

    The adapter lazily loads Hugging Face transformers so the API remains usable in
    lightweight dev/test environments. When the model cannot be loaded, it returns
    deterministic template scenarios with the same contract.
    """

    def __init__(self, *, model_name: str, enabled: bool = True):
        self.model_name = model_name
        self.enabled = enabled
        self._pipeline: Any | None = None
        self._load_error: str | None = None

    async def generate(self, *, label: TruthLabel, difficulty: int, mode: str) -> dict[str, Any]:
        if not self.enabled:
            return self._fallback(label=label, difficulty=difficulty, mode=mode)

        try:
            return await asyncio.to_thread(self._generate_sync, label, difficulty, mode)
        except Exception as exc:  # pragma: no cover - model availability differs by machine.
            self._load_error = str(exc)
            return self._fallback(label=label, difficulty=difficulty, mode=mode)

    def _generate_sync(self, label: TruthLabel, difficulty: int, mode: str) -> dict[str, Any]:
        pipeline = self._get_pipeline()
        prompt = (
            "Create one digital trust training scenario as compact JSON. "
            "Fields: title, body, sender, channel, context, indicators, explanation, tags. "
            "The body must be the exact visible email, WhatsApp, chat, or SMS message shown to the learner. "
            "Do not make tone/source/intent the main content; those may only be metadata. "
            f"The content must be {label.value}. Difficulty 1-5: {difficulty}. "
            f"Training mode: {mode}. "
            "Include tricky near-genuine examples at higher difficulty. "
            "Indicators must teach how to distinguish fake from genuine."
        )
        raw = pipeline(prompt, max_new_tokens=220, do_sample=True, temperature=0.8)[0]["generated_text"]
        parsed = self._parse_json(raw)
        return self._normalize(parsed, label=label, difficulty=difficulty, mode=mode)

    def _get_pipeline(self) -> Any:
        if self._pipeline is None:
            from transformers import pipeline

            task = "text2text-generation" if "t5" in self.model_name.lower() else "text-generation"
            self._pipeline = pipeline(task, model=self.model_name)
        return self._pipeline

    def _parse_json(self, raw: str) -> dict[str, Any]:
        match = re.search(r"\{.*\}", raw, flags=re.DOTALL)
        if not match:
            raise ValueError("Model output did not contain JSON")
        return json.loads(match.group(0))

    def _normalize(
        self,
        parsed: dict[str, Any],
        *,
        label: TruthLabel,
        difficulty: int,
        mode: str,
    ) -> dict[str, Any]:
        indicators = parsed.get("indicators") or []
        if isinstance(indicators, str):
            indicators = [indicators]
        tags = parsed.get("tags") or ["text", "llm_generated"]
        if isinstance(tags, str):
            tags = [tags]
        body = str(parsed.get("body") or parsed.get("message") or "").strip()
        if len(body) < 20:
            return self._fallback(label=label, difficulty=difficulty, mode=mode)
        return {
            "title": str(parsed.get("title") or f"{label.value.title()} digital message"),
            "content": {
                "body": body,
                "sender": str(parsed.get("sender") or "unknown"),
                "channel": str(parsed.get("channel") or "message"),
                "context": str(parsed.get("context") or "Review the visible message and decide whether it is trustworthy."),
                "mode": mode,
                "model": self.model_name,
            },
            "indicators": [str(item) for item in indicators[:6]] or self._fallback_indicators(label),
            "explanation": str(parsed.get("explanation") or "Review sender, context, urgency, links, and evidence quality."),
            "tags": [str(item) for item in tags[:8]],
            "difficulty": difficulty,
        }

    def _fallback(self, *, label: TruthLabel, difficulty: int, mode: str) -> dict[str, Any]:
        fake_templates = [
            {
                "title": "Fake Email: Payroll Portal Lock",
                "body": "Subject: Payroll access expires today\n\nHi Anika,\n\nYour payroll profile will be locked at 5 PM unless you confirm your identity now. Use this secure link: https://payroII-secure.example/employee-verify\n\nThis avoids salary processing delays.\n\nPayroll Operations",
                "sender": "payroll-alerts@corp-payroll.example",
                "channel": "email",
                "context": "Unexpected email that claims payroll access will expire today.",
                "indicators": [
                    "Creates urgent pressure to act quickly",
                    "Uses a lookalike domain with payroII instead of payroll",
                    "Requests identity confirmation through an external site",
                    "Threatens a consequence that does not match normal HR process",
                ],
                "explanation": "This is fake because the message uses urgency, a lookalike domain, and an external identity form for a sensitive payroll task.",
                "tags": ["phishing", "lookalike_domain", "urgency", "credential_theft"],
            },
            {
                "title": "Fake WhatsApp: Delivery Fee Trap",
                "body": "WhatsApp message:\nHey, this is from SwiftShip support. Your package is held because the address failed verification. Pay the Rs. 19 re-delivery fee here in the next 20 minutes: https://swiftship-india.help/confirm\n\nReply DONE after payment.",
                "sender": "+91 87900 14227",
                "channel": "whatsapp",
                "context": "A WhatsApp message arrives even though the delivery company normally sends app notifications.",
                "indicators": [
                    "Unexpected payment request in WhatsApp",
                    "Small fee is used to harvest payment details",
                    "The link uses a support-looking domain instead of the official domain",
                    "Creates a short deadline to prevent verification",
                ],
                "explanation": "This is fake because it moves a delivery payment into WhatsApp, uses a suspicious domain, and pressures the user to pay quickly.",
                "tags": ["whatsapp", "delivery_scam", "payment_fraud", "urgency"],
            },
            {
                "title": "Tricky Fake Chat: Real Colleague, Bad Link",
                "body": "Team chat from 'Rahul - IT':\nMorning. We are rotating Microsoft session keys today. You will get one login code. Send it here so I can keep your Teams active during the migration. The official note is at https://company-sso.help/migrate",
                "sender": "Rahul - IT",
                "channel": "chat",
                "context": "The sender name matches a real IT colleague, but the request arrives in a direct chat.",
                "indicators": [
                    "Asks the user to share a login code",
                    "Uses a convincing colleague identity but an external domain",
                    "Claims a technical migration to justify bypassing normal process",
                    "Requests sensitive authentication material in chat",
                ],
                "explanation": "This is fake even though the sender looks familiar. A real IT process would never ask for a login code in chat, and the domain is external.",
                "tags": ["chat", "tricky", "mfa_theft", "impersonation"],
            },
        ]
        genuine_templates = [
            {
                "title": "Genuine Email: Account Security Notice",
                "body": "Subject: New sign-in detected\n\nA new sign-in to your account was detected from Chrome on macOS. If this was you, no action is needed. To review activity, open the app directly and visit Settings > Security.\n\nSecurity Team",
                "sender": "security@trustedservice.example",
                "channel": "email",
                "context": "Expected security notification that does not force the user through a link.",
                "indicators": [
                    "Does not ask for a password or payment",
                    "Directs the user to open the app independently",
                    "Provides neutral account activity context",
                    "Avoids urgent threats or rewards",
                ],
                "explanation": "This is genuine because it gives a security notice without pushing a link, credential request, or high-pressure action.",
                "tags": ["account_security", "safe_guidance", "notification"],
            },
            {
                "title": "Genuine WhatsApp: Team Schedule Update",
                "body": "WhatsApp message from Meera (Team Lead):\nStandup moves to 10:15 today because the client call ran long. No action needed; calendar invite is already updated.",
                "sender": "Meera (Team Lead)",
                "channel": "whatsapp",
                "context": "A low-risk team update from a known contact.",
                "indicators": [
                    "No links, payments, passwords, or codes are requested",
                    "The message fits a normal team workflow",
                    "The sender and calendar context are expected",
                    "There is no urgent threat or reward",
                ],
                "explanation": "This is genuine because it is a routine schedule update and asks for no sensitive action.",
                "tags": ["whatsapp", "team_update", "genuine", "low_pressure"],
            },
            {
                "title": "Tricky Genuine Email: Security Review",
                "body": "Subject: Review your security settings\n\nWe noticed you have not reviewed your recovery options this quarter. Please open the mobile app directly, go to Settings > Security, and check that your recovery email is current. We will never ask for your password or one-time code by email.\n\nAccount Safety Team",
                "sender": "account-safety@trustedservice.example",
                "channel": "email",
                "context": "A security message that sounds serious but avoids risky links or secret collection.",
                "indicators": [
                    "Instructs the user to open the app directly",
                    "Explicitly says not to share passwords or one-time codes",
                    "No link or payment request is present",
                    "The action is a normal account safety review",
                ],
                "explanation": "This is genuine. It may look serious, but it avoids links and secrets and sends the user through the normal app workflow.",
                "tags": ["email", "tricky", "security_notice", "genuine"],
            },
            {
                "title": "Genuine Email: Order Delivery Update",
                "body": "Subject: Order DS-4821 shipped\n\nYour order DS-4821 shipped. Tracking is available in your account order history. Delivery estimate: Friday.\n\nNorth Trail Store",
                "sender": "orders@store.example",
                "channel": "email",
                "context": "Expected order update for an existing purchase.",
                "indicators": [
                    "References a specific expected order",
                    "Encourages checking account order history",
                    "No request for credentials or payment",
                    "Uses concise operational language",
                ],
                "explanation": "This is genuine because the message is specific, low pressure, and routes the user to an existing account workflow.",
                "tags": ["order_update", "transactional", "low_pressure"],
            },
        ]
        template = random.choice(fake_templates if label == TruthLabel.FAKE else genuine_templates)
        return {
            "title": template["title"],
            "content": {
                "body": template["body"],
                "sender": template["sender"],
                "channel": template["channel"],
                "context": template["context"],
                "mode": mode,
                "model": f"fallback:{self.model_name}",
            },
            "indicators": template["indicators"],
            "explanation": template["explanation"],
            "tags": template["tags"] + ["text", "llm_generated"],
            "difficulty": difficulty,
        }

    def _fallback_indicators(self, label: TruthLabel) -> list[str]:
        if label == TruthLabel.FAKE:
            return ["Suspicious sender", "Unusual urgency", "Sensitive request", "Unverified link"]
        return ["Expected context", "No sensitive request", "Low pressure", "Direct account guidance"]
