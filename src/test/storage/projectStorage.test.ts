import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSavedProjects,
  createProject,
  deleteProject,
  updateProject,
  exportProjectsToJson,
  importProjectsFromJson,
} from '../../lib/storage/projectStorage';
import { ParsedRequest } from '../../types';

describe('Project Storage (projectStorage.ts)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const sampleReq: ParsedRequest = {
    id: 'req-test',
    method: 'POST',
    url: 'https://test.corp/api',
    headers: {},
    cookies: {},
    body: 'a=1',
    contentType: 'application/x-www-form-urlencoded',
    timestamp: Date.now(),
  };

  it('creates and retrieves a new project', () => {
    const proj = createProject('Audit 1', 'Test assessment', sampleReq, null, []);
    expect(proj.name).toBe('Audit 1');

    const list = getSavedProjects();
    expect(list.length).toBe(1);
    expect(list[0]?.name).toBe('Audit 1');
    expect(list[0]?.requests.length).toBe(1);
  });

  it('updates an existing project', () => {
    const proj = createProject('Initial Name', 'Desc');
    const updated = updateProject(proj.id, { name: 'New Name' });

    expect(updated?.name).toBe('New Name');
    const list = getSavedProjects();
    expect(list[0]?.name).toBe('New Name');
  });

  it('deletes a project', () => {
    const proj = createProject('To Delete', 'Desc');
    expect(getSavedProjects().length).toBe(1);

    const deleted = deleteProject(proj.id);
    expect(deleted).toBe(true);
    expect(getSavedProjects().length).toBe(0);
  });

  it('exports and imports projects via JSON', () => {
    createProject('Proj A', 'Desc A');
    createProject('Proj B', 'Desc B');

    const json = exportProjectsToJson();
    expect(json).toContain('Proj A');
    expect(json).toContain('Proj B');

    localStorage.clear();
    expect(getSavedProjects().length).toBe(0);

    const importRes = importProjectsFromJson(json);
    expect(importRes.success).toBe(true);
    expect(importRes.count).toBe(2);
    expect(getSavedProjects().length).toBe(2);
  });
});
