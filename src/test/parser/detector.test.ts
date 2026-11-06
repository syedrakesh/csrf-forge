import { describe, it, expect } from 'vitest';
import { detectInputFormat, parseInput } from '../../lib/parser/detector';

describe('Format Detector & Universal Parser', () => {
  it('correctly detects cURL commands', () => {
    expect(detectInputFormat('curl https://target.com')).toBe('curl');
    expect(detectInputFormat('  curl -X POST http://a.com  ')).toBe('curl');
  });

  it('correctly detects raw HTTP requests', () => {
    const raw = `POST /path HTTP/1.1\nHost: target.com\n\nbody`;
    expect(detectInputFormat(raw)).toBe('raw-http');
  });

  it('delegates to curl parser when input is cURL', () => {
    const res = parseInput('curl https://target.com/api -d "a=1"');
    expect(res.success).toBe(true);
    expect(res.request?.url).toBe('https://target.com/api');
  });

  it('delegates to HTTP parser when input is raw HTTP', () => {
    const res = parseInput('GET /endpoint HTTP/1.1\nHost: test.corp\n\n');
    expect(res.success).toBe(true);
    expect(res.request?.url).toBe('https://test.corp/endpoint');
  });
});
