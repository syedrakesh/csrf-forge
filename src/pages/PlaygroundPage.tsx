import { PlayCircle, Eye, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function PlaygroundPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-dark-100">PoC Editor & Playground</h2>
            <Badge severity="info" size="sm">PHASE 6 MODULE</Badge>
          </div>
          <p className="text-xs text-dark-400 mt-1 font-mono">
            SECURE ISOLATED SANDBOX RUNTIME FOR PROOF-OF-CONCEPT VERIFICATION
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Eye className="w-4 h-4 text-cyber-400" />
              Live Preview
            </CardTitle>
            <CardDescription>Rendered in a restricted sandbox iframe</CardDescription>
          </CardHeader>
          <div className="h-64 border border-dashed border-dark-800 rounded-lg flex flex-col items-center justify-center p-6 text-center">
            <PlayCircle className="w-8 h-8 text-dark-600 mb-2" />
            <p className="text-xs text-dark-400">PoC code will render here safely in Phase 6</p>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <ShieldCheck className="w-4 h-4 text-cyber-400" />
              Sandbox Security
            </CardTitle>
          </CardHeader>
          <p className="text-xs text-dark-400 leading-relaxed">
            Previews run with rigorous `sandbox="allow-forms allow-scripts"` flags to prevent parent frame hijacking, cookie stealing, or local storage inspection.
          </p>
        </Card>
      </div>
    </div>
  );
}
