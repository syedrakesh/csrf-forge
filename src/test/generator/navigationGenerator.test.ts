import { describe, it, expect } from 'vitest';
import { generateNavigationPoc } from '../../lib/generator/navigationGenerator';
import { ParsedRequest } from '../../types';

describe('Top-Level Navigation PoC Generator', () => {
  const req: ParsedRequest = {
    id: 'req-nav-1',
    method: 'GET',
    url: 'https://0aa3.web-security-academy.net/my-account/change-email?email=wiener%40normal-user.net&_method=POST',
    headers: { host: '0aa3.web-security-academy.net' },
    cookies: { session: '94sgpXvw' },
    body: '',
    contentType: 'application/x-www-form-urlencoded',
    timestamp: Date.now(),
  };

  it('generates auto-redirecting top-level navigation script', () => {
    const poc = generateNavigationPoc(req, { autoSubmit: true });

    expect(poc).toContain('window.location.href =');
    expect(poc).toContain('https://0aa3.web-security-academy.net/my-account/change-email?email=wiener%40normal-user.net&_method=POST');
  });

  it('supports custom parameter overrides in navigation URL', () => {
    const poc = generateNavigationPoc(req, {
      customParameters: {
        email: 'pwned@attacker.net',
        _method: 'POST',
      },
    });

    expect(poc).toContain('email=pwned%40attacker.net');
    expect(poc).toContain('_method=POST');
  });

  it('generates delayed navigation when delayMs is configured', () => {
    const poc = generateNavigationPoc(req, { autoSubmit: true, delayMs: 1500 });

    expect(poc).toContain('setTimeout(function() { window.location.href =');
    expect(poc).toContain('1500');
  });

  it('generates button trigger when autoSubmit is false', () => {
    const poc = generateNavigationPoc(req, { autoSubmit: false, buttonText: 'Click to Update' });

    expect(poc).toContain('Click to Update');
    expect(poc).toContain('onclick="window.location.href=');
  });

  it('appends _method override to existing URL when methodOverride is set', () => {
    const simpleReq: ParsedRequest = {
      id: 'req-nav-override',
      method: 'GET',
      url: 'https://victim.com/change-email?email=test%40test.com',
      headers: { host: 'victim.com' },
      cookies: { session: 'xyz' },
      body: '',
      contentType: 'application/x-www-form-urlencoded',
      timestamp: Date.now(),
    };

    const poc = generateNavigationPoc(simpleReq, { methodOverride: 'POST' });

    expect(poc).toContain('_method=POST');
    expect(poc).toContain('window.location.href');
  });

  it('includes _method in custom parameters when both customParameters and methodOverride are set', () => {
    const poc = generateNavigationPoc(req, {
      customParameters: { email: 'pwned@attacker.net' },
      methodOverride: 'DELETE',
    });

    expect(poc).toContain('email=pwned%40attacker.net');
    expect(poc).toContain('_method=DELETE');
  });
});

