import { describe, it, expect } from 'vitest';
import { generateJsonReport } from '../../lib/reports/jsonReport';
import { ReportData, JsonReportSchema } from '../../lib/reports/types';

const mockReportData: ReportData = {
  metadata: {
    title: 'CSRF Assessment Report',
    targetHost: 'api.service.io',
    targetUrl: 'https://api.service.io/v1/transfer',
    method: 'POST',
    auditorName: 'SecOps Auditor',
    organization: 'FinTech Defense',
    assessmentDate: '2026-11-06',
    executiveSummary: 'High risk CSRF found on financial endpoint.',
    customNotes: 'Validated via replay sandbox.',
  },
  request: {
    id: 'req-2',
    method: 'POST',
    url: 'https://api.service.io/v1/transfer',
    headers: {
      Host: 'api.service.io',
      Cookie: 'token=auth_secure_123',
    },
    body: 'amount=1000',
    contentType: 'application/x-www-form-urlencoded',
    cookies: { token: 'auth_secure_123' },
    timestamp: 1700000000000,
  },
  analysis: {
    requestId: 'req-2',
    isVulnerable: true,
    riskScore: 8.5,
    timestamp: 1700000000000,
    findings: [
      {
        id: 'csrf-no-token',
        title: 'Missing CSRF Token',
        description: 'No token found in payload.',
        severity: 'high',
        category: 'Anti-CSRF Defense',
        recommendation: 'Add anti-CSRF token verification.',
      },
    ],
  },
  pocs: [
    {
      id: 'poc-2',
      requestId: 'req-2',
      format: 'python',
      code: 'import requests\nrequests.post(...)',
      description: 'Python regression exploit',
      timestamp: 1700000000000,
    },
  ],
  riskMetrics: {
    score: 8.5,
    severity: 'high',
    label: 'HIGH RISK',
    summary: 'High risk CSRF detected.',
  },
};

describe('generateJsonReport', () => {
  it('generates valid JSON compliant with JsonReportSchema', () => {
    const jsonStr = generateJsonReport(mockReportData);
    const parsed: JsonReportSchema = JSON.parse(jsonStr);

    expect(parsed.reportInfo.generator).toBe('CSRF Forge Security Suite');
    expect(parsed.reportInfo.auditor).toBe('SecOps Auditor');
    expect(parsed.target.host).toBe('api.service.io');
    expect(parsed.target.hasCookies).toBe(true);
    expect(parsed.assessment.isVulnerable).toBe(true);
    expect(parsed.assessment.riskScore).toBe(8.5);
    expect(parsed.assessment.findingsCount).toBe(1);
    expect(parsed.assessment.findingsBySeverity.high).toBe(1);
    expect(parsed.findings[0]?.id).toBe('csrf-no-token');
    expect(parsed.proofOfConcepts?.[0]?.format).toBe('python');
    expect(parsed.rawRequest?.method).toBe('POST');
    expect(parsed.customNotes).toBe('Validated via replay sandbox.');
  });

  it('omits optional sections when configured in options', () => {
    const jsonStr = generateJsonReport(mockReportData, {
      includePocCode: false,
      includeRawRequest: false,
    });
    const parsed: JsonReportSchema = JSON.parse(jsonStr);

    expect(parsed.proofOfConcepts).toBeUndefined();
    expect(parsed.rawRequest).toBeUndefined();
  });
});
