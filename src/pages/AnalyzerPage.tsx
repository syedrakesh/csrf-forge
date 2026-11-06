import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  ArrowRight,
  Filter,
  FileCode,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../context';
import { analyzeCsrfRequest, calculateRiskScore } from '../lib/analyzer';
import { parseInput, SAMPLE_REQUESTS } from '../lib/parser';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Severity } from '../types';

export function AnalyzerPage() {
  const navigate = useNavigate();
  const { currentRequest, setCurrentRequest, setCurrentAnalysis } = useApp();

  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all');
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({});

  // Compute or reuse analysis
  const analysis = useMemo(() => {
    if (!currentRequest) return null;
    const result = analyzeCsrfRequest(currentRequest);
    return result;
  }, [currentRequest]);

  // Sync to context cleanly via useEffect
  useEffect(() => {
    if (analysis) {
      setCurrentAnalysis(analysis);
    }
  }, [analysis, setCurrentAnalysis]);

  const riskMetrics = useMemo(() => {
    if (!analysis) return null;
    const severities = analysis.findings.map((f) => f.severity);
    return calculateRiskScore(severities);
  }, [analysis]);

  const toggleFinding = (id: string) => {
    setExpandedFindings((prev) => ({ ...prev, [id]: !prev[id] }));
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

  const filteredFindings = useMemo(() => {
    if (!analysis) return [];
    if (severityFilter === 'all') return analysis.findings;
    return analysis.findings.filter((f) => f.severity === severityFilter);
  }, [analysis, severityFilter]);

  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };
    analysis?.findings.forEach((f) => {
      counts[f.severity] = (counts[f.severity] || 0) + 1;
    });
    return counts;
  }, [analysis]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-dark-100">CSRF Vulnerability Analyzer</h2>
            <Badge severity="secure" size="sm">HEURISTIC AUDITOR</Badge>
          </div>
          <p className="text-xs text-dark-400 mt-1 font-mono">
            EVALUATING SAMESITE COOKIES • ANTI-CSRF TOKENS • PREFLIGHT BYPASSES
          </p>
        </div>

        {currentRequest && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/parser')}
              leftIcon={<FileCode className="w-3.5 h-3.5" />}
            >
              Edit Request
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/generator')}
              rightIcon={<Zap className="w-3.5 h-3.5" />}
            >
              Generate PoC
            </Button>
          </div>
        )}
      </div>

      {/* No Request Selected State */}
      {!currentRequest && (
        <Card className="text-center py-12 px-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-3 w-12 h-12 rounded-full bg-cyber-950 border border-cyber-500/30 text-cyber-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-dark-100">No Request Loaded for Analysis</h3>
              <p className="text-xs text-dark-400 mt-1">
                Paste an HTTP stream in the Request Parser or load one of our realistic test scenarios to trigger real-time heuristic security inspection.
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

      {/* Analysis Results View */}
      {currentRequest && analysis && riskMetrics && (
        <>
          {/* Risk Score Hero Card */}
          <Card
            borderVariant={
              riskMetrics.severity === 'critical' || riskMetrics.severity === 'high'
                ? 'danger'
                : riskMetrics.severity === 'medium'
                ? 'warning'
                : 'accent'
            }
            glow
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Score Metric */}
              <div className="flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-dark-800 pb-5 lg:pb-0 lg:pr-5">
                <div
                  className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 font-mono ${
                    riskMetrics.severity === 'critical'
                      ? 'border-red-500/60 bg-red-950/40 text-red-400 shadow-lg shadow-red-500/20'
                      : riskMetrics.severity === 'high'
                      ? 'border-orange-500/60 bg-orange-950/40 text-orange-400 shadow-lg shadow-orange-500/20'
                      : riskMetrics.severity === 'medium'
                      ? 'border-amber-500/60 bg-amber-950/40 text-amber-400 shadow-lg shadow-amber-500/20'
                      : 'border-cyber-500/60 bg-cyber-950/40 text-cyber-400 shadow-lg shadow-cyber-500/20'
                  }`}
                >
                  <span className="text-3xl font-extrabold tracking-tight">{riskMetrics.score}</span>
                  <span className="text-[10px] text-dark-400 uppercase font-bold">/ 10.0</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge severity={riskMetrics.severity} size="sm" variant="glow">
                      {riskMetrics.label}
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold text-dark-100">
                    {analysis.isVulnerable ? 'VULNERABLE TO CSRF' : 'ADEQUATE DEFENSES DETECTED'}
                  </h4>
                  <p className="text-xs text-dark-400">{riskMetrics.summary}</p>
                </div>
              </div>

              {/* Target Details */}
              <div className="lg:col-span-2 space-y-3 font-mono text-xs">
                <div className="p-3 bg-dark-950 rounded-lg border border-dark-800 space-y-1.5">
                  <div className="flex items-center justify-between text-dark-400">
                    <span>EVALUATED ENDPOINT:</span>
                    <Badge size="sm">{currentRequest.method}</Badge>
                  </div>
                  <p className="text-dark-100 font-semibold break-all text-sm">{currentRequest.url}</p>
                  <p className="text-dark-400 text-[11px]">
                    CONTENT-TYPE: {currentRequest.contentType || 'application/x-www-form-urlencoded'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-dark-400">
                    Identified {analysis.findings.length} security observation
                    {analysis.findings.length === 1 ? '' : 's'}.
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/generator')}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Proceed to PoC Generator
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Severity Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-dark-900 border border-dark-800 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-dark-300 font-medium">
              <Filter className="w-3.5 h-3.5 text-cyber-400" />
              <span>Filter Findings:</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSeverityFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                  severityFilter === 'all'
                    ? 'bg-cyber-500/20 text-cyber-300 border border-cyber-500/40'
                    : 'bg-dark-950 text-dark-400 hover:text-dark-200 border border-dark-800'
                }`}
              >
                ALL ({analysis.findings.length})
              </button>

              {(['critical', 'high', 'medium', 'low', 'info'] as const).map((sev) => {
                const count = severityCounts[sev] || 0;
                if (count === 0) return null;
                return (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                      severityFilter === sev
                        ? 'bg-cyber-500/20 text-cyber-300 border border-cyber-500/40'
                        : 'bg-dark-950 text-dark-400 hover:text-dark-200 border border-dark-800'
                    }`}
                  >
                    {sev.toUpperCase()} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Findings List */}
          <div className="space-y-4">
            {filteredFindings.map((finding) => {
              const isExpanded = !!expandedFindings[finding.id];
              return (
                <Card key={finding.id} className="transition-all">
                  <div
                    className="flex items-start justify-between gap-4 cursor-pointer select-none"
                    onClick={() => toggleFinding(finding.id)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <Badge severity={finding.severity} size="sm">
                          {finding.severity.toUpperCase()}
                        </Badge>
                        <span className="text-xs font-mono text-dark-500">[{finding.category}]</span>
                      </div>
                      <h4 className="text-sm font-bold text-dark-100 flex items-center gap-2 pt-1">
                        {finding.title}
                      </h4>
                      <p className="text-xs text-dark-300 leading-relaxed pt-0.5">
                        {finding.description}
                      </p>
                    </div>

                    <div className="p-1.5 text-dark-400 hover:text-dark-200 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expandable Remediation Panel */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-dark-800 space-y-3 text-xs animate-in fade-in duration-150">
                      <div className="p-3 bg-dark-950 rounded-lg border border-dark-800">
                        <p className="font-semibold text-cyber-400 mb-1 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Recommended Mitigation:
                        </p>
                        <p className="text-dark-300 leading-relaxed">{finding.recommendation}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-dark-400 pt-1">
                        <span className="font-mono text-[11px]">VULNERABILITY ID: {finding.id}</span>
                        <a
                          href="https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-cyber-400 hover:underline"
                        >
                          OWASP Remediation Standard
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
