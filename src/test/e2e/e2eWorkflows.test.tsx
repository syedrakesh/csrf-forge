import { describe, it, expect, beforeEach } from 'vitest';
import { parseRawHttpRequest } from '../../lib/parser/httpParser';
import { parseCurlCommand } from '../../lib/parser/curlParser';
import { analyzeCsrfRequest } from '../../lib/analyzer/csrfAnalyzer';
import { compilePoc } from '../../lib/generator/pocCompiler';
import { buildReportData, exportReport } from '../../lib/reports';
import { createProject } from '../../lib/storage/projectStorage';
import { SAMPLE_REQUESTS } from '../../lib/parser/sampleRequests';

describe('E2E Complete User Workflows', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('Flow 1: Parse Raw HTTP -> Analyze Vulnerability -> Generate PoCs -> Save to Project', () => {
    // Step 1: Ingest sample bank transfer
    const bankTransfer = SAMPLE_REQUESTS.find((s) => s.id === 'sample-bank-transfer');
    expect(bankTransfer).toBeDefined();

    const parseRes = parseRawHttpRequest(bankTransfer!.payload);
    expect(parseRes.success).toBe(true);
    expect(parseRes.request).toBeDefined();
    const req = parseRes.request!;
    expect(req.method).toBe('POST');
    expect(req.url).toContain('/api/transfer');
    expect(Object.keys(req.cookies).length).toBeGreaterThan(0);

    // Step 2: Run Heuristic CSRF Analysis
    const analysis = analyzeCsrfRequest(req);
    expect(analysis.isVulnerable).toBe(true);
    expect(analysis.riskScore).toBeGreaterThanOrEqual(7.0);
    expect(analysis.findings.length).toBeGreaterThanOrEqual(2);

    // Verify finding categories
    const categories = analysis.findings.map((f) => f.category);
    expect(categories).toContain('Cryptographic Protection');

    // Step 3: Generate Multi-vector PoC Exploit Suite
    const htmlForm = compilePoc(req, 'html-form', {
      autoSubmit: true,
      stealthIframe: true,
    });
    const pythonPoc = compilePoc(req, 'python');
    const fetchPoc = compilePoc(req, 'html-fetch');
    const pocSuite = [htmlForm, pythonPoc, fetchPoc];

    expect(htmlForm.code).toContain('<form');
    expect(htmlForm.code).toContain('bank.local.internal');
    expect(pythonPoc.code).toContain('requests.Session()');

    // Step 4: Persist everything to a Project container
    const project = createProject(
      'Banking Pentest Engagement',
      'Audit of financial transfer API',
      req,
      analysis,
      pocSuite
    );

    expect(project.requests.length).toBe(1);
    expect(project.analyses.length).toBe(1);
    expect(project.pocs.length).toBe(3);
    expect(project.updatedAt).toBeGreaterThanOrEqual(project.createdAt);
  });

  it('Flow 2: Parse cURL -> Analyze Risk -> Generate PoCs -> Compile Markdown & JSON Reports', () => {
    // Step 1: Parse multiline cURL with session headers
    const emailSample = SAMPLE_REQUESTS.find((s) => s.id === 'sample-email-update');
    expect(emailSample).toBeDefined();

    const parseRes = parseCurlCommand(emailSample!.payload);
    expect(parseRes.success).toBe(true);
    expect(parseRes.request).toBeDefined();
    const req = parseRes.request!;
    expect(req.method).toBe('POST');
    expect(req.url).toContain('/user/settings/email');

    // Step 2: Evaluate CSRF Risk
    const analysis = analyzeCsrfRequest(req);
    expect(analysis.isVulnerable).toBe(true);
    expect(analysis.riskScore).toBeGreaterThan(5.0);

    // Step 3: Generate PoC Suite
    const htmlForm = compilePoc(req, 'html-form');
    const pythonPoc = compilePoc(req, 'python');
    const pocSuite = [htmlForm, pythonPoc];
    expect(pocSuite.length).toBe(2);

    // Step 4: Generate Client-Ready Markdown & JSON Reports
    const reportData = buildReportData(req, analysis, pocSuite, {
      auditorName: 'Lead Pentester',
      organization: 'CyberSec Operations',
    });

    const mdReport = exportReport(reportData, 'markdown');
    expect(mdReport.content).toContain('# CSRF Security Assessment Report');
    expect(mdReport.content).toContain('**Auditor:** Lead Pentester');
    expect(mdReport.content).toContain('/user/settings/email');
    expect(mdReport.content).toContain('Vulnerability Findings Summary');

    const jsonReport = exportReport(reportData, 'json');
    const jsonParsed = JSON.parse(jsonReport.content);
    expect(jsonParsed.reportInfo.auditor).toBe('Lead Pentester');
    expect(jsonParsed.assessment.isVulnerable).toBe(true);
    expect(jsonParsed.findings.length).toBe(analysis.findings.length);
    expect(jsonParsed.proofOfConcepts.length).toBe(pocSuite.length);
  });

  it('Flow 3: Secure Endpoint Evaluation -> Low Risk Score -> Secure Report Generation', () => {
    // Simulate a secure request with Anti-CSRF Token, application/json, and Strict SameSite Cookie
    const rawSecureHttp = `POST /api/v1/update-profile HTTP/1.1
Host: secure-portal.app.com
Content-Type: application/json
Cookie: session_id=sec_12345; SameSite=Strict
X-CSRF-Token: 9f8e7d6c5b4a3a2b1c0d
Origin: https://secure-portal.app.com
Referer: https://secure-portal.app.com/settings

{"display_name": "JaneDoe"}`;

    const parseRes = parseRawHttpRequest(rawSecureHttp);
    expect(parseRes.success).toBe(true);
    const req = parseRes.request!;

    const analysis = analyzeCsrfRequest(req);
    // Request with valid anti-CSRF token and strict headers is not vulnerable
    expect(analysis.isVulnerable).toBe(false);
    expect(analysis.riskScore).toBeLessThan(4.0);

    const reportData = buildReportData(req, analysis, []);
    const htmlReport = exportReport(reportData, 'html');
    expect(htmlReport.content).toContain('secure-portal.app.com');
    expect(htmlReport.content).toContain('SECURE AGAINST CROSS-ORIGIN CSRF');
  });
});
