import { describe, it, expect } from 'vitest';
import { parseCurlCommand } from '../../lib/parser/curlParser';

describe('cURL Parser (curlParser.ts)', () => {
  it('parses basic cURL command with URL and data flag', () => {
    const cmd = `curl -X POST https://bank.target/transfer -d "amount=100&to=bob"`;
    const res = parseCurlCommand(cmd);

    expect(res.success).toBe(true);
    expect(res.request?.method).toBe('POST');
    expect(res.request?.url).toBe('https://bank.target/transfer');
    expect(res.request?.body).toBe('amount=100&to=bob');
  });

  it('parses multiline cURL with headers and cookies', () => {
    const cmd = `curl 'https://shop.example/checkout' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -H 'Origin: https://shop.example' \\
  -b 'session_id=sess_999; token=sec_abc' \\
  --data 'item_id=123&qty=1'`;

    const res = parseCurlCommand(cmd);
    expect(res.success).toBe(true);
    expect(res.request?.method).toBe('POST');
    expect(res.request?.url).toBe('https://shop.example/checkout');
    expect(res.request?.headers['origin']).toBe('https://shop.example');
    expect(res.request?.cookies['session_id']).toBe('sess_999');
    expect(res.request?.cookies['token']).toBe('sec_abc');
    expect(res.request?.body).toBe('item_id=123&qty=1');
  });

  it('parses cURL with basic auth flag', () => {
    const cmd = `curl -u admin:secret123 https://internal.dev/metrics`;
    const res = parseCurlCommand(cmd);

    expect(res.success).toBe(true);
    expect(res.request?.method).toBe('GET');
    expect(res.request?.headers['authorization']).toContain('Basic');
  });

  it('detects JSON body when body starts with curly brace', () => {
    const cmd = `curl -X POST https://api.site.com/v1 -d '{"active": true}'`;
    const res = parseCurlCommand(cmd);

    expect(res.success).toBe(true);
    expect(res.request?.contentType).toBe('application/json');
  });

  it('fails gracefully when command does not start with curl', () => {
    const res = parseCurlCommand('wget https://example.com');
    expect(res.success).toBe(false);
    expect(res.error?.message).toContain('Command does not start with "curl"');
  });
});
