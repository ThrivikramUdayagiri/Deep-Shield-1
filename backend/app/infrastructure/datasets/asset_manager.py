from __future__ import annotations

import math
import struct
import wave
from pathlib import Path
from typing import Any


class DatasetAssetManager:
    def __init__(self, static_root: Path):
        self.static_root = static_root
        self.dataset_root = static_root / "datasets"

    def ensure_assets(self, *, scenario_type: str, dataset_key: str, content: dict[str, Any]) -> dict[str, Any]:
        content = dict(content)
        kind = content.get("asset_kind")
        if kind == "svg_image":
            path = self.dataset_root / "images" / f"{dataset_key}.svg"
            self._write_if_missing(path, self._image_svg(content))
            content["asset_url"] = self._url(path)
        elif kind == "qr_svg":
            path = self.dataset_root / "qr" / f"{dataset_key}.svg"
            self._write_if_missing(path, self._qr_svg(content))
            content["asset_url"] = self._url(path)
        elif kind == "audio_wav":
            path = self.dataset_root / "audio" / f"{dataset_key}.wav"
            if not path.exists():
                self._write_audio(path, content)
            content["asset_url"] = self._url(path)
        elif kind == "video_poster":
            path = self.dataset_root / "video" / f"{dataset_key}.svg"
            self._write_if_missing(path, self._video_poster_svg(content))
            content["poster_url"] = self._url(path)
        elif kind == "website_html":
            path = self.dataset_root / "websites" / f"{dataset_key}.html"
            self._write_if_missing(path, self._website_html(content))
            content["asset_url"] = self._url(path)
        return content

    def _url(self, path: Path) -> str:
        relative = path.relative_to(self.static_root)
        return "/static/" + "/".join(relative.parts)

    def _write_if_missing(self, path: Path, text: str) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        if not path.exists():
            path.write_text(text, encoding="utf-8")

    def _image_svg(self, content: dict[str, Any]) -> str:
        template = content.get("template", "document")
        suspicious = content.get("suspicious", False)
        accent = "#ef4444" if suspicious else "#14b8a6"
        muted = "#fee2e2" if suspicious else "#ccfbf1"
        headline = content.get("headline", "Digital document")
        subhead = content.get("subhead", "Verification sample")
        detail = content.get("detail", "Check alignment, dates, domains, and visual consistency.")
        stamp = "REVIEW" if suspicious else "VERIFIED"
        if template == "profile":
            body = """
            <circle cx="120" cy="132" r="48" fill="#cbd5e1"/>
            <rect x="190" y="88" width="280" height="20" rx="5" fill="#0f172a"/>
            <rect x="190" y="126" width="210" height="16" rx="4" fill="#64748b"/>
            <rect x="190" y="158" width="250" height="16" rx="4" fill="#94a3b8"/>
            <rect x="70" y="232" width="420" height="52" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
            """
        else:
            body = """
            <rect x="74" y="92" width="372" height="230" rx="10" fill="#ffffff" stroke="#cbd5e1"/>
            <rect x="104" y="132" width="170" height="18" rx="4" fill="#0f172a"/>
            <rect x="104" y="172" width="286" height="12" rx="3" fill="#94a3b8"/>
            <rect x="104" y="202" width="246" height="12" rx="3" fill="#94a3b8"/>
            <rect x="104" y="232" width="300" height="12" rx="3" fill="#94a3b8"/>
            <rect x="104" y="274" width="126" height="22" rx="5" fill="#e2e8f0"/>
            """
        return f"""<svg xmlns="http://www.w3.org/2000/svg" width="560" height="380" viewBox="0 0 560 380" role="img" aria-label="{headline}">
  <rect width="560" height="380" fill="#f8fafc"/>
  <rect x="24" y="24" width="512" height="332" rx="18" fill="{muted}" stroke="#cbd5e1"/>
  <text x="54" y="62" font-family="Inter, Arial" font-size="22" font-weight="700" fill="#0f172a">{headline}</text>
  <text x="54" y="88" font-family="Inter, Arial" font-size="13" fill="#475569">{subhead}</text>
  {body}
  <rect x="360" y="278" width="118" height="36" rx="8" fill="{accent}"/>
  <text x="419" y="302" text-anchor="middle" font-family="Inter, Arial" font-size="14" font-weight="700" fill="#ffffff">{stamp}</text>
  <text x="54" y="342" font-family="Inter, Arial" font-size="12" fill="#475569">{detail}</text>
</svg>"""

    def _qr_svg(self, content: dict[str, Any]) -> str:
        target = content.get("destination_url", "https://example.com")
        suspicious = content.get("suspicious", False)
        squares = [
            (0, 0),
            (1, 0),
            (2, 0),
            (0, 1),
            (2, 1),
            (0, 2),
            (1, 2),
            (2, 2),
            (6, 0),
            (7, 0),
            (8, 0),
            (6, 1),
            (8, 1),
            (6, 2),
            (7, 2),
            (8, 2),
            (0, 6),
            (1, 6),
            (2, 6),
            (0, 7),
            (2, 7),
            (0, 8),
            (1, 8),
            (2, 8),
            (4, 4),
            (5, 5),
            (7, 4),
            (3, 7),
            (5, 8),
            (8, 6),
        ]
        if suspicious:
            squares += [(4, 1), (5, 2), (3, 3), (6, 6), (7, 8)]
        else:
            squares += [(5, 1), (4, 2), (6, 4), (3, 5), (7, 7)]
        cells = "\n".join(
            f'<rect x="{60 + x * 24}" y="{58 + y * 24}" width="20" height="20" rx="2" fill="#0f172a"/>'
            for x, y in squares
        )
        badge = "#ef4444" if suspicious else "#14b8a6"
        return f"""<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360" role="img" aria-label="QR code scenario">
  <rect width="360" height="360" fill="#ffffff"/>
  <rect x="42" y="40" width="276" height="276" rx="16" fill="#f8fafc" stroke="#cbd5e1"/>
  {cells}
  <rect x="56" y="324" width="248" height="24" rx="6" fill="{badge}"/>
  <text x="180" y="341" text-anchor="middle" font-family="Inter, Arial" font-size="11" font-weight="700" fill="#ffffff">{target}</text>
</svg>"""

    def _write_audio(self, path: Path, content: dict[str, Any]) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        sample_rate = 16000
        duration = float(content.get("duration_seconds", 2.5))
        suspicious = bool(content.get("suspicious", False))
        frequencies = [440, 660, 530] if suspicious else [392, 494, 588]
        total_samples = int(sample_rate * duration)
        with wave.open(str(path), "w") as audio:
            audio.setnchannels(1)
            audio.setsampwidth(2)
            audio.setframerate(sample_rate)
            for index in range(total_samples):
                freq = frequencies[(index // (sample_rate // 2)) % len(frequencies)]
                amplitude = 0.22 * math.sin(2 * math.pi * freq * index / sample_rate)
                audio.writeframes(struct.pack("<h", int(amplitude * 32767)))

    def _video_poster_svg(self, content: dict[str, Any]) -> str:
        suspicious = content.get("suspicious", False)
        accent = "#ef4444" if suspicious else "#22c55e"
        title = content.get("headline", "Video clip")
        detail = content.get("detail", "Review lighting, lip sync, edits, and source context.")
        return f"""<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" role="img" aria-label="{title}">
  <rect width="640" height="360" fill="#111827"/>
  <rect x="42" y="38" width="556" height="284" rx="18" fill="#1f2937" stroke="#475569"/>
  <circle cx="210" cy="168" r="72" fill="#334155"/>
  <rect x="312" y="104" width="188" height="18" rx="5" fill="#cbd5e1"/>
  <rect x="312" y="142" width="232" height="12" rx="4" fill="#94a3b8"/>
  <rect x="312" y="172" width="204" height="12" rx="4" fill="#94a3b8"/>
  <polygon points="224,168 190,145 190,191" fill="{accent}"/>
  <rect x="86" y="278" width="468" height="8" rx="4" fill="#475569"/>
  <rect x="86" y="278" width="{290 if suspicious else 180}" height="8" rx="4" fill="{accent}"/>
  <text x="54" y="70" font-family="Inter, Arial" font-size="18" font-weight="700" fill="#f8fafc">{title}</text>
  <text x="54" y="334" font-family="Inter, Arial" font-size="12" fill="#cbd5e1">{detail}</text>
</svg>"""

    def _website_html(self, content: dict[str, Any]) -> str:
        suspicious = content.get("suspicious", False)
        brand = content.get("brand", "Account Portal")
        domain = content.get("display_domain", "example.com")
        call_to_action = content.get("call_to_action", "Continue")
        accent = "#dc2626" if suspicious else "#0f766e"
        warning = "Secure your account in 10 minutes" if suspicious else "Review your account settings"
        return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{brand}</title>
  <style>
    body {{ margin:0; font-family: Inter, Arial, sans-serif; color:#0f172a; background:#f8fafc; }}
    header {{ display:flex; justify-content:space-between; align-items:center; padding:18px 28px; background:white; border-bottom:1px solid #e2e8f0; }}
    main {{ max-width:760px; margin:34px auto; background:white; border:1px solid #e2e8f0; padding:28px; border-radius:14px; }}
    .domain {{ font-size:12px; color:#64748b; }}
    button {{ background:{accent}; color:white; border:0; border-radius:8px; padding:12px 18px; font-weight:700; }}
    input {{ display:block; width:100%; box-sizing:border-box; margin:12px 0; padding:12px; border:1px solid #cbd5e1; border-radius:8px; }}
  </style>
</head>
<body>
  <header><strong>{brand}</strong><span class="domain">{domain}</span></header>
  <main>
    <h1>{warning}</h1>
    <p>{content.get("body", "Use this page to review the trust indicators in a realistic website capture.")}</p>
    <input placeholder="Email address" />
    <input placeholder="Password" type="password" />
    <button>{call_to_action}</button>
  </main>
</body>
</html>"""
