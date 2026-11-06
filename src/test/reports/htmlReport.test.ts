import { describe, it, expect } from 'vitest';
import { generateHtmlReport, escapeHtml } from '../../lib/reports/htmlReport';
import { ReportData } from '../../lib/reports/types';

const mockReportData: ReportData = {
  metadata: {
    title: 'CSRF Assessment <Test>',
    targetHost: 'target.internal',
    targetUrl: 'https://target.internal/api/update-profile?role=admin&user=1',
    method: 'POST',
    auditorName: 'SecOps <Auditor>',
    organization: 'Acme Corp & Co',
    assessmentDate: '2026-11-06',
    executiveSummary: 'Executive overview text with special characters: <script>alert(1)</script>',
    customNotes: 'Auditor remarks note.',
  },
  request: {
    id: 'req-1',
    method: 'POST',
    url: 'https://target.internal/api/update-profile?role=admin&user=1',
    headers: {
      Host: 'target.internal',
      Cookie: 'session=xyz123',
    },
    body: 'email=attacker%40evil.com',
    contentType: 'application/x-www-form-urlencoded',
    cookies: { session: 'xyz123' },
    timestamp: 1700000000000,
  },
  analysis: {
    requestId: 'req-1',
    isVulnerable: true,
    riskScore: 9.0,
    timestamp: 1700000000000,
    findings: [
      {
        id: 'finding-1',
        title: 'Missing Anti-CSRF Token',
        description: 'No token present.',
        severity: 'critical',
        category: 'Token Validation',
        recommendation: 'Use anti-CSRF token.',
      },
    ],
  },
  pocs: [
    {
      id: 'poc-1',
      requestId: 'req-1',
      format: 'html-form',
      code: '<form action="https://target.internal"></form>',
      description: 'Auto-submitting HTML form PoC',
      timestamp: 1700000000000,
    },
  ],
  riskMetrics: {
    score: 9.0,
    severity: 'critical',
    label: 'CRITICAL RISK',
    summary: 'Critical vulnerability detected.',
  },
};

describe('generateHtmlReport', () => {
  it('correctly escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
    expect(escapeHtml('A & B')).toBe('A &amp; B');
    expect(escapeHtml("'single quote'")).toBe('&#39;single quote&#39;');
  });

  it('generates a full HTML document with print styling and metadata', () => {
    const html = generateHtmlReport(mockReportData);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>CSRF Assessment &lt;Test&gt;</title>');
    expect(html).toContain('@media print');
    expect(html).toContain('target.internal');
    expect(html).toContain('VULNERABLE TO CSRF');
    expect(html).toContain('CRITICAL RISK');
    expect(html).toContain('CVSS 9.0 / 10.0');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('renders metrics cards, endpoint specifications, and findings', () => {
    const html = generateHtmlReport(mockReportData);

    expect(html).toContain('Target Endpoint Specifications');
    expect(html).toContain('Missing Anti-CSRF Token');
    expect(html).toContain('Use anti-CSRF token.');
    expect(html).toContain('Proof of Concept Artifacts');
    expect(html).toContain('Audit Request Stream');
  });

  it('respects section exclusion options', () => {
    const html = generateHtmlReport(mockReportData, {
      includeExecutiveSummary: false,
      includeRemediations: false,
      includePocCode: false,
      includeRawRequest: false,
    });

    expect(html).not.toContain('1. Executive Summary');
    expect(html).not.toContain('Recommended Mitigation:');
    expect(html).not.toContain('Proof of Concept Artifacts');
    expect(html).not.toContain('Audit Request Stream');
  });
});
