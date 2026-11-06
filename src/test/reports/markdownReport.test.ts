import { describe, it, expect } from 'vitest';
import { generateMarkdownReport, DEFAULT_REPORT_OPTIONS } from '../../lib/reports/markdownReport';
import { ReportData } from '../../lib/reports/types';

const mockReportData: ReportData = {
  metadata: {
    title: 'CSRF Assessment Report — target.internal',
    targetHost: 'target.internal',
    targetUrl: 'https://target.internal/api/update-profile',
    method: 'POST',
    auditorName: 'Senior Pentester',
    organization: 'SecOps Team',
    assessmentDate: '2026-11-06',
    executiveSummary: 'Target endpoint was found vulnerable to cross-origin CSRF.',
    customNotes: 'Scope was limited to staging environment.',
  },
  request: {
    id: 'req-1',
    method: 'POST',
    url: 'https://target.internal/api/update-profile',
    headers: {
      Host: 'target.internal',
      Cookie: 'session=xyz123',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'email=attacker@evil.com',
    contentType: 'application/x-www-form-urlencoded',
    cookies: { session: 'xyz123' },
    timestamp: 1700000000000,
  },
  analysis: {
    requestId: 'req-1',
    isVulnerable: true,
    riskScore: 8.5,
    timestamp: 1700000000000,
    findings: [
      {
        id: 'finding-1',
        title: 'Missing Anti-CSRF Token',
        description: 'No unpredictable token was present to protect the POST transaction.',
        severity: 'high',
        category: 'Token Validation',
        recommendation: 'Implement Synchronizer Token Pattern or Double Submit Cookie.',
      },
    ],
  },
  pocs: [
    {
      id: 'poc-1',
      requestId: 'req-1',
      format: 'html-form',
      code: '<html><body><form action="https://target.internal/api/update-profile" method="POST"><input type="hidden" name="email" value="attacker@evil.com" /></form></body></html>',
      description: 'Auto-submitting HTML form PoC',
      timestamp: 1700000000000,
    },
  ],
  riskMetrics: {
    score: 8.5,
    severity: 'high',
    label: 'HIGH RISK',
    summary: 'Critical vulnerability detected.',
  },
};

describe('generateMarkdownReport', () => {
  it('generates standard markdown with title, metadata, and executive summary', () => {
    const report = generateMarkdownReport(mockReportData, DEFAULT_REPORT_OPTIONS);

    expect(report).toContain('# CSRF Assessment Report — target.internal');
    expect(report).toContain('**Auditor:** Senior Pentester');
    expect(report).toContain('**Organization:** SecOps Team');
    expect(report).toContain('## 1. Executive Summary');
    expect(report).toContain('Target endpoint was found vulnerable to cross-origin CSRF.');
    expect(report).toContain('HIGH RISK');
    expect(report).toContain('8.5 / 10.0');
  });

  it('includes endpoint specifications and findings table', () => {
    const report = generateMarkdownReport(mockReportData, DEFAULT_REPORT_OPTIONS);

    expect(report).toContain('## 2. Target Endpoint Specifications');
    expect(report).toContain('`POST`');
    expect(report).toContain('`https://target.internal/api/update-profile`');
    expect(report).toContain('## 3. Vulnerability Findings Summary');
    expect(report).toContain('Missing Anti-CSRF Token');
  });

  it('includes detailed technical findings and remediation guides', () => {
    const report = generateMarkdownReport(mockReportData, DEFAULT_REPORT_OPTIONS);

    expect(report).toContain('## 4. Technical Analysis & Findings');
    expect(report).toContain('Implement Synchronizer Token Pattern');
  });

  it('includes PoC artifacts and raw HTTP stream', () => {
    const report = generateMarkdownReport(mockReportData, DEFAULT_REPORT_OPTIONS);

    expect(report).toContain('## 5. Proof of Concept (PoC) Exploitation Artifacts');
    expect(report).toContain('Auto-submitting HTML form PoC');
    expect(report).toContain('## 6. Audit Request Stream');
    expect(report).toContain('email=attacker@evil.com');
    expect(report).toContain('## 7. Auditor Field Notes');
    expect(report).toContain('Scope was limited to staging environment.');
  });

  it('respects option toggles when disabling sections', () => {
    const report = generateMarkdownReport(mockReportData, {
      includeExecutiveSummary: false,
      includePocCode: false,
      includeRawRequest: false,
      includeFindingsTable: false,
    });

    expect(report).not.toContain('## 1. Executive Summary');
    expect(report).not.toContain('## 3. Vulnerability Findings Summary');
    expect(report).not.toContain('## 5. Proof of Concept');
    expect(report).not.toContain('## 6. Audit Request Stream');
  });
});
