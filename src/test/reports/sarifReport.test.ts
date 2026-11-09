import { describe, it, expect } from 'vitest';
import { generateSarifReport } from '../../lib/reports/sarifReport';
import { ReportData } from '../../lib/reports/types';

describe('SARIF Report Generator', () => {
  const mockData: ReportData = {
    metadata: {
      title: 'CSRF Assessment',
      targetHost: 'api.target.com',
      targetUrl: 'https://api.target.com/action',
      method: 'POST',
      auditorName: 'SecOps',
      organization: 'Security Org',
      assessmentDate: '2026-11-06',
      executiveSummary: 'Summary',
    },
    request: {
      id: 'req-s',
      method: 'POST',
      url: 'https://api.target.com/action',
      headers: { host: 'api.target.com' },
      body: 'a=1',
      contentType: 'application/x-www-form-urlencoded',
      cookies: { session: '123' },
      timestamp: Date.now(),
    },
    analysis: {
      requestId: 'req-s',
      isVulnerable: true,
      riskScore: 8.5,
      timestamp: Date.now(),
      findings: [
        {
          id: 'MISSING_ANTI_CSRF_TOKEN',
          title: 'Missing Anti-CSRF Token',
          description: 'No token found in request.',
          severity: 'high',
          category: 'Cryptographic Protection',
          recommendation: 'Implement Synchronizer Token Pattern.',
        },
      ],
    },
    pocs: [],
    riskMetrics: {
      score: 8.5,
      severity: 'high',
      label: 'HIGH RISK',
      summary: 'High risk finding',
    },
  };

  it('generates valid SARIF v2.1.0 schema structure', () => {
    const sarifStr = generateSarifReport(mockData);
    const parsed = JSON.parse(sarifStr);

    expect(parsed.version).toBe('2.1.0');
    expect(parsed.$schema).toContain('sarif-schema-2.1.0.json');
    expect(parsed.runs.length).toBe(1);
    expect(parsed.runs[0].tool.driver.name).toBe('CSRF Forge');

    // Rules
    const rules = parsed.runs[0].tool.driver.rules;
    expect(rules.length).toBe(1);
    expect(rules[0].id).toBe('MISSING_ANTI_CSRF_TOKEN');
    expect(rules[0].defaultConfiguration.level).toBe('error');

    // Results
    const results = parsed.runs[0].results;
    expect(results.length).toBe(1);
    expect(results[0].ruleId).toBe('MISSING_ANTI_CSRF_TOKEN');
    expect(results[0].level).toBe('error');
    expect(results[0].locations[0].physicalLocation.artifactLocation.uri).toBe(
      'https://api.target.com/action'
    );
  });
});

