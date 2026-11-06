# ⚡ CSRF Forge

**Advanced CSRF Proof of Concept Generator & Vulnerability Analyzer**

A modern, client-side cybersecurity tool for security professionals and penetration testers to analyze HTTP requests for Cross-Site Request Forgery (CSRF) vulnerabilities and generate proof-of-concept exploits.

![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## 🔥 Features

- **HTTP Request Parser** — Parse raw HTTP requests and cURL commands
- **CSRF Analyzer** — Intelligent vulnerability detection with severity scoring
- **PoC Generator** — Generate HTML forms, AJAX, Fetch, and script-based PoCs
- **Live Playground** — Isolated editor and preview for testing PoCs
- **Project Manager** — Save, organize, and manage testing sessions
- **Export & Reports** — Generate vulnerability reports in multiple formats

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone https://github.com/syedrakesh/csrf-forge.git
cd csrf-forge
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
npm run test:run
```

## 🏗️ Architecture

```
src/
├── components/        # Reusable UI components
│   ├── layout/       # Layout components (Header, Sidebar, etc.)
│   ├── ui/           # Generic UI components
│   └── shared/       # Shared components
├── pages/            # Route page components
├── lib/              # Core business logic
│   ├── parser/       # HTTP/cURL parsing engine
│   ├── analyzer/     # CSRF vulnerability analyzer
│   ├── generator/    # PoC code generator
│   └── storage/      # Local storage management
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── test/             # Test files and setup
└── utils/            # Utility functions
```

## ⚠️ Disclaimer

This tool is designed for **authorized security testing only**. Always obtain proper authorization before testing for vulnerabilities. Unauthorized testing may violate laws and regulations.

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
