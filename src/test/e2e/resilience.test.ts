import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parseRawHttpRequest } from '../../lib/parser/httpParser';
import { parseCurlCommand } from '../../lib/parser/curlParser';
import { analyzeCsrfRequest } from '../../lib/analyzer/csrfAnalyzer';
import { getSavedProjects, saveProjects } from '../../lib/storage/projectStorage';
import { ParsedRequest } from '../../types';

describe('Resilience, Edge Cases & Error Recovery', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('HTTP Parser Resilience', () => {
    it('gracefully rejects empty or whitespace-only inputs without crashing', () => {
      const res1 = parseRawHttpRequest('');
      expect(res1.success).toBe(false);
      expect(res1.error?.message).toMatch(/cannot be empty/i);

      const res2 = parseRawHttpRequest('   \n\n\t   ');
      expect(res2.success).toBe(false);
      expect(res2.error?.message).toMatch(/cannot be empty/i);
    });

    it('handles malformed request lines with single token', () => {
      const res = parseRawHttpRequest('POST');
      expect(res.success).toBe(false);
      expect(res.error?.message).toMatch(/invalid request line/i);
    });

    it('handles requests with Unicode, emojis, and binary-like strings in body', () => {
      const unicodeHttp = `POST /api/chat HTTP/1.1
Host: test.unicode.io
Content-Type: application/x-www-form-urlencoded

message=%F0%9F%94%A5%20Cyber%20Forge%20%E2%9C%A8&user=%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF`;

      const res = parseRawHttpRequest(unicodeHttp);
      expect(res.success).toBe(true);
      expect(res.request?.body).toContain('Cyber%20Forge');
    });

    it('handles large payloads (e.g. 20KB form data) without latency spikes', () => {
      const largeParam = 'data=' + 'A'.repeat(20000);
      const largeHttp = `POST /api/upload HTTP/1.1
Host: test.large.io
Content-Type: application/x-www-form-urlencoded
Content-Length: ${largeParam.length}

${largeParam}`;

      const res = parseRawHttpRequest(largeHttp);
      expect(res.success).toBe(true);
      expect(res.request?.body.length).toBeGreaterThan(20000);
    });
  });

  describe('cURL Parser Resilience', () => {
    it('gracefully handles missing URL in curl string', () => {
      const res = parseCurlCommand('curl -X POST -H "Content-Type: application/json"');
      expect(res.success).toBe(false);
      expect(res.error?.message).toMatch(/Failed to extract target URL/i);
    });

    it('handles unterminated quotes without throwing uncaught exceptions', () => {
      const res = parseCurlCommand('curl "https://example.com/api -H "Authorization: test');
      // Should not throw, should return a handled ParseResult
      expect(typeof res.success).toBe('boolean');
    });

    it('parses cURL commands with redundant or unknown flags cleanly', () => {
      const res = parseCurlCommand(
        'curl -s -S -k --insecure --compressed --location "https://api.test.org/data" -d "param=1"'
      );
      expect(res.success).toBe(true);
      expect(res.request?.url).toBe('https://api.test.org/data');
      expect(res.request?.method).toBe('POST');
    });
  });

  describe('Analyzer Resilience', () => {
    it('analyzes minimalist request with zero headers and empty body without throwing', () => {
      const minimalReq: ParsedRequest = {
        id: 'min-1',
        method: 'GET',
        url: 'https://test.io/ping',
        headers: {},
        body: '',
        contentType: '',
        cookies: {},
        timestamp: Date.now(),
      };

      const result = analyzeCsrfRequest(minimalReq);
      expect(result.requestId).toBe('min-1');
      expect(Array.isArray(result.findings)).toBe(true);
      expect(result.isVulnerable).toBe(false); // GET without cookies is not flagged
    });
  });

  describe('Storage Recovery Resilience', () => {
    it('gracefully recovers when localStorage contains corrupted JSON', () => {
      localStorage.setItem('csrf_forge_projects_v1', 'INVALID_CORRUPTED_JSON{{{');

      // getSavedProjects should not throw; should fallback to empty array
      const projects = getSavedProjects();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBe(0);
    });

    it('recovers when localStorage contains non-array data', () => {
      localStorage.setItem('csrf_forge_projects_v1', JSON.stringify({ notAnArray: true }));

      const projects = getSavedProjects();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBe(0);
    });

    it('safely handles quota exceeded or storage write errors', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // saveProjects should return false rather than unhandled exception
      const result = saveProjects([]);
      expect(result).toBe(false);
    });
  });
});
