import { ParsedRequest, AnalysisResult, GeneratedPoc } from '../../types';
import { calculateRiskScore } from '../analyzer/riskScorer';
import { ReportData, ReportFormat, ReportMetadata, ReportOptions } from './types';
import { generateMarkdownReport } from './markdownReport';
import { generateHtmlReport } from './htmlReport';
import { generateJsonReport } from './jsonReport';

/**
 * Extracts a clean hostname from a target URL string.
 */
export function extractHostname(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.hostname || urlStr;
  } catch {
    // If relative or incomplete URL, attempt regex extraction
    const match = urlStr.match(/^(?:https?:\/\/)?([^/:]+)/i);
    return match ? (match[1] ?? 'target-host') : 'target-host';
  }
}

/**
 * Builds default executive summary text based on assessment results.
 */
export function buildDefaultExecutiveSummary(
  targetHost: string,
  analysis: AnalysisResult
): string {
  if (!analysis.isVulnerable) {
    return `Security assessment of endpoint on ${targetHost} revealed robust cross-origin defenses. No indicators of Cross-Site Request Forgery (CWE-352) were detected during heuristic and header analysis. All standard state-changing protections (anti-CSRF tokens, SameSite cookie attributes, or strict custom headers) appear properly configured.`;
  }

  const criticals = analysis.findings.filter((f) => f.severity === 'critical').length;
  const highs = analysis.findings.filter((f) => f.severity === 'high').length;

  return `Security assessment of endpoint on ${targetHost} identified critical vulnerabilities to Cross-Site Request Forgery (CWE-352). Cross-origin requests initiated by an attacker-controlled context can silently execute authenticated actions using the victim's ambient browser credentials. A total of ${analysis.findings.length} security findings were flagged (${criticals} critical, ${highs} high priority). Immediate remediation of anti-CSRF token verification and SameSite cookie policies is strongly recommended.`;
}

/**
 * Prepares complete ReportData from application state and optional overrides.
 */
export function buildReportData(
  request: ParsedRequest,
  analysis: AnalysisResult,
  pocs: GeneratedPoc[] = [],
  customMeta?: Partial<ReportMetadata>
): ReportData {
  const host = request.headers['host'] || extractHostname(request.url);
  const severities = analysis.findings.map((f) => f.severity);
  const riskMetrics = calculateRiskScore(severities);

  const defaultMeta: ReportMetadata = {
    title: `CSRF Security Assessment Report — ${host}`,
    targetHost: host,
    targetUrl: request.url,
    method: request.method,
    auditorName: 'CSRF Forge Security Auditor',
    organization: 'Application Security Operations',
    assessmentDate: new Date().toISOString().split('T')[0] ?? '2026-11-06',
    executiveSummary: buildDefaultExecutiveSummary(host, analysis),
  };

  const metadata: ReportMetadata = {
    ...defaultMeta,
    ...customMeta,
  };

  return {
    metadata,
    request,
    analysis,
    pocs,
    riskMetrics,
  };
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
  format: ReportFormat;
}

/**
 * Dispatches report compilation to the appropriate generator format.
 */
export function exportReport(
  data: ReportData,
  format: ReportFormat,
  options?: Partial<ReportOptions>
): ExportResult {
  const safeHost = data.metadata.targetHost.replace(/[^a-zA-Z0-9.-]/g, '_');
  const dateStr = data.metadata.assessmentDate.replace(/[^0-9-]/g, '');

  switch (format) {
    case 'markdown':
      return {
        content: generateMarkdownReport(data, options),
        filename: `csrf-audit-${safeHost}-${dateStr}.md`,
        mimeType: 'text/markdown;charset=utf-8',
        format: 'markdown',
      };
    case 'html':
      return {
        content: generateHtmlReport(data, options),
        filename: `csrf-audit-${safeHost}-${dateStr}.html`,
        mimeType: 'text/html;charset=utf-8',
        format: 'html',
      };
    case 'json':
      return {
        content: generateJsonReport(data, options),
        filename: `csrf-audit-${safeHost}-${dateStr}.json`,
        mimeType: 'application/json;charset=utf-8',
        format: 'json',
      };
  }
}

/**
 * Triggers a client-side file download in the browser.
 */
export function downloadReportFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies report text directly to the system clipboard.
 */
export async function copyReportToClipboard(content: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch {
      // Fallback below
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = content;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Prints HTML report by opening a print window.
 */
export function printHtmlReport(htmlContent: string): void {
  if (typeof window === 'undefined') return;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}
