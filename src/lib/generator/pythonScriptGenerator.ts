import { ParsedRequest } from '../../types';
import { PocGeneratorOptions } from './types';
import { parseUrlEncodedBody } from '../parser/httpParser';

/**
 * Generates a standalone Python 3 regression testing script using requests.Session()
 */
export function generatePythonScriptPoc(
  request: ParsedRequest,
  options: Partial<PocGeneratorOptions> = {}
): string {
  const method = request.method.toUpperCase();
  const url = request.url;
  const cookies = request.cookies;
  const bodyParams = options.customParameters || parseUrlEncodedBody(request.body);
  const isJson = request.body.startsWith('{') || request.body.startsWith('[');

  const cookieDictStr = JSON.stringify(cookies, null, 4);
  const dataPayloadStr = isJson
    ? `json_payload = ${request.body}`
    : `data_payload = ${JSON.stringify(bodyParams, null, 4)}`;

  return `#!/usr/bin/env python3
"""
CSRF Forge — Security Regression Test Script
Target: ${url}
Method: ${method}
"""

import sys
import requests

def test_csrf_vulnerability():
    print("[*] Initializing CSRF test execution...")
    session = requests.Session()

    # Configure target session cookies
    cookies = ${cookieDictStr}
    for name, value in cookies.items():
        session.cookies.set(name, value)

    # Cross-Origin Spoofed Headers
    headers = {
        "User-Agent": "CSRF-Forge-Automated-Audit/1.0",
        "Referer": "https://attacker-controlled-origin.org/poc.html",
        "Origin": "https://attacker-controlled-origin.org",
    }

    url = "${url}"
    ${dataPayloadStr}

    print(f"[*] Sending cross-origin {method} to {url}")
    try:
        response = session.${method.toLowerCase()}(
            url,
            headers=headers,
            ${isJson ? 'json=json_payload,' : 'data=data_payload,'}
            allow_redirects=True,
            timeout=10,
        )

        print(f"[+] Response status: {response.status_code}")
        if response.status_code in [200, 201, 204, 302]:
            print("[!] WARNING: Action accepted with spoofed cross-origin headers.")
            print("[!] Potential CSRF vulnerability confirmed.")
        else:
            print(f"[*] Server rejected or responded with HTTP {response.status_code}")

    except requests.exceptions.RequestException as err:
        print(f"[-] Request error: {err}")
        sys.exit(1)

if __name__ == "__main__":
    test_csrf_vulnerability()
`;
}
