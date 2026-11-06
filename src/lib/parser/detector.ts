import { parseRawHttpRequest, ParseResult } from './httpParser';
import { parseCurlCommand } from './curlParser';

export type InputFormat = 'raw-http' | 'curl' | 'unknown';

/**
 * Detects whether the given input string looks like a cURL command or raw HTTP.
 */
export function detectInputFormat(input: string): InputFormat {
  const trimmed = input.trim();
  if (!trimmed) return 'unknown';

  if (trimmed.toLowerCase().startsWith('curl')) {
    return 'curl';
  }

  const firstLine = (trimmed.split('\n')[0] ?? '').trim();
  const httpMethodRegex = /^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s+\S+(\s+HTTP\/\d(\.\d)?)?$/i;

  if (httpMethodRegex.test(firstLine)) {
    return 'raw-http';
  }

  // Fallback: check if contains typical HTTP headers
  if (trimmed.includes('Host:') || trimmed.includes('Content-Type:') || trimmed.includes('User-Agent:')) {
    return 'raw-http';
  }

  return 'unknown';
}

/**
 * Universal parser that detects input format and delegates to appropriate parser.
 */
export function parseInput(input: string): ParseResult {
  const format = detectInputFormat(input);

  if (format === 'curl') {
    return parseCurlCommand(input);
  }

  if (format === 'raw-http') {
    return parseRawHttpRequest(input);
  }

  // If unknown, attempt raw HTTP first, then curl
  const httpResult = parseRawHttpRequest(input);
  if (httpResult.success) return httpResult;

  const curlResult = parseCurlCommand(input);
  if (curlResult.success) return curlResult;

  return {
    success: false,
    error: {
      message: 'Unrecognized request format. Please paste a valid raw HTTP request or cURL command.',
    },
  };
}
