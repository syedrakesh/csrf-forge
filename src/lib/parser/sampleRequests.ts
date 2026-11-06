export interface SampleRequest {
  id: string;
  name: string;
  description: string;
  format: 'raw-http' | 'curl';
  category: 'Banking' | 'Account' | 'Social' | 'API' | 'Multipart';
  vulnerableAspect: string;
  payload: string;
}

export const SAMPLE_REQUESTS: SampleRequest[] = [
  {
    id: 'sample-bank-transfer',
    name: 'Vulnerable Wire Transfer (POST Form)',
    description: 'Classic funds transfer endpoint missing anti-CSRF token and SameSite cookie protection.',
    format: 'raw-http',
    category: 'Banking',
    vulnerableAspect: 'No CSRF token, Lax session cookie, predictable parameters',
    payload: `POST /api/transfer HTTP/1.1
Host: bank.local.internal
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36
Cookie: session_id=sess_74f9a12c8b0e; account_type=premium
Content-Type: application/x-www-form-urlencoded
Content-Length: 48

recipient=attacker_wallet_99&amount=5000&currency=USD`,
  },
  {
    id: 'sample-email-update',
    name: 'Account Email Reset (cURL Command)',
    description: 'Account profile modification via cURL with session cookies and form encoding.',
    format: 'curl',
    category: 'Account',
    vulnerableAspect: 'Cookie-authenticated action without re-authentication or token',
    payload: `curl 'https://portal.target-app.org/user/settings/email' \\
  -X POST \\
  -H 'User-Agent: Mozilla/5.0' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -b 'auth_token=jwt_eyJh...; user_id=40219' \\
  -d 'new_email=hacker%40controlled-inbox.com&confirm_email=hacker%40controlled-inbox.com'`,
  },
  {
    id: 'sample-json-api',
    name: 'REST API Admin Role Escalation (JSON)',
    description: 'JSON endpoint susceptible to Content-Type relaxation and simple request exploits.',
    format: 'raw-http',
    category: 'API',
    vulnerableAspect: 'JSON endpoint that accepts url-encoded payload or lax CORS preflight',
    payload: `POST /api/v2/admin/users/permissions HTTP/1.1
Host: api.saas-platform.io
Cookie: user_session=a83fc910e; remember_me=true
Content-Type: application/json
Content-Length: 42

{"userId": "attacker_id", "role": "admin"}`,
  },
  {
    id: 'sample-password-change',
    name: 'Password Modification (cURL)',
    description: 'Password modification endpoint without requiring current password confirmation.',
    format: 'curl',
    category: 'Account',
    vulnerableAspect: 'Missing current password verification and anti-CSRF nonce',
    payload: `curl -X POST https://auth.company.corp/account/change-password \\
  -H "Origin: https://auth.company.corp" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -H "Cookie: sid=83f019a3b8e21c; role=member" \\
  --data "new_password=P%40ssw0rd2026%21&repeat_password=P%40ssw0rd2026%21"`,
  },
  {
    id: 'sample-get-state-change',
    name: 'Unsafe GET Request (Account Deletion)',
    description: 'State-changing action executed via GET query parameters, exploitable via simple <img> tag.',
    format: 'raw-http',
    category: 'Account',
    vulnerableAspect: 'State change via GET method completely bypasses form token checks',
    payload: `GET /dashboard/account/delete?confirm=true&user_id=8921 HTTP/1.1
Host: community.platform.net
Cookie: member_session=7fa128cd39; logged_in=1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)`,
  },
];
