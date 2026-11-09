import { describe, it, expect } from 'vitest';
import { generateFetchPoc, generateXhrPoc } from '../../lib/generator/fetchXhrGenerator';
import { ParsedRequest } from '../../types';

describe('Fetch and XHR Generator', () => {
  const req: ParsedRequest = {
    id: 'req-2',
    method: 'POST',
    url: 'https://api.app.io/v1/update',
    headers: { host: 'api.app.io' },
    cookies: { auth: 'jwt_xyz' },
    body: 'role=admin',
    contentType: 'application/x-www-form-urlencoded',
    timestamp: Date.now(),
  };

  it('generates fetch payload with credentials: include and mode: no-cors', () => {
    const poc = generateFetchPoc(req);

    expect(poc).toContain("credentials: 'include'");
    expect(poc).toContain("mode: 'no-cors'");
    expect(poc).toContain('https://api.app.io/v1/update');
    expect(poc).toContain('role=admin');
  });

  it('generates XHR payload with withCredentials = true', () => {
    const poc = generateXhrPoc(req);

    expect(poc).toContain('xhr.withCredentials = true');
    expect(poc).toContain('https://api.app.io/v1/update');
    expect(poc).toContain('POST');
  });

  it('includes pre-flight trigger in Fetch PoC when preflight is enabled', () => {
    const poc = generateFetchPoc(req, {
      preflight: {
        enabled: true,
        url: 'https://api.app.io/?search=test%0d%0aSet-Cookie:token=123',
      },
    });

    expect(poc).toContain('await fetch("https://api.app.io/?search=test%0d%0aSet-Cookie:token=123", { mode: \'no-cors\' });');
  });

  it('includes pre-flight image trigger in XHR PoC when preflight is enabled', () => {
    const poc = generateXhrPoc(req, {
      preflight: {
        enabled: true,
        url: 'https://api.app.io/seed-cookie',
      },
    });

    expect(poc).toContain('preImg.src = "https://api.app.io/seed-cookie";');
    expect(poc).toContain('preImg.onload = preImg.onerror = function()');
  });
});
