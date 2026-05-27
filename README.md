# SpeedReader

<div align="center">

```
███████╗██████╗ ███████╗███████╗██████╗ ██████╗ ███████╗ █████╗ ██████╗ ███████╗██████╗
██╔════╝██╔══██╗██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗
███████╗██████╔╝█████╗  █████╗  ██║  ██║██████╔╝█████╗  ███████║██║  ██║█████╗  ██████╔╝
╚════██║██╔═══╝ ██╔══╝  ██╔══╝  ██║  ██║██╔══██╗██╔══╝  ██╔══██║██║  ██║██╔══╝  ██╔══██╗
███████║██║     ███████╗███████╗██████╔╝██║  ██║███████╗██║  ██║██████╔╝███████╗██║  ██║
╚══════╝╚═╝     ╚══════╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝
```

**RSVP Speed Reading — Calibrated to Your Brain**

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6_Modules-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)](package.json)
[![Bilingual](https://img.shields.io/badge/lang-DE%20%7C%20EN-blue)](js/data.js)

</div>

---

## What is SpeedReader?

SpeedReader uses **RSVP (Rapid Serial Visual Presentation)** — the same technique behind apps like Spritz — to let you read text dramatically faster than normal. Instead of moving your eyes across a page, words flash one at a time at a fixed point on screen. Your eyes never move. Your brain just reads.

The key insight: every word has an **Optimal Recognition Point (ORP)** — roughly the letter 30% into the word — where your brain locks onto the whole word fastest. SpeedReader always centers that letter at the same screen position, highlighted in red. You stare at one spot. Words pour in.

**Unlike other RSVP apps**, SpeedReader runs a **multi-stage calibration game** to find the exact WPM your brain can handle — not a random guess, not a generic default.

---

## How it Looks

```
                    ┌──────────────────────────────────────────┐
                    │                                          │
                    │          stre  i  fen                    │
                    │                ↑                         │
                    │           always here                    │
                    │                                          │
                    └──────────────────────────────────────────┘
```

The ORP letter (red) is always anchored to the exact same horizontal pixel. Every word — short or long — snaps to that anchor. Zero eye movement. Maximum reading speed.

---

## Features

| Feature | Details |
|---|---|
| **ORP Display** | Red anchor letter, fixed position via monospace + CSS `ch` units |
| **rAF Timing** | Drift-free `requestAnimationFrame` accumulator, works at 60/120/144 Hz |
| **Punctuation Delays** | Sentence end ×2.2, comma ×1.6, em-dash ×1.3 |
| **Multi-Stage Calibration** | 4-stage game: Demo → Baseline → Speed Ramp → Confirmation |
| **Free Recall Scoring** | Type what you read; Levenshtein fuzzy matching scores comprehension |
| **90 Passages** | 15 easy + 15 medium + 10 hard + 5 long per language (DE + EN) |
| **Profile System** | Download/import JSON profile; persists in localStorage |
| **Bilingual** | Full DE / EN UI + separate passage libraries |
| **systemd Service** | Runs as a hardened system service on port 7070 |
| **Auto-Update Checker** | In-app banner when a new version is available |
| **One-Script Install** | Works on apt, dnf, yum, pacman, apk, zypper |

---

## Calibration Game

The calibration game finds your brain's actual reading limit in ~6 minutes:

```
Stage 0 — Demo
  └─ Watch 10 words at 150 WPM. Learn the ORP concept. No test.

Stage 1 — Baseline (~2 min)
  └─ Read passages at 150 → 200 → 250 → 300 WPM
  └─ After each: type what you remember (free recall)
  └─ Score ≥ 60%? → Move up. Score < 60%? → Baseline locked.
  └─ Output: baselineWpm

Stage 2 — Speed Ramp (~2–3 min)
  └─ Start at baselineWpm + 50
  └─ Every passage: +25 WPM
  └─ Two consecutive fails → stop
  └─ Caps at 1000 WPM
  └─ Output: maxWpm

Stage 3 — Sweet Spot (~1 min)
  └─ Test at maxWpm × 0.80
  └─ Longer passage, stricter score threshold
  └─ Auto-retries at 0.65× if needed
  └─ Output: recommendedWpm

Stage 4 — Results
  └─ Bar chart: Baseline | Max | Recommended
  └─ Download profile as .json
```

The scoring engine uses **keyword overlap with Levenshtein distance ≤ 1**, so a typo like `"Brasilen"` still matches `"brasilien"`. Minimum 3 keywords per passage, threshold 60 % for baseline, 35 % for ramp.

---

## Quick Start

### Option A: systemd Install (Recommended for servers/always-on)

```bash
curl -sSL https://raw.githubusercontent.com/elias02345/SpeedReader/main/install.sh | sudo bash
```

Then open **http://localhost:7070** in your browser.

**What the installer does:**
1. Detects your package manager and installs `git`, `python3`, `curl` if missing
2. Clones this repo to `/opt/speedreader`
3. Creates a locked-down `speedreader` system user
4. Registers and starts a hardened `systemd` service
5. Installs `/usr/local/bin/speedreader-update`

### Option B: Local Dev (no install needed)

```bash
git clone https://github.com/elias02345/SpeedReader.git
cd SpeedReader
python3 -m http.server 7070
# → open http://localhost:7070
```

No build step, no npm, no bundler. Pure HTML + CSS + ES6 modules.

---

## Service Management

```bash
# Status
systemctl status speedreader

# Logs (live)
journalctl -u speedreader -f

# Stop / Start / Restart
systemctl stop    speedreader
systemctl start   speedreader
systemctl restart speedreader

# Update to latest version
sudo speedreader-update

# Remove completely
sudo /opt/speedreader/uninstall.sh
```

---

## Profile JSON

After calibration you can download your profile:

```json
{
  "version": 1,
  "lang": "de",
  "createdAt": "2026-05-27",
  "screenHz": 144,
  "baselineWpm": 250,
  "maxWpm": 575,
  "recommendedWpm": 450,
  "calibrationScore": 0.74,
  "punctuationDelays": true
}
```

Import it on any device to skip calibration and start reading at your exact speed.

---

## File Structure

```
SpeedReader/
├── index.html          # SPA shell — 10 views as hidden <section> tags
├── style.css           # Dark theme: #000 bg, #fff text, #e53e3e ORP accent
├── install.sh          # One-script installer (systemd + service user + update cmd)
├── js/
│   ├── orp.js          # ORP index table, word splitter, Levenshtein, recall scorer
│   ├── reader.js       # RSVPReader class — rAF accumulator timing engine
│   ├── calibration.js  # 4-stage calibration state machine
│   ├── data.js         # 90 calibration passages (DE + EN)
│   ├── profile.js      # JSON profile: create, save, load, download, import
│   └── app.js          # SPA controller: routing, i18n, events, update checker
└── .gitignore
```

---

## ORP Algorithm

```js
// Table maps letter count → ORP index (0-based)
const ORP_TABLE = [0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4];

function getORPIndex(word) {
  const letters = word.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').length;
  return ORP_TABLE[Math.min(letters, ORP_TABLE.length - 1)];
}
```

The CSS that locks the ORP letter to a fixed screen position:

```css
.word-display  { position: relative; font-family: 'Courier New', monospace; }
.word-left     { position: absolute; right: calc(50% + 0.5ch); text-align: right; }
.word-orp      { position: absolute; left: calc(50% - 0.5ch); width: 1ch; color: #e53e3e; }
.word-right    { position: absolute; left: calc(50% + 0.5ch); }
```

In a monospace font, `1ch` = exactly one character width. The ORP letter's center always sits at 50% of the container — regardless of word length.

---

## Browser Compatibility

Works in any modern browser (Chrome, Firefox, Safari, Edge). Requires:
- ES6 Modules (`<script type="module">`)
- CSS `position: absolute` with `ch` units
- `requestAnimationFrame`

No polyfills needed. No external fonts or CDN dependencies.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Add passages in `js/data.js` — follow the existing schema with `keywords[]`
4. Open a pull request

To add a new language: add a translation block in `app.js → LANG`, add passages in `data.js` with `lang: 'xx'`, and add a `<button class="lang-btn">` in `index.html`.

---

## License

MIT — do whatever you want, attribution appreciated.

---

<div align="center">

Built with vanilla HTML/CSS/JS · No frameworks · No build tools · No nonsense

</div>
