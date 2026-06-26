// Generated automatically from core_scenarios.json. Do not edit directly.
import type { ScenarioType, TruthLabel } from "../types";

export interface MockScenario {
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
}

export const scenariosData: MockScenario[] = [
  {
    "dataset_key": "image_invoice_fake_001",
    "scenario_type": "image",
    "label": "fake",
    "title": "Vendor Invoice Screenshot",
    "difficulty": 2,
    "source": "managed_dataset:synthetic_document",
    "content": {
      "asset_kind": "svg_image",
      "template": "document",
      "suspicious": true,
      "headline": "Invoice #A-1048",
      "subhead": "Payment request from new vendor",
      "detail": "New bank details were added outside the purchase order workflow.",
      "alt": "Invoice screenshot with altered bank details"
    },
    "indicators": [
      "Bank details changed without a trusted approval trail",
      "Visual spacing and stamp alignment are inconsistent",
      "The invoice pressures payment to a new account",
      "Vendor context does not match a normal procurement workflow"
    ],
    "explanation": "The invoice is fake because it introduces new payment details and visual inconsistencies while creating pressure to bypass normal approval checks.",
    "tags": [
      "image",
      "invoice",
      "payment_fraud",
      "document_tampering"
    ]
  },
  {
    "dataset_key": "image_profile_genuine_001",
    "scenario_type": "image",
    "label": "genuine",
    "title": "Employee Profile Update",
    "difficulty": 1,
    "source": "managed_dataset:synthetic_profile",
    "content": {
      "asset_kind": "svg_image",
      "template": "profile",
      "suspicious": false,
      "headline": "Profile Update Notice",
      "subhead": "Internal directory change",
      "detail": "The notice matches the internal directory format and asks for no secrets.",
      "alt": "Internal profile update screenshot"
    },
    "indicators": [
      "No credential or payment request is present",
      "The message fits a routine internal workflow",
      "Visual formatting is consistent across the capture",
      "The user can verify through the internal directory"
    ],
    "explanation": "This is genuine because it is low pressure, visually consistent, and points to a routine internal directory update.",
    "tags": [
      "image",
      "profile",
      "internal_notice",
      "genuine"
    ]
  },
  {
    "dataset_key": "audio_voice_fake_001",
    "scenario_type": "audio",
    "label": "fake",
    "title": "Executive Voice Note",
    "difficulty": 3,
    "source": "managed_dataset:synthetic_audio",
    "content": {
      "asset_kind": "audio_wav",
      "suspicious": true,
      "duration_seconds": 3,
      "transcript": "I am in a confidential meeting. Buy five gift cards now and send the codes to this number before noon.",
      "speaker": "Claimed CFO",
      "context": "Unexpected voice note in a team chat"
    },
    "indicators": [
      "The request asks for gift card codes",
      "The speaker claims urgency and secrecy",
      "The channel is unusual for finance approval",
      "No callback or independent verification path is offered"
    ],
    "explanation": "The voice note is fake because it combines an unusual payment request with secrecy and urgent pressure.",
    "tags": [
      "audio",
      "voice_clone",
      "gift_card_scam",
      "urgency"
    ]
  },
  {
    "dataset_key": "audio_service_genuine_001",
    "scenario_type": "audio",
    "label": "genuine",
    "title": "Support Callback Recording",
    "difficulty": 2,
    "source": "managed_dataset:synthetic_audio",
    "content": {
      "asset_kind": "audio_wav",
      "suspicious": false,
      "duration_seconds": 3,
      "transcript": "This is your scheduled support callback. Please open your existing ticket and confirm the last four digits shown there.",
      "speaker": "Support agent",
      "context": "Callback requested by the user"
    },
    "indicators": [
      "The callback was expected",
      "The agent references an existing ticket",
      "The request avoids full passwords or payment details",
      "Verification happens through the user's existing support portal"
    ],
    "explanation": "This is genuine because it is expected, bounded to an existing ticket, and avoids collecting sensitive secrets.",
    "tags": [
      "audio",
      "support",
      "callback",
      "genuine"
    ]
  },
  {
    "dataset_key": "audio_vendor_fake_tricky_001",
    "scenario_type": "audio",
    "label": "fake",
    "title": "Tricky Voice Message from Vendor",
    "difficulty": 5,
    "source": "managed_dataset:synthetic_audio",
    "content": {
      "asset_kind": "audio_wav",
      "suspicious": true,
      "duration_seconds": 4,
      "transcript": "Hi, this is Priya from Apex Supplies. We changed banks after the audit. Please send today's payment to the new account I just texted. The invoice number is the same, so finance will approve it later.",
      "speaker": "Claimed vendor account manager",
      "context": "The vendor name is familiar, but the payment instruction arrives as a voice message outside the procurement portal."
    },
    "indicators": [
      "Requests payment to a new bank account outside the procurement workflow",
      "Uses a familiar vendor identity to lower suspicion",
      "Asks for payment before finance approval",
      "Relies on voice context instead of a verified written change request"
    ],
    "explanation": "This is fake. Familiar vendor details make it tricky, but the new bank account and request to bypass finance approval are strong fraud indicators.",
    "tags": [
      "audio",
      "tricky",
      "vendor_fraud",
      "payment_redirection"
    ]
  },
  {
    "dataset_key": "audio_hr_genuine_001",
    "scenario_type": "audio",
    "label": "genuine",
    "title": "Genuine HR Voice Reminder",
    "difficulty": 3,
    "source": "managed_dataset:synthetic_audio",
    "content": {
      "asset_kind": "audio_wav",
      "suspicious": false,
      "duration_seconds": 3,
      "transcript": "Hi, this is HR. Your benefits review window opens Monday. Please open the employee portal from your usual bookmark and review your choices. We will not ask for your password or one-time code.",
      "speaker": "HR benefits team",
      "context": "The reminder matches the published benefits review schedule."
    },
    "indicators": [
      "Directs the user to the usual employee portal",
      "Does not include a link or request secrets",
      "Matches a scheduled benefits review window",
      "Explicitly avoids password or one-time code collection"
    ],
    "explanation": "This is genuine because it points to a known portal, matches expected timing, and avoids sensitive collection.",
    "tags": [
      "audio",
      "hr",
      "genuine",
      "scheduled_notice"
    ]
  },
  {
    "dataset_key": "video_deepfake_fake_001",
    "scenario_type": "video",
    "label": "fake",
    "title": "Leadership Announcement Clip",
    "difficulty": 4,
    "source": "managed_dataset:synthetic_video",
    "content": {
      "asset_kind": "video_poster",
      "suspicious": true,
      "headline": "Urgent Budget Transfer Clip",
      "detail": "The preview has frame jumps around the mouth and mismatched lighting.",
      "transcript": "Approve the transfer today. Do not wait for the finance review.",
      "observations": [
        "Mouth shape lags behind audio",
        "Lighting changes around the jawline",
        "Request bypasses finance review"
      ]
    },
    "indicators": [
      "Lip movement and spoken words are out of sync",
      "Lighting around the face is inconsistent",
      "The clip asks viewers to bypass normal approval",
      "There is no trusted source or full meeting context"
    ],
    "explanation": "This video is fake because media artifacts align with a high-risk request to skip financial controls.",
    "tags": [
      "video",
      "deepfake",
      "approval_bypass",
      "executive_impersonation"
    ]
  },
  {
    "dataset_key": "video_training_genuine_001",
    "scenario_type": "video",
    "label": "genuine",
    "title": "Recorded Security Briefing",
    "difficulty": 2,
    "source": "managed_dataset:synthetic_video",
    "content": {
      "asset_kind": "video_poster",
      "suspicious": false,
      "headline": "Security Briefing Replay",
      "detail": "The replay is hosted in the internal learning portal with normal framing.",
      "transcript": "Please complete the quarterly training module in the learning portal by Friday.",
      "observations": [
        "Stable lighting",
        "No sensitive request",
        "Matches scheduled training"
      ]
    },
    "indicators": [
      "The training was expected",
      "The content asks for normal learning portal activity",
      "No secret, transfer, or unusual payment is requested",
      "Visual quality is consistent across the clip"
    ],
    "explanation": "This is genuine because it is a routine training reminder with consistent media and no risky action.",
    "tags": [
      "video",
      "training",
      "genuine",
      "internal_notice"
    ]
  },
  {
    "dataset_key": "qr_parking_fake_001",
    "scenario_type": "qr_code",
    "label": "fake",
    "title": "Parking Payment QR Sticker",
    "difficulty": 3,
    "source": "managed_dataset:synthetic_qr",
    "content": {
      "asset_kind": "qr_svg",
      "suspicious": true,
      "destination_url": "park-pay-fast.example",
      "placement": "Sticker placed over the official meter label",
      "preview_text": "Pay parking fine now"
    },
    "indicators": [
      "The QR sticker is placed over an official label",
      "The destination domain is not the city parking domain",
      "The payment language creates urgency",
      "There is no visible official verification mark"
    ],
    "explanation": "This QR code is fake because the placement and destination suggest a tampered payment flow.",
    "tags": [
      "qr_code",
      "quishing",
      "payment_fraud",
      "lookalike_domain"
    ]
  },
  {
    "dataset_key": "qr_event_genuine_001",
    "scenario_type": "qr_code",
    "label": "genuine",
    "title": "Conference Check-in QR",
    "difficulty": 1,
    "source": "managed_dataset:synthetic_qr",
    "content": {
      "asset_kind": "qr_svg",
      "suspicious": false,
      "destination_url": "events.example/checkin",
      "placement": "Printed on the attendee badge",
      "preview_text": "Open conference check-in"
    },
    "indicators": [
      "The QR code appears in an expected event context",
      "The destination matches the event domain",
      "It opens check-in rather than a payment or login demand",
      "The printed badge context supports authenticity"
    ],
    "explanation": "This QR code is genuine because the destination and placement match the expected event check-in workflow.",
    "tags": [
      "qr_code",
      "event",
      "genuine",
      "context_match"
    ]
  },
  {
    "dataset_key": "website_bank_fake_001",
    "scenario_type": "website",
    "label": "fake",
    "title": "Bank Alert Landing Page",
    "difficulty": 4,
    "source": "managed_dataset:synthetic_website",
    "content": {
      "asset_kind": "website_html",
      "suspicious": true,
      "brand": "Northbank Security",
      "display_domain": "northbank-verify.example",
      "call_to_action": "Unlock account",
      "body": "Your account is suspended. Enter your credentials now to prevent closure."
    },
    "indicators": [
      "The domain is a lookalike verification domain",
      "The page asks for credentials under threat of closure",
      "The page uses urgency instead of a normal login workflow",
      "There is no independent account navigation path"
    ],
    "explanation": "The website is fake because it harvests credentials through a lookalike domain and high-pressure account threat.",
    "tags": [
      "website",
      "phishing",
      "credential_theft",
      "lookalike_domain"
    ]
  },
  {
    "dataset_key": "website_store_genuine_001",
    "scenario_type": "website",
    "label": "genuine",
    "title": "Store Account Settings Page",
    "difficulty": 2,
    "source": "managed_dataset:synthetic_website",
    "content": {
      "asset_kind": "website_html",
      "suspicious": false,
      "brand": "North Trail Store",
      "display_domain": "store.example",
      "call_to_action": "Review settings",
      "body": "Manage your notification preferences and shipping addresses from your account settings."
    },
    "indicators": [
      "The domain matches the expected store domain",
      "The page describes normal account settings",
      "No urgent threat or unusual payment request appears",
      "The action is limited to reviewing preferences"
    ],
    "explanation": "This website is genuine because it uses an expected domain and normal account settings language.",
    "tags": [
      "website",
      "account_settings",
      "genuine",
      "low_pressure"
    ]
  },
  {
    "dataset_key": "image_profile_deepfake_face_001",
    "scenario_type": "image",
    "label": "fake",
    "title": "Executive Directory Photo",
    "difficulty": 4,
    "source": "managed_dataset:synthetic_face_deepfake",
    "content": {
      "asset_kind": "svg_image",
      "template": "profile",
      "suspicious": true,
      "headline": "Finance Manager Profile Update",
      "subhead": "New employee record",
      "detail": "Profile photo shows anomalies: asymmetrical glasses frames, warped background lines near the ear, and double-lobed ear structures.",
      "alt": "AI-generated headshot with alignment errors"
    },
    "indicators": [
      "Left and right earrings are completely asymmetrical in shape and color",
      "Background patterns warp and curve near the borders of the hair",
      "The glasses frame merges unnaturally into the temple on one side",
      "The pupils show non-circular shapes and asymmetrical reflection points"
    ],
    "explanation": "This is a face morphing/deepfake image. While the overall portrait looks realistic, micro-artifacts like asymmetrical accessories, warped background lines, and inconsistent eyewear prove it was AI-generated.",
    "tags": [
      "image",
      "face_morphing",
      "deepfake",
      "profile_impersonation"
    ]
  },
  {
    "dataset_key": "image_profile_genuine_headshot_001",
    "scenario_type": "image",
    "label": "genuine",
    "title": "Staff Verification Headshot",
    "difficulty": 2,
    "source": "managed_dataset:synthetic_face_genuine",
    "content": {
      "asset_kind": "svg_image",
      "template": "profile",
      "suspicious": false,
      "headline": "Verified Security Officer Portrait",
      "subhead": "Official security badge",
      "detail": "The portrait shows high-fidelity natural features, symmetrical jewelry, and consistent light reflection across the face.",
      "alt": "High-resolution verified staff portrait"
    },
    "indicators": [
      "Symmetrical and matching facial accessories",
      "Background is clean with no warping or AI generation artifacts",
      "Light reflections are physically consistent across both eyes",
      "Hair strands and boundaries blend naturally with the background"
    ],
    "explanation": "This is genuine. The portrait has perfect visual consistency, realistic lighting physics, and lacks the structural distortions typical of deepfakes and morphing.",
    "tags": [
      "image",
      "portrait",
      "genuine",
      "verification"
    ]
  },
  {
    "dataset_key": "image_whatsapp_phish_screenshot_001",
    "scenario_type": "image",
    "label": "fake",
    "title": "WhatsApp Vendor Invoice Screenshot",
    "difficulty": 3,
    "source": "managed_dataset:synthetic_screenshot",
    "content": {
      "asset_kind": "svg_image",
      "template": "document",
      "suspicious": true,
      "headline": "Chat Screenshot: Apex Supplies",
      "subhead": "Chat billing instruction",
      "detail": "A screenshot of a WhatsApp thread where a contact claiming to be Apex Supplies sends a billing document via an external file-sharing link: https://apex-supplies-files.example/download-invoice",
      "alt": "Screenshot of WhatsApp chat redirecting to unverified billing link"
    },
    "indicators": [
      "Conducts official billing updates via personal chat rather than official portal",
      "Redirects to an external unverified domain to download a file",
      "Sender has no verified business checkmark in the screenshot",
      "The conversation creates pressure to pay before accounting closes"
    ],
    "explanation": "This is fake. Moving procurement and payment details to an unverified WhatsApp chat with external links is a strong indicator of invoice fraud via impersonation.",
    "tags": [
      "image",
      "screenshot",
      "whatsapp",
      "invoice_fraud",
      "phishing"
    ]
  },
  {
    "dataset_key": "image_email_phish_screenshot_001",
    "scenario_type": "image",
    "label": "fake",
    "title": "IT Security Alert Email Screenshot",
    "difficulty": 3,
    "source": "managed_dataset:synthetic_screenshot",
    "content": {
      "asset_kind": "svg_image",
      "template": "document",
      "suspicious": true,
      "headline": "Alert: Security Credential Update",
      "subhead": "Urgent system migration notice",
      "detail": "A screenshot of an email claiming your Microsoft SSO keys must be verified within 2 hours. It provides a login link pointing to https://microsoft-security-auth.example/login",
      "alt": "Screenshot of an email phishing scam targeting Microsoft login credentials"
    },
    "indicators": [
      "Sender email address domain does not match official company domain",
      "Creates artificial urgency with a 2-hour deadline",
      "Directs the user to a lookalike external verification domain",
      "Asks for sensitive SSO login credentials to prevent account suspension"
    ],
    "explanation": "This is fake. Official security migrations do not use high-pressure suspension threats, and the verification link uses a lookalike domain instead of the company's SSO portal.",
    "tags": [
      "image",
      "screenshot",
      "email_phishing",
      "credential_theft"
    ]
  },
  {
    "dataset_key": "image_profile_deepfake_face_002",
    "scenario_type": "image",
    "label": "fake",
    "title": "Contractor Verification Photo",
    "difficulty": 4,
    "source": "managed_dataset:face_morph",
    "content": {
      "asset_kind": "svg_image",
      "template": "profile",
      "suspicious": true,
      "headline": "Contractor Directory Submission",
      "subhead": "Profile image security check",
      "detail": "Noticeable face morphing artifacts: left eye pupil is oval while the right eye pupil is round, iris colors differ slightly, and shirt collar is asymmetrical.",
      "alt": "AI-generated profile headshot showing mismatched iris colors and pupil shapes"
    },
    "indicators": [
      "Mismatch in iris color and pupil shape between left and right eyes",
      "The neckline of the clothing merges weirdly with the background shadow",
      "Ear details are blurry and asymmetrical",
      "Foliage in the background contains floating, non-physical shapes"
    ],
    "explanation": "This profile photo is fake due to classic generative AI errors, including mismatched pupil geometry, uneven collar rendering, and unnatural background elements.",
    "tags": [
      "image",
      "face_morphing",
      "deepfake",
      "profile_verification"
    ]
  },
  {
    "dataset_key": "image_profile_genuine_headshot_002",
    "scenario_type": "image",
    "label": "genuine",
    "title": "Consultant Profile Photo",
    "difficulty": 2,
    "source": "managed_dataset:face_genuine",
    "content": {
      "asset_kind": "svg_image",
      "template": "profile",
      "suspicious": false,
      "headline": "Security Access Photo",
      "subhead": "Verified contractor badge",
      "detail": "A professional photograph with consistent depth of field, clear skin texture, matching earrings, and realistic reflections.",
      "alt": "High-resolution real photograph of a consultant for security badge"
    },
    "indicators": [
      "Light reflections in both eyes are in the same relative position",
      "Symmetrical jewelry and realistic textile details on clothing",
      "Clean, natural blur transition around hair strands",
      "Physical details like skin texture and glasses frames are structurally perfect"
    ],
    "explanation": "This photo is genuine. It shows realistic lighting physics, precise symmetry of facial features, and lacks structural morphing artifacts.",
    "tags": [
      "image",
      "portrait",
      "genuine",
      "verification"
    ]
  },
  {
    "dataset_key": "image_profile_deepfake_face_003",
    "scenario_type": "image",
    "label": "fake",
    "title": "External Partner Profile Photo",
    "difficulty": 4,
    "source": "managed_dataset:face_morph",
    "content": {
      "asset_kind": "svg_image",
      "template": "profile",
      "suspicious": true,
      "headline": "Supplier Portal Registration",
      "subhead": "Vendor identity picture",
      "detail": "The image contains severe morphing artifacts: background wall lines bend unnaturally around the hair, and one glasses frame lens is shaped differently than the other.",
      "alt": "Vendor profile image showing warped background lines and asymmetric glasses frames"
    },
    "indicators": [
      "Warped and bent background architectural lines near the hair outline",
      "Inconsistent lens shapes and misaligned glasses frames",
      "Double eyelid creases that merge and disappear abruptly",
      "Asymmetrical light reflection source in the pupils"
    ],
    "explanation": "This photo is fake because of morphing and alignment issues. Background warping and uneven glasses frame physics are clear indicators of AI face generation.",
    "tags": [
      "image",
      "face_morphing",
      "deepfake",
      "vendor_identity"
    ]
  },
  {
    "dataset_key": "image_whatsapp_job_scam_001",
    "scenario_type": "image",
    "label": "fake",
    "title": "WhatsApp Easy Income Offer",
    "difficulty": 3,
    "source": "managed_dataset:whatsapp_chat_screenshot",
    "content": {
      "asset_kind": "svg_image",
      "template": "document",
      "suspicious": true,
      "headline": "Chat Screenshot: Global Recruiting",
      "subhead": "Unsolicited work-from-home chat",
      "detail": "A chat log screenshot offering Rs. 5,000 for reviewing hotels online, demanding payment details up front.",
      "alt": "Screenshot of a WhatsApp chat window offering high pay for hotel reviews"
    },
    "indicators": [
      "Unsolicited contact from a business name using a generic logo",
      "Offers high daily wages for trivial tasks like clicking buttons",
      "Requests bank details before sharing onboarding materials",
      "Sender's country code does not match the company's claimed headquarters"
    ],
    "explanation": "This WhatsApp thread screenshot is fake because it represents a recruitment scam that uses easy tasks to harvest payment credentials.",
    "tags": [
      "image",
      "screenshot",
      "whatsapp",
      "job_scam",
      "recruitment_fraud"
    ]
  },
  {
    "dataset_key": "image_whatsapp_family_emergency_001",
    "scenario_type": "image",
    "label": "fake",
    "title": "WhatsApp Emergency Request",
    "difficulty": 3,
    "source": "managed_dataset:whatsapp_chat_screenshot",
    "content": {
      "asset_kind": "svg_image",
      "template": "document",
      "suspicious": true,
      "headline": "Chat Screenshot: Family Emergency",
      "subhead": "Impersonation chat thread",
      "detail": "A screenshot showing a chat from an unknown number claiming to be a child who lost their phone, requesting an urgent UPI money transfer.",
      "alt": "Screenshot of a WhatsApp chat asking for urgent funds due to a broken phone"
    },
    "indicators": [
      "Claims device loss to justify the unknown phone number",
      "Creates high emotional pressure and demands immediate UPI payment",
      "Refuses direct phone calls due to 'broken microphone'",
      "Provides an external payment address unconnected to family accounts"
    ],
    "explanation": "This is fake. It matches the family impersonation scam template designed to bypass verification and steal funds via UPI.",
    "tags": [
      "image",
      "screenshot",
      "whatsapp",
      "impersonation",
      "payment_fraud"
    ]
  },
  {
    "dataset_key": "image_whatsapp_team_colleague_001",
    "scenario_type": "image",
    "label": "genuine",
    "title": "WhatsApp Internal Team Standup",
    "difficulty": 2,
    "source": "managed_dataset:whatsapp_chat_screenshot",
    "content": {
      "asset_kind": "svg_image",
      "template": "document",
      "suspicious": false,
      "headline": "Chat Screenshot: Operations Standup",
      "subhead": "Routine team check-in",
      "detail": "A screenshot of an internal team group chat discussing status updates. No links or payment requests are present.",
      "alt": "Screenshot of a casual operations team WhatsApp chat"
    },
    "indicators": [
      "Familiar team members talking about known projects",
      "Asks for no payments, passwords, or login links",
      "Fits regular team schedule and communication style",
      "Conversational context contains specific references to internal work"
    ],
    "explanation": "This is a genuine screenshot. The discussion is routine, references known internal project details, and requests no sensitive actions.",
    "tags": [
      "image",
      "screenshot",
      "whatsapp",
      "team_chat",
      "genuine"
    ]
  },
  {
    "dataset_key": "image_email_shared_doc_001",
    "scenario_type": "image",
    "label": "fake",
    "title": "Shared Document Login Phish",
    "difficulty": 4,
    "source": "managed_dataset:email_screenshot",
    "content": {
      "asset_kind": "svg_image",
      "template": "document",
      "suspicious": true,
      "headline": "Email Screenshot: Document Share",
      "subhead": "Microsoft OneDrive fake sharing mail",
      "detail": "A screenshot of an email claiming a HR document has been shared. It has a login link pointing to https://onedrive-company-hr-portal.example/login",
      "alt": "Screenshot of a fake OneDrive email document sharing notification"
    },
    "indicators": [
      "The link points to a non-standard lookalike OneDrive domain",
      "Sender's email address is from a public email provider, not company domain",
      "Demands login credentials to view a standard PDF",
      "Uses urgency to push the user to click the link"
    ],
    "explanation": "This is fake. OneDrive sharing notices do not require logging in on lookalike external domains to view files.",
    "tags": [
      "image",
      "screenshot",
      "email_phishing",
      "credential_theft"
    ]
  },
  {
    "dataset_key": "image_email_tax_refund_001",
    "scenario_type": "image",
    "label": "fake",
    "title": "Tax Refund Portal Link",
    "difficulty": 3,
    "source": "managed_dataset:email_screenshot",
    "content": {
      "asset_kind": "svg_image",
      "template": "document",
      "suspicious": true,
      "headline": "Email Screenshot: Tax Refund Alert",
      "subhead": "Government portal impersonation",
      "detail": "A screenshot of an email claiming you have an outstanding tax refund. The portal link is http://gov-tax-income-refund.example/portal",
      "alt": "Screenshot of a fake government email offering tax refunds"
    },
    "indicators": [
      "Unsolicited notification of unexpected financial windfall",
      "Link uses a generic HTTP address instead of a secure government portal",
      "Sender address uses a lookalike domain name",
      "Requests credit card details to process the refund"
    ],
    "explanation": "This is fake. Tax authorities do not notify citizens of refunds via lookalike domains or request banking details over email links.",
    "tags": [
      "image",
      "screenshot",
      "email_phishing",
      "payment_fraud"
    ]
  },
  {
    "dataset_key": "image_email_it_guidelines_001",
    "scenario_type": "image",
    "label": "genuine",
    "title": "IT Security Best Practices",
    "difficulty": 2,
    "source": "managed_dataset:email_screenshot",
    "content": {
      "asset_kind": "svg_image",
      "template": "document",
      "suspicious": false,
      "headline": "Email Screenshot: IT Guidelines",
      "subhead": "Quarterly security reminder",
      "detail": "A screenshot of an official IT email outline. It reminds employees to change their password via the official intranet, explicitly advising not to click on email links.",
      "alt": "Screenshot of a genuine security advisory email from IT"
    },
    "indicators": [
      "Directs employees to access the intranet via their own saved bookmarks",
      "Contains no links or attachments",
      "Uses the official internal company domain",
      "Asks for no credentials or sensitive verification data"
    ],
    "explanation": "This is genuine. It provides safety information and directs employees to verify and update their credentials independently.",
    "tags": [
      "image",
      "screenshot",
      "email",
      "it_services",
      "genuine"
    ]
  },
  {
    "dataset_key": "image_invoice_modified_total_001",
    "scenario_type": "image",
    "label": "fake",
    "title": "Tampered Invoice Scan",
    "difficulty": 4,
    "source": "managed_dataset:invoice_screenshot",
    "content": {
      "asset_kind": "svg_image",
      "template": "document",
      "suspicious": true,
      "headline": "Invoice Scan: Operations Equipment",
      "subhead": "Digitized receipt review",
      "detail": "A scanned invoice screenshot where the payment total font, size, and alignment are inconsistent with the rest of the text, showing signs of digital manipulation.",
      "alt": "Scanned invoice with visible font edits on the payment total line"
    },
    "indicators": [
      "Inconsistent font type and size on the payment amount field",
      "Artifact halos around the numbers, suggesting copy-paste or edit",
      "Line alignment of the total is skewed compared to other columns",
      "The VAT calculations do not mathematically match the edited total"
    ],
    "explanation": "This is a fake image. The payment amount field has been digitally modified, creating font, alignment, and calculation inconsistencies.",
    "tags": [
      "image",
      "document_tampering",
      "invoice_fraud",
      "fake_receipt"
    ]
  },
  {
    "dataset_key": "image_document_certification_001",
    "scenario_type": "image",
    "label": "genuine",
    "title": "Business Incorporation Certificate",
    "difficulty": 2,
    "source": "managed_dataset:document_scan",
    "content": {
      "asset_kind": "svg_image",
      "template": "document",
      "suspicious": false,
      "headline": "Certificate of Incorporation",
      "subhead": "Verified corporate registration document",
      "detail": "A scanned official business certificate showing matching corporate stamps, aligned text, and consistent paper texture.",
      "alt": "High-resolution scan of a business incorporation certificate"
    },
    "indicators": [
      "Stamps are aligned and show natural ink bleed matching paper texture",
      "Typography and lines are consistent and sharp without modification artifacts",
      "Corporate details can be cross-referenced with public registry",
      "No signs of patch edits or inconsistent font replacements"
    ],
    "explanation": "This is genuine. The document is structurally consistent, has authentic security marks, and shows no digital modification halos.",
    "tags": [
      "image",
      "document",
      "certification",
      "genuine"
    ]
  }
];
