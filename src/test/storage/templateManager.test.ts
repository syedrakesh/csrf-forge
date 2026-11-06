import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllTemplates,
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
} from '../../lib/storage/templateManager';

describe('Template Manager (templateManager.ts)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves built-in templates by default', () => {
    const list = getAllTemplates();
    expect(list.length).toBeGreaterThanOrEqual(3);
    const wireTransfer = list.find((t) => t.id === 'tpl-wire-transfer');
    expect(wireTransfer).toBeDefined();
    expect(wireTransfer?.category).toBe('Banking');
  });

  it('saves and deletes a custom template', () => {
    const tpl = saveCustomTemplate('My Exploit', 'Custom payload', '<html></html>', ['custom', 'test']);
    expect(tpl.name).toBe('My Exploit');

    const customs = getCustomTemplates();
    expect(customs.length).toBe(1);
    expect(customs[0]?.name).toBe('My Exploit');

    deleteCustomTemplate(tpl.id);
    expect(getCustomTemplates().length).toBe(0);
  });
});
