import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Plus,
  Save,
  Download,
  Upload,
  Search,
  Trash2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context';
import {
  getSavedProjects,
  createProject,
  deleteProject,
  exportProjectsToJson,
  importProjectsFromJson,
  getAllTemplates,
  ExploitTemplate,
} from '../lib/storage';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Tabs } from '../components/ui/Tabs';
import { Project } from '../types';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { currentRequest, currentAnalysis, generatedPocs, setCurrentRequest, setCurrentAnalysis } =
    useApp();

  const [activeTab, setActiveTab] = useState<'projects' | 'templates'>('projects');
  const [projects, setProjectsList] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [templates, setTemplates] = useState<ExploitTemplate[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load projects & templates on mount
  useEffect(() => {
    setProjectsList(getSavedProjects());
    setTemplates(getAllTemplates());
  }, []);

  const handleCreateProject = () => {
    if (!projectName.trim()) return;

    createProject(
      projectName,
      projectDesc,
      currentRequest,
      currentAnalysis,
      generatedPocs
    );

    setProjectsList(getSavedProjects());
    setProjectName('');
    setProjectDesc('');
    setIsCreateModalOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    setProjectsList(getSavedProjects());
  };

  const handleRestoreProject = (project: Project) => {
    if (project.requests.length > 0 && project.requests[0]) {
      setCurrentRequest(project.requests[0]);
    }
    if (project.analyses.length > 0 && project.analyses[0]) {
      setCurrentAnalysis(project.analyses[0]);
    }
    navigate('/analyzer');
  };

  const handleExportBackup = () => {
    const jsonStr = exportProjectsToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csrf_forge_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importProjectsFromJson(content);
      if (res.success) {
        setProjectsList(getSavedProjects());
        setImportStatus(`Successfully imported ${res.count} project(s).`);
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus(`Import failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadTemplateToPlayground = (tpl: ExploitTemplate) => {
    sessionStorage.setItem(
      'csrf_forge_active_poc',
      JSON.stringify({
        id: tpl.id,
        requestId: 'template',
        format: 'html-form',
        code: tpl.code,
        description: tpl.description,
        timestamp: Date.now(),
      })
    );
    navigate('/playground');
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-dark-100">Project & Template Manager</h2>
            <Badge severity="secure" size="sm">OFFLINE PERSISTENCE</Badge>
          </div>
          <p className="text-xs text-dark-400 mt-1 font-mono">
            LOCAL AUDIT SESSIONS • EXPLOIT ARCHIVES • JSON BACKUP & RESTORE
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Import JSON
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportBackup}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export All
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Project
          </Button>
        </div>
      </div>

      {importStatus && (
        <Badge severity="info" variant="glow" size="md">
          {importStatus}
        </Badge>
      )}

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
        tabs={[
          {
            id: 'projects',
            label: 'Audit Projects',
            icon: <FolderOpen className="w-3.5 h-3.5" />,
            badge: projects.length,
          },
          {
            id: 'templates',
            label: 'Exploit Templates',
            icon: <BookOpen className="w-3.5 h-3.5" />,
            badge: templates.length,
          },
        ]}
      />

      {/* Tab 1: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-dark-500" />
            <input
              type="text"
              placeholder="Search projects by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-950 border border-dark-800 rounded-md pl-9 pr-3 py-2 text-xs text-dark-200 placeholder-dark-600 focus:outline-none focus:border-cyber-500/50 font-mono"
            />
          </div>

          {filteredProjects.length === 0 ? (
            <Card className="text-center py-12">
              <FolderOpen className="w-10 h-10 text-dark-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-dark-200">No Projects Found</h3>
              <p className="text-xs text-dark-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'No projects matched your search query.'
                  : 'You have not saved any audit sessions yet. Create one or snapshot your active session.'}
              </p>
              <div className="pt-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Create First Project
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="space-y-3 group hover:border-dark-600 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-dark-100 group-hover:text-cyber-300 transition-colors">
                        {project.name}
                      </h4>
                      <p className="text-xs text-dark-400 mt-0.5 line-clamp-2">
                        {project.description || 'No description provided.'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      title="Delete Project"
                      className="text-dark-500 hover:text-red-400 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-mono text-dark-400 border-t border-dark-800">
                    <Badge size="sm">
                      {project.requests.length} REQ
                    </Badge>
                    <Badge size="sm" severity={project.analyses.length > 0 ? 'high' : 'neutral'}>
                      {project.analyses.length} AUDIT
                    </Badge>
                    <Badge size="sm">
                      {project.pocs.length} POC
                    </Badge>
                    <span className="text-[10px] text-dark-500 ml-auto">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRestoreProject(project)}
                      rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      Restore to Workspace
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Exploit Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge size="sm" severity="info">
                    {tpl.category}
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-dark-100">{tpl.name}</h4>
                <p className="text-xs text-dark-400 leading-relaxed">{tpl.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {tpl.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-dark-950 border border-dark-800 rounded text-[10px] text-dark-400 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-dark-800">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleLoadTemplateToPlayground(tpl)}
                  className="w-full"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Load into Playground
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateProject}
              leftIcon={<Save className="w-3.5 h-3.5" />}
              disabled={!projectName.trim()}
            >
              Save Project
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-200 mb-1 font-mono">
              Project Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Q4 Internal Portal CSRF Assessment"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-dark-950 border border-dark-800 rounded-md px-3 py-2 text-xs text-dark-100 placeholder-dark-600 focus:outline-none focus:border-cyber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-200 mb-1 font-mono">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Scope, test accounts, target endpoints notes..."
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              className="w-full bg-dark-950 border border-dark-800 rounded-md px-3 py-2 text-xs text-dark-100 placeholder-dark-600 focus:outline-none focus:border-cyber-500/50"
            />
          </div>

          <div className="p-3 bg-dark-950 rounded-lg border border-dark-800 space-y-1 text-xs">
            <span className="font-semibold text-dark-300 font-mono">Session Snapshot Data:</span>
            <ul className="text-dark-400 space-y-0.5 list-disc list-inside text-[11px]">
              <li>Active Request: {currentRequest ? currentRequest.url : 'None'}</li>
              <li>Analysis Findings: {currentAnalysis ? currentAnalysis.findings.length : 0}</li>
              <li>Generated PoCs: {generatedPocs.length}</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
}
