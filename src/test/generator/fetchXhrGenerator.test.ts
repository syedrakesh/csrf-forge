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
});
