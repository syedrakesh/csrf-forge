import { describe, it, expect } from 'vitest';
import { analyzeCsrfRequest } from '../../lib/analyzer/csrfAnalyzer';
import { ParsedRequest } from '../../types';

describe('CSRF Analyzer (csrfAnalyzer.ts)', () => {
  const baseRequest: ParsedRequest = {
    id: 'test-1',
    method: 'POST',
    url: 'https://vulnerable.app/api/transfer',
    headers: {
      host: 'vulnerable.app',
      cookie: 'session_id=12345',
      'content-type': 'application/x-www-form-urlencoded',
    },
    cookies: {
      session_id: '12345',
    },
    body: 'recipient=attacker&amount=5000',
    contentType: 'application/x-www-form-urlencoded',
    timestamp: Date.now(),
  };

  it('detects missing anti-CSRF token on authenticated POST request', () => {
    const analysis = analyzeCsrfRequest(baseRequest);
    expect(analysis.isVulnerable).toBe(true);

    const tokenFinding = analysis.findings.find((f) => f.id === 'MISSING_ANTI_CSRF_TOKEN');
    expect(tokenFinding).toBeDefined();
    expect(tokenFinding?.severity).toBe('critical');
  });

  it('recognizes anti-CSRF token in headers and lowers risk', () => {
    const reqWithHeader: ParsedRequest = {
      ...baseRequest,
      headers: {
        ...baseRequest.headers,
        'x-csrf-token': 'token_secure_999',
      },
    };

    const analysis = analyzeCsrfRequest(reqWithHeader);
    const missingFinding = analysis.findings.find((f) => f.id === 'MISSING_ANTI_CSRF_TOKEN');
    expect(missingFinding).toBeUndefined();

    const defenseFinding = analysis.findings.find((f) => f.id === 'CUSTOM_HEADER_DEFENSE_PRESENT');
    expect(defenseFinding).toBeDefined();
  });

  it('recognizes anti-CSRF token in body parameters', () => {
    const reqWithBodyToken: ParsedRequest = {
      ...baseRequest,
      body: 'recipient=attacker&amount=5000&csrf_token=random_secret_nonce',
    };

    const analysis = analyzeCsrfRequest(reqWithBodyToken);
    const bodyTokenFinding = analysis.findings.find((f) => f.id === 'TOKEN_IN_BODY_PRESENT');
    expect(bodyTokenFinding).toBeDefined();
  });

  it('flags state-changing operations via GET requests', () => {
    const getRequest: ParsedRequest = {
      id: 'test-get',
      method: 'GET',
      url: 'https://app.com/account/delete?user_id=12',
      headers: {
        host: 'app.com',
        cookie: 'sid=abc',
      },
      cookies: {
        sid: 'abc',
      },
      body: '',
      contentType: '',
      timestamp: Date.now(),
    };

    const analysis = analyzeCsrfRequest(getRequest);
    const getFinding = analysis.findings.find((f) => f.id === 'UNSAFE_GET_STATE_CHANGE');
    expect(getFinding).toBeDefined();
    expect(getFinding?.severity).toBe('critical');
  });

  it('notes absence of session cookies as low vulnerability', () => {
    const unauthenticatedReq: ParsedRequest = {
      ...baseRequest,
      headers: { host: 'vulnerable.app' },
      cookies: {},
    };

    const analysis = analyzeCsrfRequest(unauthenticatedReq);
    const noAuthFinding = analysis.findings.find((f) => f.id === 'NO_SESSION_AUTH_DETECTED');
    expect(noAuthFinding).toBeDefined();
    expect(analysis.isVulnerable).toBe(false);
  });

  it('detects method override parameter on GET requests as SameSite bypass risk', () => {
    const overrideReq: ParsedRequest = {
      id: 'test-override',
      method: 'GET',
      url: 'https://app.com/change-email?email=test%40evil.com&_method=POST',
      headers: {
        host: 'app.com',
        cookie: 'session=xyz987',
      },
      cookies: {
        session: 'xyz987',
      },
      body: '',
      contentType: '',
      timestamp: Date.now(),
    };

    const analysis = analyzeCsrfRequest(overrideReq);
    const overrideFinding = analysis.findings.find((f) => f.id === 'METHOD_OVERRIDE_DETECTED');
    expect(overrideFinding).toBeDefined();
    expect(overrideFinding?.title).toContain('_method=POST');
    expect(overrideFinding?.severity).toBe('critical');
    expect(analysis.isVulnerable).toBe(true);
  });
});
