import { ReportData, ReportOptions, JsonReportSchema } from './types';
import { DEFAULT_REPORT_OPTIONS } from './markdownReport';
import { Severity } from '../../types';

/**
 * Generates structured JSON security audit report.
 */
export function generateJsonReport(
  data: ReportData,
  options: Partial<ReportOptions> = {}
): string {
  const opts: ReportOptions = { ...DEFAULT_REPORT_OPTIONS, ...options };
  const { metadata, request, analysis, pocs, riskMetrics } = data;

  const severityCounts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  analysis.findings.forEach((f) => {
    if (f.severity in severityCounts) {
      severityCounts[f.severity]++;
    }
  });

  const schema: JsonReportSchema = {
    reportInfo: {
      generator: 'CSRF Forge Security Suite',
      version: '1.0.0',
      generatedAt: metadata.assessmentDate,
      reportTitle: metadata.title,
      auditor: metadata.auditorName,
      organization: metadata.organization,
    },
    target: {
      url: request.url,
      host: metadata.targetHost,
      method: request.method,
      contentType: request.contentType || 'none',
      cookieCount: Object.keys(request.cookies).length,
      hasCookies: Object.keys(request.cookies).length > 0,
    },
    assessment: {
      isVulnerable: analysis.isVulnerable,
      riskScore: riskMetrics.score,
      riskSeverity: riskMetrics.severity,
      riskLabel: riskMetrics.label,
      summary: riskMetrics.summary,
      findingsCount: analysis.findings.length,
      findingsBySeverity: severityCounts,
    },
    findings: analysis.findings.map((f) => ({
      id: f.id,
      title: f.title,
      severity: f.severity,
      category: f.category,
      description: f.description,
      recommendation: opts.includeRemediations ? f.recommendation : '',
    })),
  };

  if (opts.includePocCode && pocs.length > 0) {
    schema.proofOfConcepts = pocs.map((p) => ({
      format: p.format,
      description: p.description,
      code: p.code,
    }));
  }

  if (opts.includeRawRequest) {
    schema.rawRequest = {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
    };
  }

  if (metadata.customNotes && metadata.customNotes.trim().length > 0) {
    schema.customNotes = metadata.customNotes.trim();
  }

  return JSON.stringify(schema, null, 2);
}
