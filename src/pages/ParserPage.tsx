import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCode,
  Play,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Trash2,
  Search,
  ExternalLink,
  Layers,
  KeyRound,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../context';
import { parseInput, detectInputFormat, SAMPLE_REQUESTS, parseUrlEncodedBody, extractQueryParams } from '../lib/parser';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Tabs } from '../components/ui/Tabs';
import { CodeBlock } from '../components/ui/CodeBlock';

export function ParserPage() {
  const navigate = useNavigate();
  const { currentRequest, setCurrentRequest } = useApp();

  const [inputRaw, setInputRaw] = useState('');
  const [selectedSampleId, setSelectedSampleId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [headerSearch, setHeaderSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'headers' | 'cookies' | 'query' | 'body'>('headers');

  const detectedFormat = detectInputFormat(inputRaw);

  const handleParse = () => {
    setErrorMsg(null);
    if (!inputRaw.trim()) {
      setErrorMsg('Please paste a raw HTTP request or cURL command.');
      return;
    }

    const result = parseInput(inputRaw);
    if (result.success && result.request) {
      setCurrentRequest(result.request);
    } else {
      setErrorMsg(result.error?.message || 'Failed to parse request format.');
    }
  };

  const handleLoadSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    const sample = SAMPLE_REQUESTS.find((s) => s.id === sampleId);
    if (sample) {
      setInputRaw(sample.payload);
      setErrorMsg(null);
      const result = parseInput(sample.payload);
      if (result.success && result.request) {
        setCurrentRequest(result.request);
      }
    }
  };

  const handleClear = () => {
    setInputRaw('');
    setSelectedSampleId('');
    setErrorMsg(null);
    setCurrentRequest(null);
  };

  const parsedBodyParams = currentRequest?.body
    ? parseUrlEncodedBody(currentRequest.body)
    : {};

  const queryParams = currentRequest?.url
    ? extractQueryParams(currentRequest.url)
    : {};

  const filteredHeaders = Object.entries(currentRequest?.headers || {}).filter(
    ([k, v]) =>
      k.toLowerCase().includes(headerSearch.toLowerCase()) ||
      v.toLowerCase().includes(headerSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-dark-100">HTTP & cURL Request Parser</h2>
            <Badge severity="secure" size="sm">ENGINE READY</Badge>
          </div>
          <p className="text-xs text-dark-400 mt-1 font-mono">
            RAW RECONNAISSANCE PARSER • SUPPORTS BURP, OWASP ZAP & DEVTOOLS EXPORTS
          </p>
        </div>

        {currentRequest && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/analyzer')}
              leftIcon={<Shield className="w-3.5 h-3.5" />}
            >
              Analyze Request
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/generator')}
              leftIcon={<Zap className="w-3.5 h-3.5" />}
            >
              Generate PoC
            </Button>
          </div>
        )}
      </div>

      {errorMsg && (
        <Alert type="error" title="Parsing Error" onDismiss={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* Input Section */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              <FileCode className="w-4 h-4 text-cyber-400" />
              Request Input Stream
            </CardTitle>
            <CardDescription>
              Paste standard HTTP raw streams or cURL terminal commands
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {detectedFormat !== 'unknown' && (
              <Badge severity="info" size="sm" variant="glow">
                {detectedFormat.toUpperCase()} DETECTED
              </Badge>
            )}

            <select
              aria-label="Select pre-built sample test request"
              value={selectedSampleId}
              onChange={(e) => handleLoadSample(e.target.value)}
              className="bg-dark-950 border border-dark-800 text-dark-200 text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyber-500/50"
            >
              <option value="">Load Sample Payload...</option>
              {SAMPLE_REQUESTS.map((sample) => (
                <option key={sample.id} value={sample.id}>
                  [{sample.category}] {sample.name}
                </option>
              ))}
            </select>

            {inputRaw && (
              <Button variant="ghost" size="sm" onClick={handleClear} aria-label="Clear input">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </Button>
            )}
          </div>
        </CardHeader>

        <div className="space-y-4">
          <textarea
            value={inputRaw}
            onChange={(e) => setInputRaw(e.target.value)}
            rows={8}
            placeholder={`Paste raw HTTP request or cURL command, e.g.:\n\nPOST /api/v1/transfer HTTP/1.1\nHost: target-app.com\nCookie: session_id=abc123xyz\nContent-Type: application/x-www-form-urlencoded\n\nrecipient=attacker&amount=1000\n\nOR\n\ncurl -X POST https://target-app.com/api/v1/transfer -H "Cookie: session_id=abc123xyz" -d "recipient=attacker&amount=1000"`}
            className="w-full bg-dark-950 border border-dark-800 rounded-lg p-3 font-mono text-xs text-dark-200 placeholder-dark-600 focus:outline-none focus:border-cyber-500/50 transition-colors leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-dark-500 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyber-400" />
              Tip: Supports multi-line backslash escaped cURL commands & Burp Suite raw copies.
            </span>

            <Button
              variant="primary"
              size="sm"
              onClick={handleParse}
              leftIcon={<Play className="w-3.5 h-3.5" />}
            >
              Parse Request
            </Button>
          </div>
        </div>
      </Card>

      {/* Parsed Structure Inspector */}
      {currentRequest && (
        <Card glow className="space-y-6">
          <CardHeader>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  severity={
                    currentRequest.method === 'POST' || currentRequest.method === 'PUT' || currentRequest.method === 'DELETE'
                      ? 'high'
                      : 'neutral'
                  }
                  size="md"
                >
                  {currentRequest.method}
                </Badge>
                <span className="font-mono text-sm font-semibold text-dark-100 break-all">
                  {currentRequest.url}
                </span>
              </div>
              <p className="text-xs text-dark-400 font-mono">
                CONTENT-TYPE: {currentRequest.contentType || 'NONE'} • PARSED AT: {new Date(currentRequest.timestamp).toLocaleTimeString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/analyzer')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Send to Analyzer
              </Button>
            </div>
          </CardHeader>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-dark-950 rounded-lg border border-dark-800">
              <span className="text-dark-500 text-[10px] uppercase">Headers</span>
              <p className="text-base font-bold text-dark-200 mt-0.5">
                {Object.keys(currentRequest.headers).length}
              </p>
            </div>
            <div className="p-3 bg-dark-950 rounded-lg border border-dark-800">
              <span className="text-dark-500 text-[10px] uppercase">Cookies</span>
              <p className="text-base font-bold text-cyber-400 mt-0.5">
                {Object.keys(currentRequest.cookies).length}
              </p>
            </div>
            <div className="p-3 bg-dark-950 rounded-lg border border-dark-800">
              <span className="text-dark-500 text-[10px] uppercase">Query Params</span>
              <p className="text-base font-bold text-blue-400 mt-0.5">
                {Object.keys(queryParams).length}
              </p>
            </div>
            <div className="p-3 bg-dark-950 rounded-lg border border-dark-800">
              <span className="text-dark-500 text-[10px] uppercase">Body Size</span>
              <p className="text-base font-bold text-purple-400 mt-0.5">
                {currentRequest.body.length} B
              </p>
            </div>
          </div>

          {/* Tabs for details */}
          <Tabs
            variant="pills"
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as typeof activeTab)}
            tabs={[
              {
                id: 'headers',
                label: 'Headers',
                icon: <Layers className="w-3.5 h-3.5" />,
                badge: Object.keys(currentRequest.headers).length,
              },
              {
                id: 'cookies',
                label: 'Cookies',
                icon: <KeyRound className="w-3.5 h-3.5" />,
                badge: Object.keys(currentRequest.cookies).length,
              },
              {
                id: 'query',
                label: 'Query Params',
                icon: <SlidersHorizontal className="w-3.5 h-3.5" />,
                badge: Object.keys(queryParams).length,
              },
              {
                id: 'body',
                label: 'Body Payload',
                icon: <FileCode className="w-3.5 h-3.5" />,
              },
            ]}
          />

          {/* Tab 1: Headers */}
          {activeTab === 'headers' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-dark-500" />
                <input
                  type="text"
                  placeholder="Filter headers by key or value..."
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-dark-200 placeholder-dark-600 focus:outline-none focus:border-cyber-500/50 font-mono"
                />
              </div>

              <div className="border border-dark-800 rounded-lg overflow-hidden">
                <table className="w-full text-xs font-mono">
                  <thead className="bg-dark-950 border-b border-dark-800 text-dark-400">
                    <tr>
                      <th className="text-left px-4 py-2 w-1/3">Header Name</th>
                      <th className="text-left px-4 py-2">Header Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800/60 bg-dark-900/40">
                    {filteredHeaders.length > 0 ? (
                      filteredHeaders.map(([k, v]) => (
                        <tr key={k} className="hover:bg-dark-900 transition-colors">
                          <td className="px-4 py-2 font-semibold text-cyber-300">{k}</td>
                          <td className="px-4 py-2 text-dark-300 break-all select-text">{v}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-4 py-4 text-center text-dark-500">
                          No headers matched filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Cookies */}
          {activeTab === 'cookies' && (
            <div className="border border-dark-800 rounded-lg overflow-hidden">
              <table className="w-full text-xs font-mono">
                <thead className="bg-dark-950 border-b border-dark-800 text-dark-400">
                  <tr>
                    <th className="text-left px-4 py-2 w-1/3">Cookie Name</th>
                    <th className="text-left px-4 py-2">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800/60 bg-dark-900/40">
                  {Object.entries(currentRequest.cookies).length > 0 ? (
                    Object.entries(currentRequest.cookies).map(([k, v]) => (
                      <tr key={k} className="hover:bg-dark-900 transition-colors">
                        <td className="px-4 py-2 font-semibold text-amber-300">{k}</td>
                        <td className="px-4 py-2 text-dark-300 break-all select-text">{v}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-dark-500">
                        No cookies detected in this request.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Query Params */}
          {activeTab === 'query' && (
            <div className="border border-dark-800 rounded-lg overflow-hidden">
              <table className="w-full text-xs font-mono">
                <thead className="bg-dark-950 border-b border-dark-800 text-dark-400">
                  <tr>
                    <th className="text-left px-4 py-2 w-1/3">Parameter</th>
                    <th className="text-left px-4 py-2">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800/60 bg-dark-900/40">
                  {Object.entries(queryParams).length > 0 ? (
                    Object.entries(queryParams).map(([k, v]) => (
                      <tr key={k} className="hover:bg-dark-900 transition-colors">
                        <td className="px-4 py-2 font-semibold text-blue-300">{k}</td>
                        <td className="px-4 py-2 text-dark-300 break-all select-text">{v}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-dark-500">
                        No URL query parameters present.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 4: Body Payload */}
          {activeTab === 'body' && (
            <div className="space-y-4">
              {Object.keys(parsedBodyParams).length > 0 && (
                <div className="border border-dark-800 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-dark-950 border-b border-dark-800 text-xs font-semibold text-dark-300">
                    Parsed Form Parameters
                  </div>
                  <table className="w-full text-xs font-mono">
                    <thead className="bg-dark-950/60 border-b border-dark-800 text-dark-400">
                      <tr>
                        <th className="text-left px-4 py-2 w-1/3">Field</th>
                        <th className="text-left px-4 py-2">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-800/60 bg-dark-900/40">
                      {Object.entries(parsedBodyParams).map(([k, v]) => (
                        <tr key={k} className="hover:bg-dark-900 transition-colors">
                          <td className="px-4 py-2 font-semibold text-cyber-300">{k}</td>
                          <td className="px-4 py-2 text-dark-300 break-all select-text">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-dark-300 mb-2 font-mono">Raw Payload Stream</p>
                <CodeBlock
                  code={currentRequest.body || '(Empty body)'}
                  language={currentRequest.contentType?.includes('json') ? 'json' : 'text'}
                  title="BODY DATA"
                  showLineNumbers
                  maxHeight="220px"
                />
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-dark-800">
            <span className="text-xs text-dark-500 font-mono">
              Ready for CSRF vulnerability evaluation
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/generator')}
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                PoC Generator
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/analyzer')}
                leftIcon={<Shield className="w-3.5 h-3.5" />}
              >
                Analyze CSRF Risk
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
