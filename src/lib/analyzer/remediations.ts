export interface RemediationGuidance {
  id: string;
  category: string;
  title: string;
  summary: string;
  codeSnippet: string;
  referenceUrl: string;
}

export const REMEDIATION_CATALOG: Record<string, RemediationGuidance> = {
  SAME_SITE_STRICT: {
    id: 'SAME_SITE_STRICT',
    category: 'Session Management',
    title: 'Enforce SameSite=Strict or SameSite=Lax on Session Cookies',
    summary:
      'Configure the SameSite attribute on sensitive session cookies. SameSite=Strict prevents cookies from being sent in any cross-site browsing context. SameSite=Lax allows cookies on top-level safe GET navigations while blocking cross-site POSTs.',
    codeSnippet: `// Express / Node.js
res.cookie('session_id', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict', // or 'lax'
  maxAge: 3600000,
});`,
    referenceUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#samesite-cookie-attribute',
  },
  SYNCHRONIZER_TOKEN: {
    id: 'SYNCHRONIZER_TOKEN',
    category: 'Cryptographic Nonces',
    title: 'Implement the Synchronizer Token Pattern (CSRF Tokens)',
    summary:
      'Generate a cryptographically secure, unpredictable, and per-session or per-request token. Validate this token on the server for all state-changing operations (POST, PUT, DELETE, PATCH).',
    codeSnippet: `// Synchronizer Token Validation Middleware
function verifyCsrfToken(req, res, next) {
  const clientToken = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session.csrfSecret;

  if (!clientToken || !crypto.timingSafeEqual(Buffer.from(clientToken), Buffer.from(sessionToken))) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }
  next();
}`,
    referenceUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#synchronizer-token-pattern',
  },
  CUSTOM_HEADER: {
    id: 'CUSTOM_HEADER',
    category: 'Header Verification',
    title: 'Require Custom Request Headers for State Changes',
    summary:
      'Requiring custom headers (e.g. X-Requested-With or X-CSRF-Token) stops standard HTML form submissions and simple CORS requests because browsers cannot send custom headers cross-origin without preflight approval.',
    codeSnippet: `// Verify Custom Header on Protected Endpoints
if (req.method !== 'GET' && req.method !== 'HEAD') {
  if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'Direct cross-origin requests rejected' });
  }
}`,
    referenceUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#custom-request-headers',
  },
  ORIGIN_REFERER_CHECK: {
    id: 'ORIGIN_REFERER_CHECK',
    category: 'Header Verification',
    title: 'Validate Origin and Referer Headers',
    summary:
      'Ensure the request Origin or Referer header matches the application target host. Modern browsers always attach Origin to cross-origin POST requests.',
    codeSnippet: `const origin = req.headers['origin'] || req.headers['referer'];
if (!origin || !origin.startsWith('https://trusted-domain.com')) {
  return res.status(403).send('Origin validation failed');
}`,
    referenceUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#verifying-origin-with-standard-headers',
  },
  AVOID_GET_STATE_CHANGE: {
    id: 'AVOID_GET_STATE_CHANGE',
    category: 'REST Architecture',
    title: 'Never Perform State-Changing Actions via GET Requests',
    summary:
      'GET requests are fundamentally vulnerable to CSRF via image tags (<img src="...">), audio/video tags, and script tags, requiring zero user interaction to trigger.',
    codeSnippet: `// INCORRECT:
// app.get('/account/delete', handler);

// CORRECT:
app.post('/account/delete', verifyCsrfToken, handler);`,
    referenceUrl: 'https://owasp.org/www-community/attacks/csrf',
  },
};
