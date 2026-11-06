import { ParsedRequest, AnalysisResult, GeneratedPoc, HttpMethod, Severity } from '../../types';
import { RiskMetrics } from '../analyzer/riskScorer';

export type ReportFormat = 'markdown' | 'html' | 'json';

export interface ReportMetadata {
  title: string;
  targetHost: string;
  targetUrl: string;
  method: HttpMethod;
  auditorName: string;
  organization: string;
  assessmentDate: string;
  executiveSummary: string;
  customNotes?: string;
}

export interface ReportOptions {
  includeExecutiveSummary: boolean;
  includeRemediations: boolean;
  includePocCode: boolean;
  includeRawRequest: boolean;
  includeFindingsTable: boolean;
}

export interface ReportData {
  metadata: ReportMetadata;
  request: ParsedRequest;
  analysis: AnalysisResult;
  pocs: GeneratedPoc[];
  riskMetrics: RiskMetrics;
}

export interface JsonReportSchema {
  reportInfo: {
    generator: string;
    version: string;
    generatedAt: string;
    reportTitle: string;
    auditor: string;
    organization: string;
  };
  target: {
    url: string;
    host: string;
    method: HttpMethod;
    contentType: string;
    cookieCount: number;
    hasCookies: boolean;
  };
  assessment: {
    isVulnerable: boolean;
    riskScore: number;
    riskSeverity: Severity;
    riskLabel: string;
    summary: string;
    findingsCount: number;
    findingsBySeverity: Record<Severity, number>;
  };
  findings: Array<{
    id: string;
    title: string;
    severity: Severity;
    category: string;
    description: string;
    recommendation: string;
  }>;
  proofOfConcepts?: Array<{
    format: string;
    description: string;
    code: string;
  }>;
  rawRequest?: {
    method: HttpMethod;
    url: string;
    headers: Record<string, string>;
    body: string;
  };
  customNotes?: string;
}
