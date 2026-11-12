import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  Download,
  Copy,
  Check,
  PlayCircle,
  FileCode,
  Sliders,
  Sparkles,
  Terminal,
  ExternalLink,
  Wrench,
} from 'lucide-react';
import { useApp } from '../context';
import { compilePoc, buildCookieInjectionUrl } from '../lib/generator';
import { parseInput, SAMPLE_REQUESTS } from '../lib/parser';
import { extractQueryParams, parseUrlEncodedBody } from '../lib/parser/httpParser';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CodeBlock } from '../components/ui/CodeBlock';
import { Tabs } from '../components/ui/Tabs';

export function GeneratorPage() {
  const navigate = useNavigate();
  const { currentRequest, setCurrentRequest, addGeneratedPoc } = useApp();

  const [selectedFormat, setSelectedFormat] = useState<
    | 'html-form'
    | 'html-navigation'
    | 'html-fetch'
    | 'html-ajax'
    | 'html-img'
    | 'python'
    | 'json-trick'
  >('html-form');

  const [autoSubmit, setAutoSubmit] = useState(true);
  const [stealthIframe, setStealthIframe] = useState(false);
  const [delayMs, setDelayMs] = useState(0);
  const [buttonText, setButtonText] = useState('Submit Request');
  const [preflightEnabled, setPreflightEnabled] = useState(false);
  const [preflightUrl, setPreflightUrl] = useState('');
  const [preflightTrigger, setPreflightTrigger] = useState<'onerror' | 'onload' | 'fetch'>('onerror');
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderEndpoint, setBuilderEndpoint] = useState('');
  const [builderParam, setBuilderParam] = useState('search');
  const [builderCookieName, setBuilderCookieName] = useState('csrfKey');
  const [builderCookieVal, setBuilderCookieVal] = useState('YOUR-KEY');
  const [builderSameSite, setBuilderSameSite] = useState<
    'None' | 'Lax' | 'Strict' | 'none'
  >('None');
  const [paramOverrides, setParamOverrides] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [repeaterCopied, setRepeaterCopied] = useState(false);
  const [keepQueryInUrl, setKeepQueryInUrl] = useState(false);
  const [methodOverride, setMethodOverride] = useState<string>('');

  const defaultParams = useMemo(() => {
    if (!currentRequest) return {};
    const isGet = currentRequest.method === 'GET';
    const query = extractQueryParams(currentRequest.url);
    if (isGet && Object.keys(query).length > 0) {
      return query;
    }
    return parseUrlEncodedBody(currentRequest.body);
  }, [currentRequest]);

  const effectiveParams = useMemo(() => {
    return { ...defaultParams, ...paramOverrides };
  }, [defaultParams, paramOverrides]);

  const isGetWithQueryParams = useMemo(() => {
    if (!currentRequest) return false;
    return currentRequest.method === 'GET' && Object.keys(extractQueryParams(currentRequest.url)).length > 0;
  }, [currentRequest]);

  const liveConstructedUrl = useMemo(() => {
    const defaultUrl = currentRequest?.url
      ? currentRequest.url.split('?')[0] || currentRequest.url
      : 'https://example.net/?search=Hello+World';
    const raw = builderEndpoint || defaultUrl;
    return buildCookieInjectionUrl({
      rawUrl: raw,
      cookieName: builderCookieName,
      cookieValue: builderCookieVal,
      sameSite: builderSameSite,
      customParam: builderParam || undefined,
    });
  }, [
    builderEndpoint,
    builderCookieName,
    builderCookieVal,
    builderSameSite,
    builderParam,
    currentRequest,
  ]);

  const handleCopyRepeaterUrl = async () => {
    if (!liveConstructedUrl) return;
    try {
      await navigator.clipboard.writeText(liveConstructedUrl);
      setRepeaterCopied(true);
      setTimeout(() => setRepeaterCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleApplyToPoc = () => {
    if (liveConstructedUrl) {
      setPreflightUrl(liveConstructedUrl);
    }
  };

  const compiledPoc = useMemo(() => {
    if (!currentRequest) return null;
    return compilePoc(currentRequest, selectedFormat, {
      autoSubmit,
      stealthIframe,
      delayMs,
      buttonText,
      customParameters: Object.keys(effectiveParams).length > 0 ? effectiveParams : undefined,
      preflight: {
        enabled: preflightEnabled,
        url: preflightUrl,
        triggerMode: preflightTrigger,
      },
      keepQueryInUrl,
      methodOverride: methodOverride || undefined,
    });
  }, [
    currentRequest,
    selectedFormat,
    autoSubmit,
    stealthIframe,
    delayMs,
    buttonText,
    effectiveParams,
    preflightEnabled,
    preflightUrl,
    preflightTrigger,
    keepQueryInUrl,
    methodOverride,
  ]);

  const handleCopy = async () => {
    if (!compiledPoc) return;
    try {
      await navigator.clipboard.writeText(compiledPoc.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    if (!compiledPoc) return;
    const isPy = selectedFormat === 'python';
    const filename = isPy ? 'csrf_poc.py' : 'csrf_poc.html';
    const mimeType = isPy ? 'text/x-python' : 'text/html';

    const blob = new Blob([compiledPoc.code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendToPlayground = () => {
    if (!compiledPoc) return;
    addGeneratedPoc(compiledPoc);
    sessionStorage.setItem('csrf_forge_active_poc', JSON.stringify(compiledPoc));
    navigate('/playground');
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_REQUESTS.find((s) => s.id === sampleId);
    if (sample) {
      const parsed = parseInput(sample.payload);
      if (parsed.success && parsed.request) {
        setCurrentRequest(parsed.request);
      }
    }
  };

  const formatTabs = [
    { id: 'html-form', label: 'HTML Auto-Form' },
    { id: 'html-navigation', label: 'Top-Level Redirect' },
    { id: 'html-fetch', label: 'Fetch API' },
    { id: 'html-ajax', label: 'XHR withCredentials' },
    { id: 'html-img', label: 'Image Beacon' },
    { id: 'python', label: 'Python Script' },
    { id: 'json-trick', label: 'JSON Trick' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-dark-100">CSRF PoC Generator</h2>
            <Badge severity="secure" size="sm">MULTI-VECTOR COMPILER</Badge>
          </div>
          <p className="text-xs text-dark-400 mt-1 font-mono">
            AUTO-SUBMIT FORMS • ASYNC BEACONS • PYTHON SCRIPT REGRESSION HARNESS
          </p>
        </div>

        {compiledPoc && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download PoC
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendToPlayground}
              rightIcon={<PlayCircle className="w-3.5 h-3.5" />}
            >
              Test in Playground
            </Button>
          </div>
        )}
      </div>

      {/* No Request State */}
      {!currentRequest && (
        <Card className="text-center py-12 px-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-3 w-12 h-12 rounded-full bg-cyber-950 border border-cyber-500/30 text-cyber-400 mx-auto flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-dark-100">No Request Loaded</h3>
              <p className="text-xs text-dark-400 mt-1">
                To generate an exploit proof of concept, parse a request first or load a sample scenario.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/parser">
                <Button variant="primary" size="sm" leftIcon={<FileCode className="w-3.5 h-3.5" />}>
                  Go to Request Parser
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                onClick={() => handleLoadSample('sample-bank-transfer')}
              >
                Load Sample Bank Transfer
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Generator Workspace */}
      {currentRequest && compiledPoc && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Code View (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Format Selector */}
            <div className="p-2 bg-dark-900 border border-dark-800 rounded-lg">
              <Tabs
                variant="pills"
                tabs={formatTabs}
                activeTab={selectedFormat}
                onChange={(id) => setSelectedFormat(id as typeof selectedFormat)}
              />
            </div>

            {/* Target Summary Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-dark-950 border border-dark-800 rounded-lg text-xs font-mono">
              <div className="flex items-center gap-2">
                <Badge
                  severity={
                    currentRequest.method === 'POST' || currentRequest.method === 'PUT' ? 'high' : 'neutral'
                  }
                  size="sm"
                >
                  {currentRequest.method}
                </Badge>
                <span className="text-dark-200 font-semibold break-all">{currentRequest.url}</span>
              </div>
              <span className="text-dark-500">{compiledPoc.description}</span>
            </div>

            {/* Code Output Card */}
            <Card glow className="relative">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-dark-800 text-xs">
                <span className="font-mono text-dark-400 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyber-400" />
                  {selectedFormat === 'python' ? 'PYTHON SCRIPT' : 'STANDALONE HTML EXPLOIT'}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    leftIcon={
                      copied ? <Check className="w-3.5 h-3.5 text-cyber-400" /> : <Copy className="w-3.5 h-3.5" />
                    }
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownload}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Save
                  </Button>
                </div>
              </div>

              <CodeBlock
                code={compiledPoc.code}
                language={selectedFormat === 'python' ? 'python' : 'html'}
                showLineNumbers
                maxHeight="420px"
              />
            </Card>
          </div>

          {/* Configuration Sidebar (1 col) */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  <Sliders className="w-4 h-4 text-cyber-400" />
                  Attack Parameters
                </CardTitle>
                <CardDescription>Customize payload behavior</CardDescription>
              </CardHeader>

              <div className="space-y-4 text-xs font-mono">
                {/* Auto-Submit */}
                <div className="flex items-center justify-between">
                  <label htmlFor="autoSubmitToggle" className="text-dark-300 font-medium">Auto-Submit</label>
                  <input
                    id="autoSubmitToggle"
                    type="checkbox"
                    checked={autoSubmit}
                    onChange={(e) => setAutoSubmit(e.target.checked)}
                    className="w-4 h-4 accent-cyber-500 rounded cursor-pointer"
                  />
                </div>

                {/* Stealth Iframe */}
                {selectedFormat === 'html-form' && !keepQueryInUrl && (
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="stealthIframeToggle" className="text-dark-300 font-medium block">Stealth Iframe</label>
                      <span className="text-[10px] text-dark-500 font-sans">Swallows redirect</span>
                    </div>
                    <input
                      id="stealthIframeToggle"
                      type="checkbox"
                      checked={stealthIframe}
                      onChange={(e) => setStealthIframe(e.target.checked)}
                      className="w-4 h-4 accent-cyber-500 rounded cursor-pointer"
                    />
                  </div>
                )}

                {/* Keep Query Params in URL (GET requests only) */}
                {isGetWithQueryParams && (selectedFormat === 'html-form' || selectedFormat === 'html-navigation') && (
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="keepQueryToggle" className="text-dark-300 font-medium block">
                        Keep Params in URL
                      </label>
                      <span className="text-[10px] text-dark-500 font-sans">
                        Direct URL redirect (no form)
                      </span>
                    </div>
                    <input
                      id="keepQueryToggle"
                      type="checkbox"
                      checked={keepQueryInUrl}
                      onChange={(e) => setKeepQueryInUrl(e.target.checked)}
                      className="w-4 h-4 accent-cyber-500 rounded cursor-pointer"
                    />
                  </div>
                )}

                {/* Method Override (_method parameter) */}
                {currentRequest?.method === 'GET' && (
                  <div className="space-y-1">
                    <div>
                      <label htmlFor="methodOverrideSelect" className="text-dark-300 font-medium block">
                        Method Override (_method)
                      </label>
                      <span className="text-[10px] text-dark-500 font-sans">
                        Inject _method param for SameSite bypass
                      </span>
                    </div>
                    <select
                      id="methodOverrideSelect"
                      value={methodOverride}
                      onChange={(e) => setMethodOverride(e.target.value)}
                      className="w-full bg-dark-950 border border-dark-800 rounded px-2 py-1 text-xs text-dark-200"
                    >
                      <option value="">None (no override)</option>
                      <option value="POST">_method=POST</option>
                      <option value="PUT">_method=PUT</option>
                      <option value="DELETE">_method=DELETE</option>
                      <option value="PATCH">_method=PATCH</option>
                    </select>
                  </div>
                )}

                {/* Delay in ms */}
                {autoSubmit && (
                  <div className="space-y-1">
                    <label className="text-dark-400 flex justify-between">
                      <span>Execution Delay:</span>
                      <span className="text-cyber-400">{delayMs} ms</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={5000}
                      step={250}
                      value={delayMs}
                      onChange={(e) => setDelayMs(Number(e.target.value))}
                      className="w-full accent-cyber-500"
                    />
                  </div>
                )}

                {/* Button Text */}
                {!autoSubmit && (
                  <div className="space-y-1">
                    <label className="text-dark-400">Manual Button Text:</label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      className="w-full bg-dark-950 border border-dark-800 rounded px-2.5 py-1.5 text-xs text-dark-200"
                    />
                  </div>
                )}

                {/* Parameter Values Override Editor */}
                {Object.keys(defaultParams).length > 0 && (
                  <div className="pt-2 border-t border-dark-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-dark-300 font-medium block">
                          Parameter Values
                        </span>
                        <span className="text-[10px] text-dark-500 font-sans">
                          Auto-extracted from {currentRequest?.method === 'GET' ? 'URL query' : 'request body'}
                        </span>
                      </div>
                      {Object.keys(paramOverrides).length > 0 && (
                        <button
                          type="button"
                          onClick={() => setParamOverrides({})}
                          className="text-[10px] text-cyber-400 hover:underline font-mono"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {Object.entries(effectiveParams).map(([key, val]) => (
                        <div key={key} className="space-y-0.5">
                          <label className="text-[10px] text-dark-400 font-mono block truncate">
                            {key}:
                          </label>
                          <input
                            type="text"
                            value={val}
                            onChange={(e) =>
                              setParamOverrides((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            className="w-full bg-dark-950 border border-dark-800 rounded px-2 py-1 text-xs text-dark-200 font-mono focus:border-cyber-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pre-flight / Cookie Injection Vector */}
                <div className="pt-2 border-t border-dark-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="preflightToggle" className="text-dark-300 font-medium block">
                        Cookie / CRLF Injection
                      </label>
                      <span className="text-[10px] text-dark-500 font-sans">
                        Pre-flight trigger (e.g. Set-Cookie)
                      </span>
                    </div>
                    <input
                      id="preflightToggle"
                      type="checkbox"
                      checked={preflightEnabled}
                      onChange={(e) => setPreflightEnabled(e.target.checked)}
                      className="w-4 h-4 accent-cyber-500 rounded cursor-pointer"
                    />
                  </div>

                  {preflightEnabled && (
                    <div className="space-y-2 p-2.5 bg-dark-950/70 border border-dark-800/80 rounded-md">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor="preflightUrlInput" className="text-[11px] text-dark-300 font-medium">
                            Pre-flight URL or Payload:
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setPreflightUrl(
                                'https://YOUR-LAB-ID.web-security-academy.net/?search=test%0d%0aSet-Cookie:%20csrfKey=YOUR-KEY%3b%20SameSite=None'
                              )
                            }
                            className="text-[10px] text-cyber-400 hover:underline"
                          >
                            Load Template
                          </button>
                        </div>
                        <input
                          id="preflightUrlInput"
                          type="text"
                          value={preflightUrl}
                          onChange={(e) => setPreflightUrl(e.target.value)}
                          placeholder="https://victim.com/?search=x%0d%0aSet-Cookie:..."
                          className="w-full bg-dark-900 border border-dark-700/80 rounded px-2 py-1 text-xs text-dark-100 placeholder-dark-600 focus:outline-none focus:border-cyber-500 font-mono"
                        />
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-dark-500 font-sans">
                            Paste URL or use custom builder below.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (!builderEndpoint && currentRequest?.url) {
                                const base = currentRequest.url.split('?')[0] || currentRequest.url;
                                setBuilderEndpoint(base);
                              }
                              setShowBuilder(!showBuilder);
                            }}
                            className="text-[10px] text-cyber-400 hover:text-cyber-300 font-medium flex items-center gap-1"
                          >
                            <Wrench className="w-2.5 h-2.5" />
                            {showBuilder ? 'Close Builder' : 'Custom Builder'}
                          </button>
                        </div>

                        {showBuilder && (
                          <div className="mt-2 p-2.5 bg-dark-900 border border-dark-700/70 rounded space-y-2 text-[11px]">
                            <div className="flex items-center justify-between pb-1 border-b border-dark-800">
                              <span className="text-dark-300 font-semibold text-[11px]">
                                Cookie Injection URL Generator
                              </span>
                              <span className="text-[10px] text-dark-500 font-sans">
                                For Burp Repeater & PoC
                              </span>
                            </div>

                            <div>
                              <label className="text-dark-300 block mb-0.5">
                                Search / Reflection URL:
                              </label>
                              <input
                                type="text"
                                value={builderEndpoint}
                                onChange={(e) => setBuilderEndpoint(e.target.value)}
                                placeholder="https://example.net/?search=Hello+World"
                                className="w-full bg-dark-950 border border-dark-800 rounded px-2 py-1 text-xs text-dark-200 font-mono"
                              />
                              <p className="text-[10px] text-dark-500 font-sans mt-0.5">
                                Paste full URL with query parameter (e.g. ?search=... or ?q=...).
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-dark-300 block mb-0.5">Cookie Name:</label>
                                <input
                                  type="text"
                                  value={builderCookieName}
                                  onChange={(e) => setBuilderCookieName(e.target.value)}
                                  placeholder="csrfKey"
                                  className="w-full bg-dark-950 border border-dark-800 rounded px-2 py-1 text-xs text-dark-200 font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-dark-300 block mb-0.5">Cookie Value:</label>
                                <input
                                  type="text"
                                  value={builderCookieVal}
                                  onChange={(e) => setBuilderCookieVal(e.target.value)}
                                  placeholder="YOUR-KEY"
                                  className="w-full bg-dark-950 border border-dark-800 rounded px-2 py-1 text-xs text-dark-200 font-mono"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-dark-300 block mb-0.5">SameSite Policy:</label>
                                <select
                                  value={builderSameSite}
                                  onChange={(e) =>
                                    setBuilderSameSite(e.target.value as typeof builderSameSite)
                                  }
                                  className="w-full bg-dark-950 border border-dark-800 rounded px-2 py-1 text-xs text-dark-200"
                                >
                                  <option value="None">SameSite=None</option>
                                  <option value="Lax">SameSite=Lax</option>
                                  <option value="Strict">SameSite=Strict</option>
                                  <option value="none">Omit SameSite</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-dark-300 block mb-0.5">Optional Param:</label>
                                <input
                                  type="text"
                                  value={builderParam}
                                  onChange={(e) => setBuilderParam(e.target.value)}
                                  placeholder="search"
                                  className="w-full bg-dark-950 border border-dark-800 rounded px-2 py-1 text-xs text-dark-200 font-mono"
                                />
                              </div>
                            </div>

                            {/* Live Constructed URL Box */}
                            <div className="pt-1 space-y-1">
                              <label className="text-dark-300 font-medium block text-[10px]">
                                Generated URL (Burp Suite Repeater / Browser):
                              </label>
                              <div className="p-2 bg-dark-950 border border-dark-800 rounded font-mono text-[10px] text-cyber-300 break-all select-all">
                                {liveConstructedUrl}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                onClick={handleCopyRepeaterUrl}
                                className="flex-1"
                                leftIcon={
                                  repeaterCopied ? (
                                    <Check className="w-3 h-3 text-cyber-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )
                                }
                              >
                                {repeaterCopied ? 'Copied URL!' : 'Copy URL for Repeater'}
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={handleApplyToPoc}
                                className="flex-1"
                              >
                                Insert into PoC
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] text-dark-300 font-medium block mb-1">
                          Trigger Mode:
                        </label>
                        <select
                          value={preflightTrigger}
                          onChange={(e) =>
                            setPreflightTrigger(e.target.value as 'onerror' | 'onload' | 'fetch')
                          }
                          className="w-full bg-dark-900 border border-dark-700/80 rounded px-2 py-1 text-xs text-dark-200 focus:outline-none focus:border-cyber-500"
                        >
                          <option value="onerror">Image onerror (CRLF / Non-image)</option>
                          <option value="onload">Image onload (Image response)</option>
                          <option value="fetch">Fetch API (Async pre-request)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick Navigation Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  <PlayCircle className="w-4 h-4 text-cyber-400" />
                  Live Verification
                </CardTitle>
              </CardHeader>
              <p className="text-xs text-dark-400 leading-relaxed">
                Test this exploit in our sandboxed isolated iframe playground to verify submission behavior without leaking cross-origin data.
              </p>
              <div className="pt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendToPlayground}
                  className="w-full"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Open in Playground
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
