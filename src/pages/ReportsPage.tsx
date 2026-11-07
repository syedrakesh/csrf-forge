import { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Copy,
  Printer,
  Sliders,
  CheckCircle,
  Eye,
  Code,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CodeBlock } from '../components/ui/CodeBlock';
import { Alert } from '../components/ui/Alert';
import { useApp } from '../context/useApp';
import {
  ReportFormat,
  ReportOptions,
  ReportMetadata,
  buildReportData,
  exportReport,
  downloadReportFile,
  copyReportToClipboard,
  printHtmlReport,
  DEFAULT_REPORT_OPTIONS,
} from '../lib/reports';
import { parseRawHttpRequest } from '../lib/parser/httpParser';
import { analyzeCsrfRequest } from '../lib/analyzer/csrfAnalyzer';
import { SAMPLE_REQUESTS } from '../lib/parser/sampleRequests';
import { Link } from 'react-router-dom';

export function ReportsPage() {
  const { currentRequest, currentAnalysis, generatedPocs, setCurrentRequest, setCurrentAnalysis } =
    useApp();

  const [format, setFormat] = useState<ReportFormat>('markdown');
  const [activeTab, setActiveTab] = useState<'preview' | 'source'>('preview');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Customization options state
  const [options, setOptions] = useState<ReportOptions>({ ...DEFAULT_REPORT_OPTIONS });
  const [metaOverrides, setMetaOverrides] = useState<Partial<ReportMetadata>>({
    auditorName: 'CSRF Forge Auditor',
    organization: 'Cyber Defense Operations',
    customNotes: '',
  });

  // Load sample demo request
  const handleLoadDemo = () => {
    const demo = SAMPLE_REQUESTS[0];
    if (demo) {
      const res = parseRawHttpRequest(demo.payload);
      if (res.success && res.request) {
        const analysis = analyzeCsrfRequest(res.request);
        setCurrentRequest(res.request);
        setCurrentAnalysis(analysis);
      }
    }
  };

  // Compile active report data
  const reportData = useMemo(() => {
    if (!currentRequest || !currentAnalysis) return null;
    return buildReportData(currentRequest, currentAnalysis, generatedPocs, metaOverrides);
  }, [currentRequest, currentAnalysis, generatedPocs, metaOverrides]);

  // Exported artifact
  const exported = useMemo(() => {
    if (!reportData) return null;
    return exportReport(reportData, format, options);
  }, [reportData, format, options]);

  // Actions
  const handleDownload = () => {
    if (!exported) return;
    downloadReportFile(exported.content, exported.filename, exported.mimeType);
  };

  const handleCopy = async () => {
    if (!exported) return;
    const ok = await copyReportToClipboard(exported.content);
    if (ok) {
      setCopyStatus('Report copied to clipboard!');
      setTimeout(() => setCopyStatus(null), 3000);
    }
  };

  const handlePrint = () => {
    if (!reportData) return;
    const htmlReport = exportReport(reportData, 'html', options);
    printHtmlReport(htmlReport.content);
  };

  if (!currentRequest || !currentAnalysis || !reportData || !exported) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-dark-100">Export & Vulnerability Reporting</h2>
              <Badge severity="info" size="sm">PHASE 8 MODULE</Badge>
            </div>
            <p className="text-xs text-dark-400 mt-1 font-mono">
              PENTEST EXECUTIVE SUMMARY & TECHNICAL VULNERABILITY EXPORT
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                No Active Assessment Data Loaded
              </CardTitle>
              <CardDescription>
                Parse an HTTP request or cURL command to generate a full penetration testing report.
              </CardDescription>
            </div>
          </CardHeader>
          <div className="p-8 text-center space-y-4">
            <p className="text-xs text-dark-400 max-w-md mx-auto">
              The vulnerability reporting engine compiles executive summaries, technical findings,
              OWASP remediation guides, and exploit artifacts into client-ready Markdown, HTML, or JSON.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                onClick={handleLoadDemo}
              >
                Load Sample Bank Transfer Audit
              </Button>
              <Link to="/parser">
                <Button
                  variant="secondary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Go to Request Parser
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const { riskMetrics } = reportData;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-dark-100">Export & Vulnerability Reporting</h2>
            <Badge severity="info" size="sm">PHASE 8</Badge>
          </div>
          <p className="text-xs text-dark-400 mt-1 font-mono">
            TARGET: <span className="text-cyber-400 font-semibold">{reportData.metadata.targetHost}</span> &bull; {reportData.request.method} {reportData.request.url}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={handlePrint}
          >
            Print / PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Copy className="w-3.5 h-3.5" />}
            onClick={handleCopy}
          >
            Copy
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleDownload}
          >
            Download {format.toUpperCase()}
          </Button>
        </div>
      </div>

      {copyStatus && (
        <Alert
          type="success"
          title="Export Success"
          onDismiss={() => setCopyStatus(null)}
        >
          {copyStatus}
        </Alert>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-dark-800/80 border border-dark-700/60 rounded-lg p-3 text-center">
          <div className="text-[10px] font-mono text-dark-400 uppercase tracking-wider">Status</div>
          <div className="mt-1">
            <Badge
              severity={currentAnalysis.isVulnerable ? 'critical' : 'secure'}
              size="sm"
            >
              {currentAnalysis.isVulnerable ? 'VULNERABLE' : 'SECURE'}
            </Badge>
          </div>
        </div>

        <div className="bg-dark-800/80 border border-dark-700/60 rounded-lg p-3 text-center">
          <div className="text-[10px] font-mono text-dark-400 uppercase tracking-wider">Risk Score</div>
          <div className="text-lg font-bold font-mono text-dark-100 mt-0.5">
            {riskMetrics.score.toFixed(1)} <span className="text-xs text-dark-400 font-normal">/ 10</span>
          </div>
        </div>

        <div className="bg-dark-800/80 border border-dark-700/60 rounded-lg p-3 text-center">
          <div className="text-[10px] font-mono text-dark-400 uppercase tracking-wider">Total Findings</div>
          <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
            {currentAnalysis.findings.length}
          </div>
        </div>

        <div className="bg-dark-800/80 border border-dark-700/60 rounded-lg p-3 text-center">
          <div className="text-[10px] font-mono text-dark-400 uppercase tracking-wider">PoC Vectors</div>
          <div className="text-lg font-bold font-mono text-cyber-400 mt-0.5">
            {generatedPocs.length}
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Format & Customization Options (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Format Picker */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  <FileText className="w-4 h-4 text-cyber-400" />
                  Export Format
                </CardTitle>
                <CardDescription>Select target output file format</CardDescription>
              </div>
            </CardHeader>
            <div className="p-4 space-y-2">
              {[
                { id: 'markdown', label: 'Markdown (.md)', desc: 'Standard GitHub / Bug Bounty format' },
                { id: 'html', label: 'Standalone HTML (.html)', desc: 'Client report with print/PDF layout' },
                { id: 'json', label: 'Structured JSON (.json)', desc: 'OWASP / DefectDojo compatible' },
                { id: 'sarif', label: 'OASIS SARIF (.sarif)', desc: 'GitHub Code Scanning & SAST compatible' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setFormat(fmt.id as ReportFormat)}
                  className={`w-full text-left p-3 rounded-md border transition-all ${
                    format === fmt.id
                      ? 'border-cyber-500 bg-cyber-500/10 text-dark-100'
                      : 'border-dark-700/60 bg-dark-900/40 text-dark-300 hover:border-dark-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold font-mono">{fmt.label}</span>
                    {format === fmt.id && <CheckCircle className="w-3.5 h-3.5 text-cyber-400" />}
                  </div>
                  <p className="text-[11px] text-dark-400 mt-0.5">{fmt.desc}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Report Customization Controls */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  <Sliders className="w-4 h-4 text-cyber-400" />
                  Report Customization
                </CardTitle>
                <CardDescription>Configure sections and auditor details</CardDescription>
              </div>
            </CardHeader>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-dark-300 uppercase mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={metaOverrides.title ?? reportData.metadata.title}
                  onChange={(e) =>
                    setMetaOverrides((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full bg-dark-900/60 border border-dark-700 rounded px-2.5 py-1.5 text-xs text-dark-200 focus:outline-none focus:border-cyber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono text-dark-300 uppercase mb-1">
                    Auditor Name
                  </label>
                  <input
                    type="text"
                    value={metaOverrides.auditorName ?? ''}
                    onChange={(e) =>
                      setMetaOverrides((prev) => ({ ...prev, auditorName: e.target.value }))
                    }
                    className="w-full bg-dark-900/60 border border-dark-700 rounded px-2 py-1.5 text-xs text-dark-200 focus:outline-none focus:border-cyber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-dark-300 uppercase mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={metaOverrides.organization ?? ''}
                    onChange={(e) =>
                      setMetaOverrides((prev) => ({ ...prev, organization: e.target.value }))
                    }
                    className="w-full bg-dark-900/60 border border-dark-700 rounded px-2 py-1.5 text-xs text-dark-200 focus:outline-none focus:border-cyber-500 font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-dark-800 pt-3 space-y-2">
                <span className="block text-[11px] font-mono text-dark-400 uppercase tracking-wider mb-2">
                  Include Sections
                </span>
                {[
                  { key: 'includeExecutiveSummary', label: 'Executive Summary & Metrics' },
                  { key: 'includeFindingsTable', label: 'Findings Matrix Table' },
                  { key: 'includeRemediations', label: 'OWASP Remediation Guides' },
                  { key: 'includePocCode', label: 'Proof-of-Concept Exploit Code' },
                  { key: 'includeRawRequest', label: 'Raw HTTP Audit Stream' },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2.5 text-xs text-dark-300 cursor-pointer select-none hover:text-dark-200"
                  >
                    <input
                      type="checkbox"
                      checked={options[key as keyof ReportOptions] as boolean}
                      onChange={(e) =>
                        setOptions((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                      className="rounded border-dark-700 text-cyber-500 focus:ring-0 focus:ring-offset-0 bg-dark-900"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-mono text-dark-300 uppercase mb-1">
                  Field Notes / Remarks
                </label>
                <textarea
                  rows={3}
                  value={metaOverrides.customNotes ?? ''}
                  placeholder="Additional assessment notes or scope limits..."
                  onChange={(e) =>
                    setMetaOverrides((prev) => ({ ...prev, customNotes: e.target.value }))
                  }
                  className="w-full bg-dark-900/60 border border-dark-700 rounded px-2.5 py-1.5 text-xs text-dark-200 focus:outline-none focus:border-cyber-500 font-mono resize-none"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Report Preview & Source Code (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle>
                    <Eye className="w-4 h-4 text-cyber-400" />
                    Report Viewer: {exported.filename}
                  </CardTitle>
                  <CardDescription>
                    {format === 'html'
                      ? 'Rendered HTML pentest layout'
                      : format === 'markdown'
                      ? 'Markdown audit document'
                      : 'Machine-readable JSON schema'}
                  </CardDescription>
                </div>
                <div className="flex items-center bg-dark-900/60 border border-dark-700/60 rounded p-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-all ${
                      activeTab === 'preview'
                        ? 'bg-cyber-500/20 text-cyber-400 font-medium'
                        : 'text-dark-400 hover:text-dark-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('source')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-all ${
                      activeTab === 'source'
                        ? 'bg-cyber-500/20 text-cyber-400 font-medium'
                        : 'text-dark-400 hover:text-dark-200'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    Raw Source
                  </button>
                </div>
              </div>
            </CardHeader>

            <div className="p-4">
              {activeTab === 'preview' ? (
                format === 'html' ? (
                  <div className="rounded-lg border border-dark-700 overflow-hidden bg-dark-950">
                    <iframe
                      title="HTML Report Preview"
                      srcDoc={exported.content}
                      sandbox="allow-same-origin"
                      className="w-full h-[600px] border-none"
                    />
                  </div>
                ) : (
                  <div className="bg-dark-950/70 border border-dark-700/60 rounded-lg p-5 font-mono text-xs text-dark-300 max-h-[600px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {exported.content}
                  </div>
                )
              ) : (
                <CodeBlock
                  code={exported.content}
                  language={format === 'html' ? 'html' : format === 'markdown' ? 'markdown' : 'json'}
                  maxHeight="600px"
                  title={exported.filename}
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
