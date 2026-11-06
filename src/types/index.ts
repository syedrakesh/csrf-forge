/** HTTP methods supported for CSRF testing */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

/** Content types commonly seen in HTTP requests */
export type ContentType =
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'application/json'
  | 'text/plain'
  | 'text/xml'
  | 'application/xml'
  | string;

/** Parsed HTTP request representation */
export interface ParsedRequest {
  id: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: string;
  contentType: ContentType;
  cookies: Record<string, string>;
  timestamp: number;
}

/** CSRF vulnerability severity levels */
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/** CSRF vulnerability finding */
export interface VulnerabilityFinding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: string;
  recommendation: string;
}

/** Analysis result for a parsed request */
export interface AnalysisResult {
  requestId: string;
  isVulnerable: boolean;
  riskScore: number;
  findings: VulnerabilityFinding[];
  timestamp: number;
}

/** CSRF PoC output format */
export type PocFormat = 'html-form' | 'html-ajax' | 'html-fetch' | 'html-img' | 'python' | 'curl';

/** Generated CSRF PoC */
export interface GeneratedPoc {
  id: string;
  requestId: string;
  format: PocFormat;
  code: string;
  description: string;
  timestamp: number;
}

/** Saved project */
export interface Project {
  id: string;
  name: string;
  description: string;
  requests: ParsedRequest[];
  analyses: AnalysisResult[];
  pocs: GeneratedPoc[];
  createdAt: number;
  updatedAt: number;
}

/** Export format options */
export type ExportFormat = 'html' | 'pdf' | 'json' | 'markdown';

/** Application state */
export interface AppState {
  currentRequest: ParsedRequest | null;
  currentAnalysis: AnalysisResult | null;
  generatedPocs: GeneratedPoc[];
  projects: Project[];
}
