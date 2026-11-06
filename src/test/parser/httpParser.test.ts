import { describe, it, expect } from 'vitest';
import { parseRawHttpRequest, parseUrlEncodedBody, extractQueryParams } from '../../lib/parser/httpParser';

describe('HTTP Parser (httpParser.ts)', () => {
  it('parses a standard POST request with headers and body', () => {
    const raw = `POST /api/v1/update-email HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded
Cookie: session=xyz123; role=admin
Content-Length: 21

email=test@domain.com`;

    const res = parseRawHttpRequest(raw);
    expect(res.success).toBe(true);
    expect(res.request).toBeDefined();
    expect(res.request?.method).toBe('POST');
    expect(res.request?.url).toBe('https://example.com/api/v1/update-email');
    expect(res.request?.headers['host']).toBe('example.com');
    expect(res.request?.cookies['session']).toBe('xyz123');
    expect(res.request?.cookies['role']).toBe('admin');
    expect(res.request?.body).toBe('email=test@domain.com');
  });

  it('parses GET request with query parameters', () => {
    const raw = `GET /search?q=csrf&category=security HTTP/1.1
Host: vuln-app.org
User-Agent: SecurityScanner/1.0`;

    const res = parseRawHttpRequest(raw);
    expect(res.success).toBe(true);
    expect(res.request?.method).toBe('GET');
    expect(res.request?.url).toBe('https://vuln-app.org/search?q=csrf&category=security');

    const params = extractQueryParams(res.request!.url);
    expect(params['q']).toBe('csrf');
    expect(params['category']).toBe('security');
  });

  it('handles absolute URL in request line', () => {
    const raw = `DELETE https://api.service.io/items/42 HTTP/1.1
Authorization: Bearer token123`;

    const res = parseRawHttpRequest(raw);
    expect(res.success).toBe(true);
    expect(res.request?.method).toBe('DELETE');
    expect(res.request?.url).toBe('https://api.service.io/items/42');
  });

  it('fails gracefully on empty input', () => {
    const res = parseRawHttpRequest('   ');
    expect(res.success).toBe(false);
    expect(res.error?.message).toContain('Input cannot be empty');
  });

  it('parses URL-encoded body correctly with + and encoded characters', () => {
    const body = 'param1=hello+world&email=test%40example.com&empty=';
    const parsed = parseUrlEncodedBody(body);
    expect(parsed['param1']).toBe('hello world');
    expect(parsed['email']).toBe('test@example.com');
    expect(parsed['empty']).toBe('');
  });
});
