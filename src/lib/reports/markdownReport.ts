import { ReportData, ReportOptions } from './types';

export const DEFAULT_REPORT_OPTIONS: ReportOptions = {
  includeExecutiveSummary: true,
  includeRemediations: true,
  includePocCode: true,
  includeRawRequest: true,
  includeFindingsTable: true,
};

/**
 * Generates an executive penetration testing report in standard Markdown format.
 */
export function generateMarkdownReport(
  data: ReportData,
  options: Partial<ReportOptions> = {}
): string {
  const opts: ReportOptions = { ...DEFAULT_REPORT_OPTIONS, ...options };
  const { metadata, request, analysis, pocs, riskMetrics } = data;

  const lines: string[] = [];

  // Report Header
  lines.push(`# ${metadata.title}`);
  lines.push('');
  lines.push(`**Generated:** ${metadata.assessmentDate}  `);
  lines.push(`**Auditor:** ${metadata.auditorName}  `);
  lines.push(`**Organization:** ${metadata.organization}  `);
  lines.push(`**Tool:** CSRF Forge Security Suite v1.0.0`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Executive Summary
  if (opts.includeExecutiveSummary) {
    lines.push('## 1. Executive Summary');
    lines.push('');
    lines.push(metadata.executiveSummary);
    lines.push('');

    const riskBadge =
      riskMetrics.severity === 'critical'
        ? '🔴 CRITICAL RISK'
        : riskMetrics.severity === 'high'
        ? '🟠 HIGH RISK'
        : riskMetrics.severity === 'medium'
        ? '🟡 MEDIUM RISK'
        : riskMetrics.severity === 'low'
        ? '🔵 LOW RISK'
        : '🟢 SECURE';

    lines.push('| Metric | Value |');
    lines.push('|---|---|');
    lines.push(`| **Assessment Status** | ${analysis.isVulnerable ? '⚠️ VULNERABLE TO CSRF' : '✅ SECURE'} |`);
    lines.push(`| **Risk Severity** | **${riskBadge}** |`);
    lines.push(`| **CVSS Risk Score** | **${riskMetrics.score.toFixed(1)} / 10.0** |`);
    lines.push(`| **Total Findings** | ${analysis.findings.length} |`);
    lines.push(`| **Target Host** | \`${metadata.targetHost}\` |`);
    lines.push(`| **Assessment Method** | Cross-Origin State Alteration Verification |`);
    lines.push('');
  }

  // Target Endpoint Specifications
  lines.push('## 2. Target Endpoint Specifications');
  lines.push('');
  lines.push('| Parameter | Specification |');
  lines.push('|---|---|');
  lines.push(`| **Method** | \`${request.method}\` |`);
  lines.push(`| **Target URL** | \`${request.url}\` |`);
  lines.push(`| **Content-Type** | \`${request.contentType || 'none'}\` |`);
  lines.push(`| **Active Cookies** | ${Object.keys(request.cookies).length} detected |`);
  lines.push(`| **Active Headers** | ${Object.keys(request.headers).length} headers |`);
  lines.push('');

  // Findings Table
  if (opts.includeFindingsTable && analysis.findings.length > 0) {
    lines.push('## 3. Vulnerability Findings Summary');
    lines.push('');
    lines.push('| ID | Severity | Finding Title | Category |');
    lines.push('|---|---|---|---|');
    analysis.findings.forEach((f) => {
      const sevLabel = f.severity.toUpperCase();
      lines.push(`| \`${f.id}\` | **${sevLabel}** | ${f.title} | ${f.category} |`);
    });
    lines.push('');
  }

  // Detailed Findings & Remediation
  if (analysis.findings.length > 0) {
    lines.push('## 4. Technical Analysis & Findings');
    lines.push('');

    analysis.findings.forEach((f, idx) => {
      lines.push(`### 4.${idx + 1}. [${f.severity.toUpperCase()}] ${f.title}`);
      lines.push('');
      lines.push(`- **Finding ID:** \`${f.id}\``);
      lines.push(`- **Category:** ${f.category}`);
      lines.push(`- **Severity:** ${f.severity.toUpperCase()}`);
      lines.push('');
      lines.push('#### Vulnerability Description:');
      lines.push(f.description);
      lines.push('');

      if (opts.includeRemediations && f.recommendation) {
        lines.push('#### Remediation Guidance:');
        lines.push(f.recommendation);
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    });
  } else {
    lines.push('## 4. Technical Analysis');
    lines.push('');
    lines.push('> ✅ No security vulnerabilities or weak anti-CSRF measures were detected on this endpoint.');
    lines.push('');
  }

  // Proof of Concept Code
  if (opts.includePocCode && pocs.length > 0) {
    lines.push('## 5. Proof of Concept (PoC) Exploitation Artifacts');
    lines.push('');
    lines.push('> ⚠️ **Notice:** These proof-of-concept artifacts are generated exclusively for authorized security verification and regression testing.');
    lines.push('');

    pocs.forEach((poc, idx) => {
      const lang = poc.format.includes('python')
        ? 'python'
        : poc.format.includes('curl')
        ? 'bash'
        : 'html';

      lines.push(`### 5.${idx + 1}. ${poc.description} (\`${poc.format}\`)`);
      lines.push('');
      lines.push('```' + lang);
      lines.push(poc.code);
      lines.push('```');
      lines.push('');
    });
  }

  // Raw Request
  if (opts.includeRawRequest) {
    lines.push('## 6. Audit Request Stream');
    lines.push('');
    lines.push('```http');
    lines.push(`${request.method} ${request.url} HTTP/1.1`);
    Object.entries(request.headers).forEach(([k, v]) => {
      lines.push(`${k}: ${v}`);
    });
    if (request.body) {
      lines.push('');
      lines.push(request.body);
    }
    lines.push('```');
    lines.push('');
  }

  // Custom Notes
  if (metadata.customNotes && metadata.customNotes.trim().length > 0) {
    lines.push('## 7. Auditor Field Notes');
    lines.push('');
    lines.push(metadata.customNotes.trim());
    lines.push('');
  }

  // Methodology & Disclaimer
  lines.push('## Appendix: Assessment Methodology & Scope');
  lines.push('');
  lines.push('This assessment was conducted using automated semantic and heuristic CSRF evaluation engines aligned with OWASP Top 10 A01:2021 (Broken Access Control) and CWE-352 (Cross-Site Request Forgery). Findings are based on static request analysis and browser cross-origin policy simulation.');
  lines.push('');
  lines.push('*Report compiled by CSRF Forge Security Suite.*');

  return lines.join('\n');
}
