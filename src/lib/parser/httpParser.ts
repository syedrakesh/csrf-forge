import { ParsedRequest, HttpMethod, ContentType } from '../../types';

export interface ParseError {
  message: string;
  line?: number;
}

export interface ParseResult {
  success: boolean;
  request?: ParsedRequest;
  error?: ParseError;
}

/**
 * Parses a raw HTTP request string (e.g. from Burp Suite, OWASP ZAP, or DevTools).
 */
export function parseRawHttpRequest(raw: string, defaultHost = 'https://localhost'): ParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      success: false,
      error: { message: 'Input cannot be empty' },
    };
  }

  // Split headers and body by double newline (support \r\n and \n)
  const headerBodySplit = trimmed.split(/\r?\n\r?\n/);
  const headerSection = headerBodySplit[0] ?? '';
  const bodySection = headerBodySplit.slice(1).join('\n\n');

  const lines = headerSection.split(/\r?\n/);
  if (lines.length === 0 || !lines[0]) {
    return {
      success: false,
      error: { message: 'Malformed HTTP request: missing request line', line: 1 },
    };
  }

  const requestLine = lines[0].trim();
  const requestLineParts = requestLine.split(/\s+/);

  if (requestLineParts.length < 2) {
    return {
      success: false,
      error: {
        message: 'Invalid request line. Expected format: METHOD PATH [HTTP/VERSION]',
        line: 1,
      },
    };
  }

  const methodRaw = requestLineParts[0]?.toUpperCase() as HttpMethod;
  const validMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
  const method: HttpMethod = validMethods.includes(methodRaw) ? methodRaw : 'GET';

  const pathAndQuery = requestLineParts[1] ?? '/';

  // Parse Headers
  const headers: Record<string, string> = {};
  const cookies: Record<string, string> = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim().toLowerCase();
    const value = line.slice(colonIndex + 1).trim();

    headers[key] = value;

    if (key === 'cookie') {
      const cookiePairs = value.split(';');
      for (const pair of cookiePairs) {
        const [cKey, ...cValParts] = pair.split('=');
        if (cKey) {
          cookies[cKey.trim()] = cValParts.join('=').trim();
        }
      }
    }
  }

  // Construct absolute URL
  let fullUrl = pathAndQuery;
  const hostHeader = headers['host'];

  if (pathAndQuery.startsWith('http://') || pathAndQuery.startsWith('https://')) {
    fullUrl = pathAndQuery;
  } else {
    const protocol = headers['x-forwarded-proto'] || 'https';
    if (hostHeader) {
      fullUrl = `${protocol}://${hostHeader}${pathAndQuery.startsWith('/') ? '' : '/'}${pathAndQuery}`;
    } else {
      fullUrl = `${defaultHost}${pathAndQuery.startsWith('/') ? '' : '/'}${pathAndQuery}`;
    }
  }

  const contentType: ContentType = headers['content-type'] || 'application/x-www-form-urlencoded';

  return {
    success: true,
    request: {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      method,
      url: fullUrl,
      headers,
      body: bodySection,
      contentType,
      cookies,
      timestamp: Date.now(),
    },
  };
}

/**
 * Parses application/x-www-form-urlencoded body string into key-value pairs
 */
export function parseUrlEncodedBody(body: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!body.trim()) return result;

  const pairs = body.split('&');
  for (const pair of pairs) {
    if (!pair) continue;
    const [key, ...valParts] = pair.split('=');
    if (key) {
      const decodedKey = decodeURIComponent(key.replace(/\+/g, ' '));
      const rawVal = valParts.join('=');
      const decodedVal = decodeURIComponent(rawVal.replace(/\+/g, ' '));
      result[decodedKey] = decodedVal;
    }
  }
  return result;
}

/**
 * Extracts URL query parameters from full URL
 */
export function extractQueryParams(urlStr: string): Record<string, string> {
  const params: Record<string, string> = {};
  try {
    const parsed = new URL(urlStr);
    parsed.searchParams.forEach((val, key) => {
      params[key] = val;
    });
  } catch {
    const queryIndex = urlStr.indexOf('?');
    if (queryIndex !== -1) {
      const queryPart = urlStr.slice(queryIndex + 1);
      return parseUrlEncodedBody(queryPart);
    }
  }
  return params;
}
