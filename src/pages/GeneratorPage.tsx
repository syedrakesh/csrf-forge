import { Zap, Code, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function GeneratorPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-dark-100">CSRF PoC Generator</h2>
            <Badge severity="info" size="sm">PHASE 5 MODULE</Badge>
          </div>
          <p className="text-xs text-dark-400 mt-1 font-mono">
            MULTI-VECTOR EXPLOIT PROOF-OF-CONCEPT COMPILER
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              <Code className="w-4 h-4 text-cyber-400" />
              HTML Auto-Submit Form
            </CardTitle>
          </CardHeader>
          <p className="text-xs text-dark-400">
            Hidden DOM form with JavaScript execution to test standard browser submission.
          </p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              <Zap className="w-4 h-4 text-cyber-400" />
              Fetch / XHR with Credentials
            </CardTitle>
          </CardHeader>
          <p className="text-xs text-dark-400">
            Modern asynchronous payload using withCredentials=true to evaluate CORS preflight defenses.
          </p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              <ShieldAlert className="w-4 h-4 text-cyber-400" />
              Image & Link Beacon
            </CardTitle>
          </CardHeader>
          <p className="text-xs text-dark-400">
            Lightweight zero-interaction GET exploit via DOM media tag embedding.
          </p>
        </Card>
      </div>
    </div>
  );
}
