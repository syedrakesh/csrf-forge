import { ReportData, ReportOptions } from './types';
import { DEFAULT_REPORT_OPTIONS } from './markdownReport';

/**
 * Escapes unsafe HTML characters to prevent XSS in generated reports.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates a standalone, styled HTML penetration testing report.
 */
export function generateHtmlReport(
  data: ReportData,
  options: Partial<ReportOptions> = {}
): string {
  const opts: ReportOptions = { ...DEFAULT_REPORT_OPTIONS, ...options };
  const { metadata, request, analysis, pocs, riskMetrics } = data;

  const sevColor =
    riskMetrics.severity === 'critical'
      ? '#ef4444'
      : riskMetrics.severity === 'high'
      ? '#f97316'
      : riskMetrics.severity === 'medium'
      ? '#eab308'
      : riskMetrics.severity === 'low'
      ? '#3b82f6'
      : '#10b981';

  const statusBg = analysis.isVulnerable ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
  const statusBorder = analysis.isVulnerable ? '#ef4444' : '#10b981';
  const statusText = analysis.isVulnerable ? '#ef4444' : '#10b981';
  const statusLabel = analysis.isVulnerable ? 'VULNERABLE TO CSRF' : 'SECURE AGAINST CROSS-ORIGIN CSRF';

  const findingsCounts = {
    critical: analysis.findings.filter((f) => f.severity === 'critical').length,
    high: analysis.findings.filter((f) => f.severity === 'high').length,
    medium: analysis.findings.filter((f) => f.severity === 'medium').length,
    low: analysis.findings.filter((f) => f.severity === 'low').length,
    info: analysis.findings.filter((f) => f.severity === 'info').length,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(metadata.title)}</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #0f172a;
      --card-border: #1e293b;
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --accent: #00ff88;
      --accent-dim: rgba(0, 255, 136, 0.1);
      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text-main);
      font-family: var(--font-sans);
      line-height: 1.6;
      padding: 2.5rem 1.5rem;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 2px solid var(--card-border);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .title {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #fff;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1.25rem;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .meta-item strong {
      color: var(--text-main);
      display: block;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.2rem;
    }
    .status-banner {
      background: ${statusBg};
      border-left: 4px solid ${statusBorder};
      padding: 1rem 1.25rem;
      border-radius: 6px;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .status-text {
      font-weight: 800;
      font-size: 1.1rem;
      color: ${statusText};
      font-family: var(--font-mono);
    }
    .risk-score {
      font-size: 1.25rem;
      font-weight: 800;
      font-family: var(--font-mono);
      color: ${sevColor};
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .metric-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }
    .metric-val {
      font-size: 1.75rem;
      font-weight: 800;
      font-family: var(--font-mono);
      margin-top: 0.25rem;
    }
    .metric-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    .section {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 0.75rem;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--card-border);
    }
    th {
      color: var(--text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      background: rgba(15, 23, 42, 0.5);
    }
    td code {
      font-family: var(--font-mono);
      background: rgba(255, 255, 255, 0.05);
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
      color: var(--accent);
      font-size: 0.8rem;
    }
    .finding-card {
      border: 1px solid var(--card-border);
      border-radius: 6px;
      padding: 1.25rem;
      margin-bottom: 1.25rem;
      background: rgba(15, 23, 42, 0.6);
    }
    .finding-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .finding-title {
      font-weight: 700;
      font-size: 1rem;
      color: #fff;
    }
    .finding-desc {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .remediation-box {
      background: rgba(0, 255, 136, 0.04);
      border-left: 3px solid var(--accent);
      padding: 0.75rem 1rem;
      border-radius: 0 4px 4px 0;
      font-size: 0.825rem;
      color: #e2e8f0;
    }
    .remediation-box strong {
      color: var(--accent);
      display: block;
      margin-bottom: 0.25rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    pre {
      background: #050810;
      border: 1px solid var(--card-border);
      border-radius: 6px;
      padding: 1rem;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: #38bdf8;
      line-height: 1.5;
      margin-top: 0.5rem;
    }
    .footer {
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-muted);
      border-top: 1px solid var(--card-border);
      padding-top: 1.5rem;
      margin-top: 3rem;
      font-family: var(--font-mono);
    }
    @media print {
      body {
        background: #ffffff !important;
        color: #0f172a !important;
        padding: 0 !important;
      }
      .section, .metric-card, .finding-card {
        background: #ffffff !important;
        border: 1px solid #cbd5e1 !important;
        color: #0f172a !important;
        break-inside: avoid;
      }
      .title, .section-title, .finding-title {
        color: #0f172a !important;
      }
      th {
        background: #f1f5f9 !important;
        color: #334155 !important;
      }
      td, th {
        border-bottom: 1px solid #cbd5e1 !important;
      }
      pre {
        background: #f8fafc !important;
        color: #0f172a !important;
        border: 1px solid #cbd5e1 !important;
      }
      .remediation-box {
        background: #f0fdf4 !important;
        border-left: 3px solid #16a34a !important;
        color: #166534 !important;
      }
      td code {
        background: #f1f5f9 !important;
        color: #0f172a !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-top">
        <div>
          <h1 class="title">${escapeHtml(metadata.title)}</h1>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem;">
            Automated Cross-Site Request Forgery Security Audit
          </p>
        </div>
        <span class="badge" style="background: ${sevColor}22; color: ${sevColor}; border: 1px solid ${sevColor};">
          ${riskMetrics.label}
        </span>
      </div>
      <div class="meta-grid">
        <div class="meta-item">
          <strong>Target Host</strong>
          <span>${escapeHtml(metadata.targetHost)}</span>
        </div>
        <div class="meta-item">
          <strong>Assessment Date</strong>
          <span>${escapeHtml(metadata.assessmentDate)}</span>
        </div>
        <div class="meta-item">
          <strong>Lead Auditor</strong>
          <span>${escapeHtml(metadata.auditorName)}</span>
        </div>
        <div class="meta-item">
          <strong>Organization</strong>
          <span>${escapeHtml(metadata.organization)}</span>
        </div>
      </div>
    </div>

    <div class="status-banner">
      <div>
        <div class="status-text">${statusLabel}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">
          Cross-Origin Evaluation Result
        </div>
      </div>
      <div class="risk-score">
        CVSS ${riskMetrics.score.toFixed(1)} / 10.0
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Risk Score</div>
        <div class="metric-val" style="color: ${sevColor};">${riskMetrics.score.toFixed(1)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total Findings</div>
        <div class="metric-val" style="color: #fff;">${analysis.findings.length}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Critical</div>
        <div class="metric-val" style="color: #ef4444;">${findingsCounts.critical}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">High</div>
        <div class="metric-val" style="color: #f97316;">${findingsCounts.high}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Medium</div>
        <div class="metric-val" style="color: #eab308;">${findingsCounts.medium}</div>
      </div>
    </div>

    ${
      opts.includeExecutiveSummary
        ? `<div class="section">
      <h2 class="section-title">1. Executive Summary</h2>
      <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.7;">
        ${escapeHtml(metadata.executiveSummary)}
      </p>
    </div>`
        : ''
    }

    <div class="section">
      <h2 class="section-title">2. Target Endpoint Specifications</h2>
      <table>
        <tbody>
          <tr>
            <th style="width: 25%;">HTTP Method</th>
            <td><code>${escapeHtml(request.method)}</code></td>
          </tr>
          <tr>
            <th>Endpoint URL</th>
            <td><code>${escapeHtml(request.url)}</code></td>
          </tr>
          <tr>
            <th>Content-Type</th>
            <td><code>${escapeHtml(request.contentType || 'none')}</code></td>
          </tr>
          <tr>
            <th>Ambient Session Cookies</th>
            <td>${Object.keys(request.cookies).length} session cookies detected</td>
          </tr>
          <tr>
            <th>Request Headers</th>
            <td>${Object.keys(request.headers).length} headers parsed</td>
          </tr>
        </tbody>
      </table>
    </div>

    ${
      opts.includeFindingsTable && analysis.findings.length > 0
        ? `<div class="section">
      <h2 class="section-title">3. Vulnerability Findings Matrix</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Severity</th>
            <th>Vulnerability Finding</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          ${analysis.findings
            .map((f) => {
              const color =
                f.severity === 'critical'
                  ? '#ef4444'
                  : f.severity === 'high'
                  ? '#f97316'
                  : f.severity === 'medium'
                  ? '#eab308'
                  : f.severity === 'low'
                  ? '#3b82f6'
                  : '#10b981';
              return `<tr>
                <td><code>${escapeHtml(f.id)}</code></td>
                <td><span class="badge" style="background: ${color}22; color: ${color}; border: 1px solid ${color};">${f.severity.toUpperCase()}</span></td>
                <td style="font-weight: 600;">${escapeHtml(f.title)}</td>
                <td>${escapeHtml(f.category)}</td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </div>`
        : ''
    }

    <div class="section">
      <h2 class="section-title">4. Technical Analysis & Findings Detail</h2>
      ${
        analysis.findings.length > 0
          ? analysis.findings
              .map(
                (f) => `<div class="finding-card">
            <div class="finding-header">
              <span class="finding-title">${escapeHtml(f.title)}</span>
              <span class="badge" style="background: rgba(255,255,255,0.08); color: #fff;">
                ${escapeHtml(f.category)}
              </span>
            </div>
            <div class="finding-desc">${escapeHtml(f.description)}</div>
            ${
              opts.includeRemediations && f.recommendation
                ? `<div class="remediation-box">
                <strong>Recommended Mitigation:</strong>
                ${escapeHtml(f.recommendation)}
              </div>`
                : ''
            }
          </div>`
              )
              .join('')
          : '<p style="color: var(--text-muted); font-size: 0.9rem;">No vulnerability findings identified for this request.</p>'
      }
    </div>

    ${
      opts.includePocCode && pocs.length > 0
        ? `<div class="section">
      <h2 class="section-title">5. Proof of Concept Artifacts</h2>
      <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
        The following exploit reproduction vectors demonstrate the feasibility of cross-origin state alteration:
      </p>
      ${pocs
        .map(
          (poc) => `<div style="margin-bottom: 1.5rem;">
        <div style="font-weight: 600; font-size: 0.9rem; color: #fff; margin-bottom: 0.25rem;">
          ${escapeHtml(poc.description)} (${escapeHtml(poc.format)})
        </div>
        <pre><code>${escapeHtml(poc.code)}</code></pre>
      </div>`
        )
        .join('')}
    </div>`
        : ''
    }

    ${
      opts.includeRawRequest
        ? `<div class="section">
      <h2 class="section-title">6. Audit Request Stream</h2>
      <pre><code>${escapeHtml(request.method)} ${escapeHtml(request.url)} HTTP/1.1
${escapeHtml(
  Object.entries(request.headers)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
)}${request.body ? '\n\n' + escapeHtml(request.body) : ''}</code></pre>
    </div>`
        : ''
    }

    ${
      metadata.customNotes && metadata.customNotes.trim().length > 0
        ? `<div class="section">
      <h2 class="section-title">7. Auditor Field Notes</h2>
      <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; white-space: pre-wrap;">
        ${escapeHtml(metadata.customNotes.trim())}
      </p>
    </div>`
        : ''
    }

    <div class="footer">
      Generated by CSRF Forge Security Suite &bull; Aligned with OWASP Top 10 A01:2021 &amp; CWE-352
    </div>
  </div>
</body>
</html>`;
}
