import { describe, it, expect } from 'vitest';
import { compilePoc } from '../../lib/generator/pocCompiler';
import { ParsedRequest } from '../../types';

describe('PoC Compiler', () => {
  const req: ParsedRequest = {
    id: 'req-c',
    method: 'POST',
    url: 'https://site.com/do',
    headers: { host: 'site.com' },
    cookies: { sid: '1' },
    body: 'x=1',
    contentType: 'application/x-www-form-urlencoded',
    timestamp: Date.now(),
  };

  it('compiles HTML form correctly', () => {
    const poc = compilePoc(req, 'html-form');
    expect(poc.format).toBe('html-form');
    expect(poc.code).toContain('<form');
  });

  it('compiles Fetch API correctly', () => {
    const poc = compilePoc(req, 'html-fetch');
    expect(poc.format).toBe('html-fetch');
    expect(poc.code).toContain('fetch(');
  });

  it('compiles Python script correctly', () => {
    const poc = compilePoc(req, 'python');
    expect(poc.format).toBe('python');
    expect(poc.code).toContain('requests.Session()');
  });

  it('compiles Image beacon for GET requests', () => {
    const getReq: ParsedRequest = { ...req, method: 'GET', url: 'https://site.com/logout' };
    const poc = compilePoc(getReq, 'html-img');
    expect(poc.format).toBe('html-img');
    expect(poc.code).toContain('<img src="https://site.com/logout"');
  });
});
