import { FileCode, Play, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function ParserPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-dark-100">HTTP & cURL Request Parser</h2>
            <Badge severity="info" size="sm">PHASE 3 MODULE</Badge>
          </div>
          <p className="text-xs text-dark-400 mt-1 font-mono">
            RAW HTTP STREAM DECODER & cURL SYNTAX ANALYZER
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              <FileCode className="w-4 h-4 text-cyber-400" />
              Input HTTP Request / cURL Command
            </CardTitle>
            <CardDescription>
              Paste your raw request from proxy tools or browser network tab
            </CardDescription>
          </div>
          <Button variant="secondary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
            Load Sample
          </Button>
        </CardHeader>

        <div className="space-y-4">
          <textarea
            rows={10}
            placeholder="POST /api/v1/update HTTP/1.1&#10;Host: target.example&#10;Cookie: session=xyz&#10;Content-Type: application/x-www-form-urlencoded&#10;&#10;key=value"
            className="w-full bg-dark-950 border border-dark-800 rounded-lg p-4 font-mono text-xs text-dark-200 placeholder-dark-600 focus:outline-none focus:border-cyber-500/50"
            disabled
          />

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-dark-500 font-mono">
              Parser engine ready for Phase 3 implementation
            </span>
            <Button variant="primary" size="sm" leftIcon={<Play className="w-3.5 h-3.5" />} disabled>
              Parse Request
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
