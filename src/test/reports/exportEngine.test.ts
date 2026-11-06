import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractHostname,
  buildDefaultExecutiveSummary,
  buildReportData,
  exportReport,
  downloadReportFile,
  copyReportToClipboard,
  printHtmlReport,
} from '../../lib/reports/exportEngine';
import { ParsedRequest, AnalysisResult, GeneratedPoc } from '../../types';

describe('exportEngine', () => {
  const mockReq: ParsedRequest = {
    id: 'req-3',
    method: 'POST',
    url: 'https://finance.corp.net/transfer',
    headers: {
      Host: 'finance.corp.net',
      Cookie: 'sess=abc',
    },
    body: 'to=bob&amount=50',
    contentType: 'application/x-www-form-urlencoded',
    cookies: { sess: 'abc' },
    timestamp: 1700000000000,
  };

  const mockAnalysis: AnalysisResult = {
    requestId: 'req-3',
    isVulnerable: true,
    riskScore: 7.5,
    timestamp: 1700000000000,
    findings: [
      {
        id: 'f-1',
        title: 'Lax Cookie',
        description: 'Cookie allows cross-site requests.',
        severity: 'high',
        category: 'Cookie Attributes',
        recommendation: 'Use SameSite=Strict.',
      },
    ],
  };

  const mockPocs: GeneratedPoc[] = [
    {
      id: 'p-1',
      requestId: 'req-3',
      format: 'html-form',
      code: '<form></form>',
      description: 'PoC Form',
      timestamp: 1700000000000,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    } else {
      vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    }
    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(window.URL, 'revokeObjectURL').mockReturnValue();
    }
  });

  it('extractHostname extracts domain correctly from full and relative URLs', () => {
    expect(extractHostname('https://portal.domain.com/login')).toBe('portal.domain.com');
    expect(extractHostname('http://localhost:8080/api')).toBe('localhost');
    expect(extractHostname('/api/action')).toBe('target-host');
  });

  it('buildDefaultExecutiveSummary returns appropriate text for vulnerable vs secure targets', () => {
    const vulnSummary = buildDefaultExecutiveSummary('finance.corp.net', mockAnalysis);
    expect(vulnSummary).toContain('identified critical vulnerabilities');
    expect(vulnSummary).toContain('1 security findings were flagged');

    const secureAnalysis: AnalysisResult = {
      requestId: 'req-secure',
      isVulnerable: false,
      riskScore: 0.0,
      timestamp: 1700000000000,
      findings: [],
    };
    const secureSummary = buildDefaultExecutiveSummary('finance.corp.net', secureAnalysis);
    expect(secureSummary).toContain('revealed robust cross-origin defenses');
  });

  it('buildReportData constructs complete data with defaults and custom overrides', () => {
    const data = buildReportData(mockReq, mockAnalysis, mockPocs, {
      auditorName: 'Lead Pentester X',
    });

    expect(data.metadata.auditorName).toBe('Lead Pentester X');
    expect(data.metadata.targetHost).toBe('finance.corp.net');
    expect(data.riskMetrics.score).toBeGreaterThan(0);
    expect(data.pocs.length).toBe(1);
  });

  it('exportReport dispatches correctly to markdown, html, and json formats', () => {
    const data = buildReportData(mockReq, mockAnalysis, mockPocs);

    const mdRes = exportReport(data, 'markdown');
    expect(mdRes.filename).toContain('.md');
    expect(mdRes.mimeType).toBe('text/markdown;charset=utf-8');
    expect(mdRes.content).toContain('# CSRF Security Assessment Report');

    const htmlRes = exportReport(data, 'html');
    expect(htmlRes.filename).toContain('.html');
    expect(htmlRes.mimeType).toBe('text/html;charset=utf-8');
    expect(htmlRes.content).toContain('<!DOCTYPE html>');

    const jsonRes = exportReport(data, 'json');
    expect(jsonRes.filename).toContain('.json');
    expect(jsonRes.mimeType).toBe('application/json;charset=utf-8');
    expect(jsonRes.content).toContain('"generator": "CSRF Forge Security Suite"');
  });

  it('downloadReportFile creates a virtual link and triggers click', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');

    downloadReportFile('test content', 'report.md', 'text/markdown');

    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
  });

  it('copyReportToClipboard uses navigator.clipboard when available', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const success = await copyReportToClipboard('sample copy text');
    expect(writeTextMock).toHaveBeenCalledWith('sample copy text');
    expect(success).toBe(true);
  });

  it('printHtmlReport opens a new window and prints', () => {
    const printMock = vi.fn();
    const openMock = vi.spyOn(window, 'open').mockReturnValue({
      document: {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
      },
      focus: vi.fn(),
      print: printMock,
    } as unknown as Window);

    vi.useFakeTimers();
    printHtmlReport('<html><body>Report</body></html>');
    expect(openMock).toHaveBeenCalledWith('', '_blank');
    vi.runAllTimers();
    expect(printMock).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
