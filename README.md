# ⚡ CSRF Forge

**Advanced CSRF Proof of Concept Generator & Vulnerability Analyzer**

A modern, high-performance, client-side cybersecurity tool for security engineers, penetration testers, and bug bounty hunters to evaluate Cross-Site Request Forgery (CWE-352 / OWASP Top 10 A01:2021) vulnerabilities, generate verified multi-vector proof-of-concept exploits, and export comprehensive executive reports.

![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-2.1-729B1A?logo=vitest)
![CI](https://github.com/syedrakesh/csrf-forge/actions/workflows/ci.yml/badge.svg)
![Pages](https://github.com/syedrakesh/csrf-forge/actions/workflows/deploy.yml/badge.svg)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌐 Live Application

- **Live URL**: [https://syedrakesh.github.io/csrf-forge/](https://syedrakesh.github.io/csrf-forge/)
- **100% Client-Side**: Operates entirely in the browser. Zero server transmission of your captured HTTP traffic, session cookies, or exploit payloads.

---

## 🔥 Features & Modules

### 1. Unified HTTP & cURL Parser
- **Raw Stream Ingestion**: Parses raw HTTP request streams exported from Burp Suite, OWASP ZAP, Postman, or Browser DevTools.
- **cURL Command Parser**: Accurately tokenizes and extracts methods, URLs, custom headers, cookies (`-b`, `--cookie`), and bodies (`-d`, `--data`, `--data-raw`).
- **Universal Auto-Detector**: Automatically distinguishes raw HTTP streams from shell cURL commands.
- **Built-in Testing Repository**: Pre-loaded real-world vulnerable request templates (Banking wire transfer, Account email update, REST admin escalation, JSON text/plain bypass).

### 2. Heuristic CSRF Analyzer & Risk Scorer
- **Multi-Vector Threat Evaluation**: Evaluates anti-CSRF token presence in headers and bodies, SameSite cookie restrictions (`Strict`/`Lax`/`None`), CORS preflight relaxation risks, and Origin/Referer verification.
- **CVSS 3.1 Aligned Scoring**: Weighted risk engine assigning standard severity tiers (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `SECURE`).
- **Remediation Catalog**: Direct alignment with OWASP prevention standards (Synchronizer Token Pattern, SameSite Cookie Enforcement, Custom Header Preflights, Double Submit Cookies).

### 3. Multi-Vector PoC Exploit Generator
- **HTML Auto-Submit Forms**: Hidden input synthesis with stealth iframe submission targeting.
- **Asynchronous Fetch API**: Modern async client with `credentials: 'include'`.
- **XMLHttpRequest Payloads**: Classic `withCredentials = true` cross-origin vectors.
- **GET Image Beacons**: Zero-interaction `<img>` exploitation payloads for state-changing GET endpoints.
- **JSON Plaintext Form Trick**: Enctype `text/plain` form bypass payloads for lax preflight JSON APIs.
- **Python 3 Regression Scripts**: Standalone automated reproduction scripts using `requests.Session()`.

### 4. Isolated Sandbox & Execution Playground
- **Strict Sandbox Boundary**: Sub-frame execution using `sandbox="allow-scripts allow-forms"`, strictly omitting `allow-same-origin` to ensure the host application cannot be compromised.
- **PostMessage Telemetry**: Real-time action interception logging intercepted form submissions, network requests, and runtime errors into a cyber event log.

### 5. Project Management & Storage
- **Local Persistence**: Save, search, restore, and organize testing sessions with zero external database dependencies.
- **Backup & Migration**: One-click JSON export and import for project transfer and archiving.

### 6. Vulnerability Reporting & Multi-Format Export
- **Executive Markdown Reports**: Formatted audit summaries with CVSS breakdown, findings matrix, and remediation guides.
- **Standalone Client HTML**: Self-contained, zero-external-CDN styled reports ready for client handoff or print-to-PDF (`window.print()`).
- **Machine-Readable JSON**: Structured schemas compliant with security tracking systems (DefectDojo / OWASP ASVS).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### Installation
```bash
git clone git@github.com:syedrakesh/csrf-forge.git
cd csrf-forge
npm install
```

### Development Server
```bash
npm run dev
```

### Full Validation Suite
```bash
npx tsc --noEmit
npm run lint
npm run test:run
npm run build
```

---

## 🏗️ Architecture

```
src/
├── components/           # Reusable UI & Layout Components
│   ├── layout/          # Header, Sidebar, Main Layout
│   └── ui/              # Badge, Button, Card, CodeBlock, StatCard, Tabs, Alert, Modal
├── context/             # React Context & Session Persistence
│   ├── AppContext.tsx   # Provider with sessionStorage sync
│   ├── context.ts       # Context definition
│   └── useApp.ts        # Type-safe hook
├── lib/                 # Core Engine Libraries
│   ├── parser/          # Raw HTTP and cURL tokenizers & detectors
│   ├── analyzer/        # Heuristic rules & CVSS scoring
│   ├── generator/       # HTML, Fetch, XHR, Image, and Python generators
│   ├── playground/      # Telemetry injection and sandbox runtime
│   ├── storage/         # LocalStorage persistence & templates
│   └── reports/         # Markdown, HTML, and JSON report compilers
├── pages/               # Application Route Views
│   ├── Dashboard.tsx    # Operational metrics & quick actions
│   ├── ParserPage.tsx   # HTTP / cURL stream ingestion
│   ├── AnalyzerPage.tsx # CSRF vulnerability findings
│   ├── GeneratorPage.tsx# Exploit compilation
│   ├── PlaygroundPage.tsx# Isolated testing sandbox
│   ├── ProjectsPage.tsx # Local project manager
│   ├── ReportsPage.tsx  # Executive vulnerability export
│   └── NotFound.tsx     # 404 error handler
└── test/                # Unit, UI, and E2E Test Suites (140+ Tests)
```

---

## 🔒 Security & Privacy Notice

CSRF Forge is engineered as an authorized defensive security auditing suite.
- **Client-Side Execution**: All inputs remain in the browser; no telemetry or user data is transmitted to external servers.
- **Strict Sandboxing**: The playground sandbox runtime isolates PoC code inside an unprivileged iframe context without same-origin access.
- **Responsible Use**: Use this tool only on web systems and applications you have explicit authorization to assess.

---

## 📄 License

MIT License &copy; 2026 Syed Rakesh.
