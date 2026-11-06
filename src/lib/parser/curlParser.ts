import { HttpMethod, ContentType } from '../../types';
import { ParseResult } from './httpParser';

/**
 * Tokenizes a shell command string, taking into account single and double quotes,
 * backslash escapes, and multiline commands.
 */
function tokenizeCommand(command: string): string[] {
  // Normalize escaped newlines
  const normalized = command.replace(/\\\r?\n/g, ' ').trim();
  const tokens: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let isEscaped = false;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];

    if (isEscaped) {
      current += char;
      isEscaped = false;
      continue;
    }

    if (char === '\\' && !inSingleQuote) {
      isEscaped = true;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (/\s/.test(char ?? '') && !inSingleQuote && !inDoubleQuote) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * Parses a cURL command into a structured ParsedRequest
 */
export function parseCurlCommand(rawCommand: string): ParseResult {
  const trimmed = rawCommand.trim();
  if (!trimmed) {
    return {
      success: false,
      error: { message: 'Input cURL command cannot be empty' },
    };
  }

  if (!trimmed.toLowerCase().startsWith('curl')) {
    return {
      success: false,
      error: { message: 'Command does not start with "curl"' },
    };
  }

  const tokens = tokenizeCommand(trimmed);
  let method: HttpMethod = 'GET';
  let url = '';
  const headers: Record<string, string> = {};
  const cookies: Record<string, string> = {};
  const bodyParts: string[] = [];
  let explicitMethod = false;

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i] ?? '';

    // Method flag: -X, --request
    if (token === '-X' || token === '--request') {
      const nextToken = tokens[++i];
      if (nextToken) {
        method = nextToken.toUpperCase() as HttpMethod;
        explicitMethod = true;
      }
      continue;
    }

    // Headers: -H, --header
    if (token === '-H' || token === '--header') {
      const headerStr = tokens[++i];
      if (headerStr) {
        const colonIdx = headerStr.indexOf(':');
        if (colonIdx !== -1) {
          const key = headerStr.slice(0, colonIdx).trim().toLowerCase();
          const value = headerStr.slice(colonIdx + 1).trim();
          headers[key] = value;

          if (key === 'cookie') {
            const parts = value.split(';');
            for (const p of parts) {
              const [cKey, ...cVal] = p.split('=');
              if (cKey) cookies[cKey.trim()] = cVal.join('=').trim();
            }
          }
        }
      }
      continue;
    }

    // Body / Data: -d, --data, --data-raw, --data-urlencode, --data-binary
    if (
      token === '-d' ||
      token === '--data' ||
      token === '--data-raw' ||
      token === '--data-urlencode' ||
      token === '--data-binary'
    ) {
      const dataStr = tokens[++i];
      if (dataStr) {
        bodyParts.push(dataStr);
        if (!explicitMethod) {
          method = 'POST';
        }
      }
      continue;
    }

    // Cookies: -b, --cookie
    if (token === '-b' || token === '--cookie') {
      const cookieStr = tokens[++i];
      if (cookieStr) {
        // Can be a string "key=value; key2=val2"
        const parts = cookieStr.split(';');
        for (const p of parts) {
          const [cKey, ...cVal] = p.split('=');
          if (cKey) cookies[cKey.trim()] = cVal.join('=').trim();
        }
        if (!headers['cookie']) {
          headers['cookie'] = cookieStr;
        }
      }
      continue;
    }

    // User Agent: -A, --user-agent
    if (token === '-A' || token === '--user-agent') {
      const uaStr = tokens[++i];
      if (uaStr) headers['user-agent'] = uaStr;
      continue;
    }

    // Referer: -e, --referer
    if (token === '-e' || token === '--referer') {
      const refStr = tokens[++i];
      if (refStr) headers['referer'] = refStr;
      continue;
    }

    // Basic Auth: -u, --user
    if (token === '-u' || token === '--user') {
      const authStr = tokens[++i];
      if (authStr) {
        try {
          headers['authorization'] = `Basic ${btoa(authStr)}`;
        } catch {
          // Ignore btoa failure in non-ascii
        }
      }
      continue;
    }

    // Target URL (token that starts with http:// or https://, or a non-flag token)
    if (!token.startsWith('-') && !url) {
      url = token;
    }
  }

  if (!url) {
    return {
      success: false,
      error: { message: 'Failed to extract target URL from cURL command' },
    };
  }

  // Ensure protocol is present
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  const body = bodyParts.join('&');
  let contentType: ContentType = headers['content-type'] ?? '';

  if (!contentType && body) {
    if (body.startsWith('{') || body.startsWith('[')) {
      contentType = 'application/json';
    } else {
      contentType = 'application/x-www-form-urlencoded';
    }
    headers['content-type'] = contentType;
  }

  return {
    success: true,
    request: {
      id: `curl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      method,
      url,
      headers,
      body,
      contentType: contentType || 'application/x-www-form-urlencoded',
      cookies,
      timestamp: Date.now(),
    },
  };
}
