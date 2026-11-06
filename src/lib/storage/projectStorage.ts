import { Project, ParsedRequest, AnalysisResult, GeneratedPoc } from '../../types';

const STORAGE_KEY = 'csrf_forge_projects_v1';

export interface ProjectBackup {
  version: string;
  exportedAt: number;
  projects: Project[];
}

/**
 * Loads all saved projects from local storage.
 */
export function getSavedProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persists project list into local storage.
 */
export function saveProjects(projects: Project[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a new project from current session data.
 */
export function createProject(
  name: string,
  description: string,
  request?: ParsedRequest | null,
  analysis?: AnalysisResult | null,
  pocs: GeneratedPoc[] = []
): Project {
  const newProject: Project = {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim() || 'Untitled Audit Project',
    description: description.trim(),
    requests: request ? [request] : [],
    analyses: analysis ? [analysis] : [],
    pocs: [...pocs],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const existing = getSavedProjects();
  saveProjects([newProject, ...existing]);
  return newProject;
}

/**
 * Updates an existing project by ID.
 */
export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const projects = getSavedProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const existing = projects[index]!;
  const updated: Project = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };

  projects[index] = updated;
  saveProjects(projects);
  return updated;
}

/**
 * Deletes a project by ID.
 */
export function deleteProject(id: string): boolean {
  const projects = getSavedProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) return false;
  saveProjects(filtered);
  return true;
}

/**
 * Exports all projects as a downloadable JSON string.
 */
export function exportProjectsToJson(): string {
  const backup: ProjectBackup = {
    version: '1.0.0',
    exportedAt: Date.now(),
    projects: getSavedProjects(),
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Imports projects from JSON string, merging with existing projects.
 */
export function importProjectsFromJson(jsonStr: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    let incoming: Project[] = [];

    if (Array.isArray(parsed)) {
      incoming = parsed;
    } else if (parsed && Array.isArray(parsed.projects)) {
      incoming = parsed.projects;
    } else {
      return { success: false, count: 0, error: 'Invalid project archive format' };
    }

    const current = getSavedProjects();
    const existingIds = new Set(current.map((p) => p.id));
    const toAdd: Project[] = [];

    for (const proj of incoming) {
      if (!proj.id || !proj.name) continue;
      if (existingIds.has(proj.id)) {
        // Regenerate ID to prevent collision
        toAdd.push({
          ...proj,
          id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: `${proj.name} (Imported)`,
        });
      } else {
        toAdd.push(proj);
      }
    }

    const merged = [...toAdd, ...current];
    saveProjects(merged);
    return { success: true, count: toAdd.length };
  } catch (err) {
    return { success: false, count: 0, error: (err as Error).message };
  }
}
