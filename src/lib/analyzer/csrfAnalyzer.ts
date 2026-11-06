import { ParsedRequest, AnalysisResult, VulnerabilityFinding } from '../../types';
import { calculateRiskScore } from './riskScorer';
import { REMEDIATION_CATALOG } from './remediations';
import { parseUrlEncodedBody } from '../parser/httpParser';

// Known anti-CSRF token patterns in headers and body
const CSRF_HEADER_KEYS = [
  'x-csrf-token',
  'x-xsrf-token',
  'csrf-token',
  'xsrf-token',
  'x-csrftoken',
  'anti-csrf-token',
  'x-authenticity-token',
];

const CSRF_BODY_KEYS = [
  'csrf',
  '_csrf',
  'csrftoken',
  'csrf_token',
  'xsrf_token',
  'authenticity_token',
  '__requestverificationtoken',
  'token',
  'nonce',
];

// Sensitive action keywords in URL or body
const SENSITIVE_KEYWORDS = [
  'transfer',
  'email',
  'password',
  'delete',
  'update',
  'change',
  'admin',
  'role',
  'permission',
  'buy',
  'order',
  'withdraw',
  'pay',
];

/**
 * Heuristically evaluates a parsed HTTP request for CSRF risks.
 */
export function analyzeCsrfRequest(request: ParsedRequest): AnalysisResult {
  const findings: VulnerabilityFinding[] = [];
  const method = request.method.toUpperCase();
  const urlLower = request.url.toLowerCase();
  const headers = request.headers;
  const cookies = request.cookies;
  const hasCookies = Object.keys(cookies).length > 0;

  // 1. HTTP Method Evaluation
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const isSafeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(method);

  // Check if sensitive action is invoked via GET (Severe CSRF pattern)
  if (isSafeMethod) {
    const hasSensitiveKeyword = SENSITIVE_KEYWORDS.some((kw) => urlLower.includes(kw));
    const hasQueryArgs = request.url.includes('?') && request.url.split('?')[1]?.length;

    if (hasSensitiveKeyword && hasQueryArgs) {
      findings.push({
        id: 'UNSAFE_GET_STATE_CHANGE',
        title: 'State-Changing Operation via GET Request',
        description: `The request uses the HTTP ${method} method with parameter-driven action keywords (${request.url}). GET requests can be invoked by attackers using zero-click elements such as <img src="..."> or <link rel="prefetch">.`,
        severity: hasCookies ? 'critical' : 'high',
        category: 'HTTP Method Architecture',
        recommendation: REMEDIATION_CATALOG.AVOID_GET_STATE_CHANGE?.summary ?? 'Convert endpoint to POST with CSRF tokens.',
      });
    }
  }

  // 2. Cookie & Authentication Check
  if (!hasCookies && !headers['authorization']) {
    findings.push({
      id: 'NO_SESSION_AUTH_DETECTED',
      title: 'No Ambient Credentials or Cookies Detected',
      description:
        'The request does not contain Cookie headers or ambient session identifiers. CSRF relies on ambient browser credentials (automatic cookie submission). If authentication is handled solely via Authorization headers stored in memory (e.g. Bearer JWT), CSRF vulnerability is low.',
      severity: 'info',
      category: 'Authentication Context',
      recommendation: 'Ensure tokens are never stored in or mirrored into automatic ambient cookies.',
    });
  }

  // 3. Anti-CSRF Token Detection in Headers
  let hasCsrfHeader = false;
  for (const key of Object.keys(headers)) {
    if (CSRF_HEADER_KEYS.includes(key.toLowerCase())) {
      hasCsrfHeader = true;
      break;
    }
  }

  // 4. Anti-CSRF Token Detection in Body
  let hasCsrfBodyToken = false;
  let detectedTokenField = '';

  if (request.body) {
    // If form urlencoded
    const parsedBody = parseUrlEncodedBody(request.body);
    for (const key of Object.keys(parsedBody)) {
      if (CSRF_BODY_KEYS.includes(key.toLowerCase())) {
        hasCsrfBodyToken = true;
        detectedTokenField = key;
        break;
      }
    }

    // If JSON
    if (!hasCsrfBodyToken && (request.body.startsWith('{') || request.contentType?.includes('json'))) {
      try {
        const json = JSON.parse(request.body);
        for (const key of Object.keys(json)) {
          if (CSRF_BODY_KEYS.includes(key.toLowerCase())) {
            hasCsrfBodyToken = true;
            detectedTokenField = key;
            break;
          }
        }
      } catch {
        // Not valid JSON
      }
    }
  }

  // Evaluate Missing Tokens on State Changing requests
  if (isStateChanging && hasCookies) {
    if (!hasCsrfHeader && !hasCsrfBodyToken) {
      findings.push({
        id: 'MISSING_ANTI_CSRF_TOKEN',
        title: 'Absence of Anti-CSRF Defense Token',
        description:
          'No anti-CSRF token was identified in either the request headers (e.g. X-CSRF-Token) or request body parameters. A malicious webpage can trigger this action on behalf of an authenticated victim.',
        severity: 'critical',
        category: 'Cryptographic Protection',
        recommendation: REMEDIATION_CATALOG.SYNCHRONIZER_TOKEN?.summary ?? 'Implement per-session synchronizer CSRF tokens.',
      });
    } else if (hasCsrfBodyToken) {
      findings.push({
        id: 'TOKEN_IN_BODY_PRESENT',
        title: `Anti-CSRF Token Present in Body (${detectedTokenField})`,
        description: `Identified candidate anti-CSRF token field: "${detectedTokenField}". Verify that this token is cryptographically random, validated on the server side, and unique per user session.`,
        severity: 'low',
        category: 'Cryptographic Protection',
        recommendation: 'Ensure token validation cannot be bypassed by removing the parameter or altering the Content-Type.',
      });
    } else if (hasCsrfHeader) {
      findings.push({
        id: 'CUSTOM_HEADER_DEFENSE_PRESENT',
        title: 'Custom CSRF Header Present',
        description:
          'The request contains a custom header which standard cross-origin HTML forms cannot forge without triggering a CORS preflight request.',
        severity: 'info',
        category: 'Header Verification',
        recommendation: 'Ensure backend strictly rejects requests where this header is omitted.',
      });
    }
  }

  // 5. Content-Type Preflight Relaxation Risk
  const contentType = (request.contentType || '').toLowerCase();
  const isSimpleContentType =
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data') ||
    contentType.includes('text/plain');

  if (isStateChanging && isSimpleContentType) {
    findings.push({
      id: 'SIMPLE_REQUEST_CONTENT_TYPE',
      title: 'Simple Request Content-Type (No CORS Preflight)',
      description: `The request uses Content-Type "${contentType}". Standard web browsers permit cross-origin form submissions and POST requests with this content type without sending a CORS preflight (OPTIONS) request.`,
      severity: hasCookies && !hasCsrfHeader && !hasCsrfBodyToken ? 'high' : 'medium',
      category: 'Browser Transport Security',
      recommendation: REMEDIATION_CATALOG.CUSTOM_HEADER?.summary ?? 'Require custom headers to enforce CORS preflight.',
    });
  }

  // 6. SameSite Cookie Attribute Evaluation
  let sameSiteStrictOrLax = false;
  if (headers['cookie']) {
    const rawCookie = headers['cookie'].toLowerCase();
    if (rawCookie.includes('samesite=strict') || rawCookie.includes('samesite=lax')) {
      sameSiteStrictOrLax = true;
    }
  }

  if (hasCookies && !sameSiteStrictOrLax && isStateChanging) {
    findings.push({
      id: 'SAMESITE_COOKIE_UNRESTRICTED',
      title: 'Session Cookies Lack Strict SameSite Restrictions',
      description:
        'Cookies transmitted with this request do not enforce SameSite=Strict or are treated with browser default policies. If the user visits an attacker-controlled site, cookies will be automatically dispatched.',
      severity: 'high',
      category: 'Session Management',
      recommendation: REMEDIATION_CATALOG.SAME_SITE_STRICT?.summary ?? 'Add SameSite=Strict or SameSite=Lax to Set-Cookie.',
    });
  }

  // 7. Origin / Referer Validation Check
  const hasOriginOrReferer = !!(headers['origin'] || headers['referer']);
  if (isStateChanging && !hasOriginOrReferer) {
    findings.push({
      id: 'NO_ORIGIN_VERIFICATION',
      title: 'Missing Origin and Referer Headers',
      description:
        'The captured request lacks Origin or Referer headers. If the server does not enforce source origin verification, cross-origin requests from arbitrary domains may be accepted.',
      severity: 'medium',
      category: 'Header Verification',
      recommendation: REMEDIATION_CATALOG.ORIGIN_REFERER_CHECK?.summary ?? 'Enforce Origin header verification on state-changing endpoints.',
    });
  }

  // Calculate Risk Metrics
  const severities = findings.map((f) => f.severity);
  const metrics = calculateRiskScore(severities);
  // Without ambient credentials (cookies), CSRF cannot be exploited cross-origin
  const isVulnerable = hasCookies && metrics.score >= 5.0;

  return {
    requestId: request.id,
    isVulnerable,
    riskScore: metrics.score,
    findings,
    timestamp: Date.now(),
  };
}
