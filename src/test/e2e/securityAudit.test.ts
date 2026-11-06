import { describe, it, expect } from 'vitest';
import { generateHtmlReport, escapeHtml } from '../../lib/reports/htmlReport';
import { generateMarkdownReport } from '../../lib/reports/markdownReport';
import { generateJsonReport } from '../../lib/reports/jsonReport';
import { ReportData } from '../../lib/reports/types';
import { instrumentPocForSandbox } from '../../lib/playground/sandboxRuntime';

describe('Security Posture & Defensive Sandbox Audit', () => {
  const xssPayloads = [
    '<script>alert("xss")</script>',
    '"><img src=x onerror=alert(1)>',
    "' onfocus=alert(document.domain) autofocus='",
    '"><svg/onload=alert(1)>',
  ];

  it('escapeHtml neutralizes all primary XSS vectors', () => {
    xssPayloads.forEach((payload) => {
      const escaped = escapeHtml(payload);
      expect(escaped).not.toContain('<script>');
      expect(escaped).not.toContain('"><');
      expect(escaped.includes('&lt;') || escaped.includes('&quot;') || escaped.includes('&#39;')).toBe(
        true
      );
    });
  });

  it('HTML report generation sanitizes malicious user inputs and findings', () => {
    const maliciousData: ReportData = {
      metadata: {
        title: '<script>alert("title-xss")</script>',
        targetHost: 'evil.attacker.com"><script>alert(1)</script>',
        targetUrl: 'https://victim.com/api?q=<img src=x onerror=alert(2)>',
        method: 'POST',
        auditorName: 'Auditor "><b onmouseover=alert(1)>Hover</b>',
        organization: "Corp & ' OR '1'='1",
        assessmentDate: '2026-11-06',
        executiveSummary: '<svg onload=alert(3)>Malicious overview',
        customNotes: '<iframe src="javascript:alert(4)"></iframe>',
      },
      request: {
        id: 'xss-req',
        method: 'POST',
        url: 'https://victim.com/api?q=<img src=x onerror=alert(2)>',
        headers: {
          Host: 'victim.com',
          'X-Injected': '<script>alert("header")</script>',
        },
        body: 'user=<script>alert("body")</script>',
        contentType: 'application/x-www-form-urlencoded',
        cookies: {},
        timestamp: Date.now(),
      },
      analysis: {
        requestId: 'xss-req',
        isVulnerable: true,
        riskScore: 9.0,
        timestamp: Date.now(),
        findings: [
          {
            id: 'xss-find-1',
            title: 'Vuln <script>alert("finding")</script>',
            description: 'Desc <img src=x onerror=alert(1)>',
            severity: 'critical',
            category: 'Category <svg onload=1>',
            recommendation: 'Fix <script>steal()</script>',
          },
        ],
      },
      pocs: [],
      riskMetrics: {
        score: 9.0,
        severity: 'critical',
        label: 'CRITICAL RISK',
        summary: 'High risk',
      },
    };

    const htmlReport = generateHtmlReport(maliciousData);

    // Assert that raw unescaped script tags and onerror handlers are not present in the HTML report
    expect(htmlReport).not.toContain('<script>alert("title-xss")</script>');
    expect(htmlReport).not.toContain('<script>alert(1)</script>');
    expect(htmlReport).not.toContain('<img src=x onerror=alert(2)>');
    expect(htmlReport).not.toContain('<svg onload=alert(3)>');
    expect(htmlReport).not.toContain('<iframe src="javascript:alert(4)"></iframe>');
    expect(htmlReport).not.toContain('<script>steal()</script>');
  });

  it('JSON report generation produces strictly valid JSON without injection distortion', () => {
    const maliciousData: ReportData = {
      metadata: {
        title: 'Title with "quotes" and \\backslashes\\ and \n newlines',
        targetHost: 'host.io',
        targetUrl: 'https://host.io',
        method: 'POST',
        auditorName: 'Auditor "{"evil": true}"',
        organization: 'Org',
        assessmentDate: '2026-11-06',
        executiveSummary: 'Summary with \t tabs and \r\n carriage returns',
      },
      request: {
        id: 'req-j',
        method: 'POST',
        url: 'https://host.io',
        headers: {},
        body: '{"nested": "json"}',
        contentType: 'application/json',
        cookies: {},
        timestamp: Date.now(),
      },
      analysis: {
        requestId: 'req-j',
        isVulnerable: false,
        riskScore: 0,
        timestamp: Date.now(),
        findings: [],
      },
      pocs: [],
      riskMetrics: {
        score: 0,
        severity: 'info',
        label: 'SECURE',
        summary: 'Clean',
      },
    };

    const jsonStr = generateJsonReport(maliciousData);
    // Parsing should succeed without error
    const parsed = JSON.parse(jsonStr);
    expect(parsed.reportInfo.reportTitle).toContain('Title with "quotes"');
    expect(parsed.reportInfo.auditor).toContain('Auditor "{"evil": true}"');
  });

  it('Markdown report maintains structural integrity with special markdown characters', () => {
    const mdData: ReportData = {
      metadata: {
        title: 'Markdown with | Pipes | And # Hashes and `backticks`',
        targetHost: 'host.io',
        targetUrl: 'https://host.io',
        method: 'POST',
        auditorName: 'Auditor',
        organization: 'Org',
        assessmentDate: '2026-11-06',
        executiveSummary: 'Summary with *stars* and _underscores_',
      },
      request: {
        id: 'req-m',
        method: 'POST',
        url: 'https://host.io',
        headers: {},
        body: '',
        contentType: 'application/x-www-form-urlencoded',
        cookies: {},
        timestamp: Date.now(),
      },
      analysis: {
        requestId: 'req-m',
        isVulnerable: false,
        riskScore: 0,
        timestamp: Date.now(),
        findings: [],
      },
      pocs: [],
      riskMetrics: {
        score: 0,
        severity: 'info',
        label: 'SECURE',
        summary: 'Clean',
      },
    };

    const md = generateMarkdownReport(mdData);
    expect(typeof md).toBe('string');
    expect(md).toContain('# Markdown with | Pipes | And # Hashes and `backticks`');
  });

  it('instrumentPocForSandbox wraps code without destroying payload execution', () => {
    const rawHtml = '<html><body><h1>PoC</h1></body></html>';
    const instrumented = instrumentPocForSandbox(rawHtml);

    expect(instrumented).toContain('csrf-forge-sandbox');
    expect(instrumented).toContain('window.parent.postMessage');
    expect(instrumented).toContain('<h1>PoC</h1>');
  });
});
