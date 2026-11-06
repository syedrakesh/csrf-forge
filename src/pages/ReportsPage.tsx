import { FileText, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function ReportsPage() {
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
        <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} disabled>
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              <FileText className="w-4 h-4 text-cyber-400" />
              Export Formats
            </CardTitle>
            <CardDescription>Generate audit findings in Markdown, HTML, and JSON</CardDescription>
          </div>
        </CardHeader>
        <div className="p-8 text-center text-xs text-dark-500 font-mono">
          Vulnerability reporting engine will be operational in Phase 8.
        </div>
      </Card>
    </div>
  );
}
