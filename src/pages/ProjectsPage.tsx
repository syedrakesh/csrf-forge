import { FolderOpen, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function ProjectsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-dark-100">Project & Template Manager</h2>
            <Badge severity="info" size="sm">PHASE 7 MODULE</Badge>
          </div>
          <p className="text-xs text-dark-400 mt-1 font-mono">
            LOCAL-FIRST AUDIT STORAGE & EXPLOIT TEMPLATE ARCHIVE
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} disabled>
          New Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              <FolderOpen className="w-4 h-4 text-cyber-400" />
              Saved Audit Sessions
            </CardTitle>
            <CardDescription>All project data is stored locally in IndexedDB / LocalStorage</CardDescription>
          </div>
        </CardHeader>
        <div className="p-8 text-center text-xs text-dark-500 font-mono">
          No projects saved yet. Projects and templates will be enabled in Phase 7.
        </div>
      </Card>
    </div>
  );
}
