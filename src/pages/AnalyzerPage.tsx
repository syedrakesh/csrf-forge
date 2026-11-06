import { Shield, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';

export function AnalyzerPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-dark-100">CSRF Vulnerability Analyzer</h2>
            <Badge severity="info" size="sm">PHASE 4 MODULE</Badge>
          </div>
          <p className="text-xs text-dark-400 mt-1 font-mono">
            AUTOMATED HEURISTIC HEURISTIC VULNERABILITY AUDITOR
          </p>
        </div>
      </div>

      <Alert type="info" title="Awaiting Request Input">
        Navigate to the Request Parser module or load a demo session to view comprehensive CSRF analysis heuristics.
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Shield className="w-4 h-4 text-cyber-400" />
              Evaluation Criteria
            </CardTitle>
          </CardHeader>
          <ul className="space-y-2 text-xs text-dark-300">
            <li className="flex items-center gap-2">
              <span className="text-cyber-400 font-bold">✓</span>
              State-changing HTTP method detection (POST, PUT, DELETE, PATCH)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-cyber-400 font-bold">✓</span>
              Session cookie presence & SameSite attribute verification
            </li>
            <li className="flex items-center gap-2">
              <span className="text-cyber-400 font-bold">✓</span>
              Anti-CSRF token presence in body, query, and headers
            </li>
            <li className="flex items-center gap-2">
              <span className="text-cyber-400 font-bold">✓</span>
              Content-Type strictness & parser relaxation risks
            </li>
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <CheckCircle2 className="w-4 h-4 text-cyber-400" />
              Risk Calculation
            </CardTitle>
            <CardDescription>CVSS-aligned risk calculation matrix</CardDescription>
          </CardHeader>
          <div className="space-y-3 text-xs text-dark-400">
            <p>
              Calculates a composite severity score (0 to 10) based on cookie configuration, token validation, and endpoint sensitivity.
            </p>
            <div className="p-3 bg-dark-950 rounded border border-dark-800 font-mono text-[11px] text-cyber-400">
              RiskScore = MethodWeight * CookieExposure * TokenAbsence
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
