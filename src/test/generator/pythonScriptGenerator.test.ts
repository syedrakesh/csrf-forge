import { describe, it, expect } from 'vitest';
import { generatePythonScriptPoc } from '../../lib/generator/pythonScriptGenerator';
import { ParsedRequest } from '../../types';

describe('Python Script Generator', () => {
  const req: ParsedRequest = {
    id: 'req-py',
    method: 'POST',
    url: 'https://security-audit.local/api/action',
    headers: { host: 'security-audit.local' },
    cookies: { session_token: 'tok_abc999' },
    body: 'action=approve',
    contentType: 'application/x-www-form-urlencoded',
    timestamp: Date.now(),
  };

  it('generates executable Python script with requests.Session and cookies', () => {
    const script = generatePythonScriptPoc(req);

    expect(script).toContain('#!/usr/bin/env python3');
    expect(script).toContain('import requests');
    expect(script).toContain('session.cookies.set');
    expect(script).toContain('session_token');
    expect(script).toContain('tok_abc999');
    expect(script).toContain('session.post(');
    expect(script).toContain('https://security-audit.local/api/action');
  });

  it('includes pre-flight trigger in Python script when preflight is enabled', () => {
    const script = generatePythonScriptPoc(req, {
      preflight: {
        enabled: true,
        url: 'https://security-audit.local/seed-cookie',
      },
    });

    expect(script).toContain('preflight_url = "https://security-audit.local/seed-cookie"');
    expect(script).toContain('session.get(preflight_url, timeout=10)');
  });
});
