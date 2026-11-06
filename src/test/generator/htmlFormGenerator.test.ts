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
});
