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
                "title": "Fake WhatsApp: Family Member Urgency",
                "body": "WhatsApp message:\nHey mom, it's me. I dropped my phone and broke the screen, this is my temporary number. I need to pay an urgent bill of Rs. 45,000 for my laptop repair today, but my banking app is locked on this new device. Can you pay it for me? Here are the UPI details: apex-repair@icici.upi. Quick, they are closing the shop.",
                "sender": "+91 91234 56789",
                "channel": "whatsapp",
                "context": "A WhatsApp message from an unknown number claiming to be your child asking for an urgent money transfer.",
                "indicators": [
                    "Requests immediate payment to a new, unverified account",
                    "Claims device loss to justify the use of a new number",
                    "Bypasses direct voice verification",
                    "Uses high emotional pressure and urgency",
                ],
                "explanation": "This is a family impersonation scam. The urgency, request for direct UPI transfer, and lack of voice confirmation are critical red flags.",
                "tags": ["whatsapp", "impersonation", "family_scam", "payment_fraud"],
            },
            {
                "title": "Fake WhatsApp: TripAdvisor Job Scam",
                "body": "WhatsApp message:\nDear Candidate, I am Sarah from TripAdvisor HR. We saw your resume online and have part-time remote work. You can earn Rs. 3,000 - 8,000 daily by rating hotels on Google. No experience needed. Contact our team lead on Telegram to start: https://t.me/tripadvisor-hr-sarah",
                "sender": "+1 (415) 888-2947",
                "channel": "whatsapp",
                "context": "An unsolicited WhatsApp message offering easy remote income from a foreign number.",
                "indicators": [
                    "Unsolicited job offer with unusually high pay for simple tasks",
                    "Uses a foreign phone number claiming to represent a domestic company",
                    "Routes communications to an unverified Telegram chat link",
                    "Requests no formal interview or credentials",
                ],
                "explanation": "This is a recruitment scam. Legitimate HR teams do not recruit via WhatsApp from random numbers and will never route onboarding to anonymous Telegram links.",
                "tags": ["whatsapp", "job_scam", "telecommuting", "unsolicited"],
            },
            {
                "title": "Fake Email: Shared Document Phish",
                "body": "Subject: Q2 Budget Review - Shared Document\n\nGoogle Docs: deepshield-accounting shared a document with you:\n\nQ2_Budget_Projections_Final.xlsx\n\nTo view the spreadsheet, verify your employee credentials here: https://docs-google.office-verification.example/auth\n\nGoogle Workspace Team",
                "sender": "workspace-alerts@docs-share.example",
                "channel": "email",
                "context": "An email notification for a shared document that demands login credentials to open.",
                "indicators": [
                    "Demands credential entry to view a document",
                    "Uses a mixed-brand lookalike domain (docs-google.office-verification)",
                    "Sender domain does not match official Google Workspace alerts",
                    "Bypasses standard enterprise document share portals",
                ],
                "explanation": "This is fake. Shared document notices from Google or Microsoft never route users to external domains combining both Google and Office brand names to harvest login details.",
                "tags": ["email", "phishing", "credential_theft", "lookalike_domain"],
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
            {
                "title": "Fake WhatsApp: Bank Reward Scam",
                "body": "WhatsApp message from HDFC-Rewards:\nCongratulations! You have been selected to redeem Rs. 5,000 cash points on your credit card ending in 4920. Click here to verify your account details and claim the reward within 24 hours: https://hdfc-points-redeem.example/login",
                "sender": "HDFC-Rewards",
                "channel": "whatsapp",
                "context": "An unsolicited message from a brand claiming reward points are expiring.",
                "indicators": [
                    "Unsolicited reward notification",
                    "Uses external lookalike domain instead of official mobile banking app",
                    "Creates artificial 24-hour urgency",
                    "Requests credentials to redeem points",
                ],
                "explanation": "This is fake. Official bank reward systems do not notify users on unverified WhatsApp accounts with external login links.",
                "tags": ["whatsapp", "rewards_scam", "credential_theft", "lookalike_domain"],
            },
            {
                "title": "Fake Email: Security Access Suspension",
                "body": "Subject: Urgent: Unauthorized login attempt detected\n\nDear User,\n\nWe detected a sign-in attempt from a new device in Moscow, Russia. To protect your account, your access has been temporarily suspended. You must verify your credentials within 12 hours to unlock your account: http://verification-security-portal.example/unlock\n\nIT Security Operations",
                "sender": "security-alerts@corporate-security-update.example",
                "channel": "email",
                "context": "Urgent email alert claiming suspicious activity and threatening suspension.",
                "indicators": [
                    "Urgent threats of account suspension",
                    "Non-secure HTTP link instead of HTTPS",
                    "Lookalike sender domain",
                    "Short deadline to verify",
                ],
                "explanation": "This is fake. IT security departments do not use unencrypted HTTP links or demand credential verification under short-notice suspension threats.",
                "tags": ["email", "phishing", "credential_theft", "urgency"],
            },
            {
                "title": "Fake WhatsApp: Courier Address Correction",
                "body": "WhatsApp message:\nHi, your India Post shipment #IN-8402-984 is held at the sorting office due to an incomplete delivery address. Please update your house number and pay a Rs. 25 re-routing fee here: https://indiapost-redelivery.example/address-update\n\nThanks,\nIndia Post Delivery",
                "sender": "+91 70293 84721",
                "channel": "whatsapp",
                "context": "A message claiming an address correction is needed for a postal delivery.",
                "indicators": [
                    "Requests fee payment on an external link via WhatsApp",
                    "Sender is a personal mobile number",
                    "Uses a lookalike India Post domain",
                    "Creates urgency for a package you might not be expecting",
                ],
                "explanation": "This is fake. India Post does not request re-routing fees or address changes via individual WhatsApp mobile numbers.",
                "tags": ["whatsapp", "delivery_scam", "payment_fraud", "lookalike_domain"],
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
                "title": "Genuine Email: Password Expiry Notice",
                "body": "Subject: Your password expires in 7 days\n\nHello Vikram,\n\nYour corporate network password will expire in 7 days. To reset it, please log into your employee dashboard using your regular bookmark, click 'Security Settings', and follow the prompts. Do not click links in security alerts; always navigate to the dashboard independently.\n\nIT Service Desk",
                "sender": "it-services@corp.deepshield.local",
                "channel": "email",
                "context": "A routine password expiration notice that explicitly warns against clicking links.",
                "indicators": [
                    "Does not contain direct links to a login page",
                    "Directs the user to navigate independently via their own bookmark",
                    "Includes explicit safety advice",
                    "Fits routine IT security protocols",
                ],
                "explanation": "This is genuine. It follows best security practices by notifying the user while instructing them to navigate independently to change their credentials.",
                "tags": ["email", "genuine", "it_services", "password_policy"],
            },
            {
                "title": "Genuine WhatsApp: Delivery Schedule Confirmation",
                "body": "WhatsApp message:\nHi Thrivikram, your package #DL-9482 is out for delivery today. If you need to reschedule or contact your delivery partner (Ramesh: +91 99887 76655), please open the official Delhivery mobile app. We will never ask for payment or OTPs via chat.",
                "sender": "Delhivery Support",
                "channel": "whatsapp",
                "context": "A verified WhatsApp business alert for an expected package delivery.",
                "indicators": [
                    "References a specific trackable package number",
                    "Includes no payment links or OTP requests",
                    "Redirects the user to the official application for changes",
                    "Uses clear, operational status update information",
                ],
                "explanation": "This is genuine. It provides status updates and driver details for an expected delivery while explicitly stating that it will not ask for sensitive info.",
                "tags": ["whatsapp", "genuine", "delivery_update", "low_pressure"],
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
            {
                "title": "Genuine WhatsApp: UPI Transaction Alert",
                "body": "WhatsApp message:\nHi Rohan, you successfully sent Rs. 1,500 to Amit Kumar via GPay. Ref: 620495819385. If this wasn't you, block your UPI account immediately by opening your official bank app or dialing your bank's toll-free number from our official website.",
                "sender": "Google Pay Alerts",
                "channel": "whatsapp",
                "context": "A transaction confirmation notification with clear reference number.",
                "indicators": [
                    "Does not contain active links to input credentials or payment details",
                    "References a specific transaction and transaction reference number",
                    "Instructs user to contact support via official methods",
                    "Verified sender checkmark",
                ],
                "explanation": "This is genuine. It provides status updates and transaction logs without requesting passwords, codes, or redirection to unverified websites.",
                "tags": ["whatsapp", "transactional", "genuine", "low_pressure"],
            },
            {
                "title": "Genuine Email: Project Invitation",
                "body": "Subject: Welcome to the DeepShield Project Workspace\n\nHi Sarah,\n\nJohn has invited you to join the 'DeepShield-Security' project space on Jira. Please log into your Atlassian account using your usual company single sign-on (SSO) browser bookmark to access the board. No additional password setup is required.\n\nAtlassian Cloud Notifications",
                "sender": "jira@deepshield.atlassian.net",
                "channel": "email",
                "context": "A routine workspace invitation that avoids credential harvesting.",
                "indicators": [
                    "Directs user to their existing company SSO bookmark",
                    "Sender domain matches official Atlassian cloud tenant",
                    "Does not collect passwords",
                    "Matches expected collaborative onboarding",
                ],
                "explanation": "This is genuine because it advises standard SSO access routes and requests no credentials or payment.",
                "tags": ["email", "genuine", "jira", "workspace_invite"],
            },
            {
                "title": "Genuine Email: HR Benefits Webinar",
                "body": "Subject: Invitation: Q3 Health Benefits Webinar\n\nHello Team,\n\nJoin us this Thursday at 2:00 PM for our quarterly health benefits overview. The session will cover updates to medical coverages. We will present via the internal Microsoft Teams calendar invitation already on your calendar. No registration or software downloads are required.\n\nHR Department",
                "sender": "hr@company.deepshield.local",
                "channel": "email",
                "context": "An internal HR event invitation sent to all employees.",
                "indicators": [
                    "Refers to a webinar on the internal Teams calendar",
                    "Requires no external links or software installation",
                    "Uses the internal company domain",
                    "Asks for no credentials",
                ],
                "explanation": "This is genuine. It uses standard internal channels and calendar events without credential requests or urgent demands.",
                "tags": ["email", "genuine", "hr", "webinar"],
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
