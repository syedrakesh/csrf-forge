import { useState } from 'react';
import { Shield, HelpCircle, Github, Terminal, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function Header() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-dark-800 bg-dark-950/90 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-500"></span>
            </span>
            <Badge severity="secure" size="sm" variant="glow">
              ANALYZER ACTIVE
            </Badge>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-dark-500 font-mono">
            <span>•</span>
            <span className="text-dark-400">ISOLATION: SECURE SANDBOX</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHelpOpen(true)}
            leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Guide
          </Button>

          <a
            href="https://github.com/syedrakesh/csrf-forge"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="p-1.5 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-900 border border-transparent hover:border-dark-800 transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>

          <div className="h-4 w-px bg-dark-800 mx-1"></div>

          <span className="text-xs text-dark-500 font-mono bg-dark-900 px-2 py-0.5 rounded border border-dark-800">
            v1.0.0
          </span>
        </div>
      </header>

      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="CSRF Forge — Security Testing Guide"
        maxWidth="lg"
        footer={
          <Button variant="primary" size="sm" onClick={() => setIsHelpOpen(false)}>
            Understood
          </Button>
        }
      >
        <div className="space-y-4 text-xs leading-relaxed">
          <div className="p-3 bg-dark-950 rounded-lg border border-dark-800 flex items-start gap-3">
            <Shield className="w-5 h-5 text-cyber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-dark-200 text-sm">Cross-Site Request Forgery (CSRF)</p>
              <p className="text-dark-400 mt-1">
                CSRF forces authenticated end users to execute unwanted actions on a web application in which they're currently authenticated.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-dark-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyber-400" />
              Standard Workflow:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-dark-400 pl-1">
              <li>
                <strong className="text-dark-300">Parse:</strong> Paste a raw HTTP request (Burp / ZAP / Chrome DevTools) or cURL command.
              </li>
              <li>
                <strong className="text-dark-300">Analyze:</strong> Let CSRF Forge evaluate SameSite cookie flags, missing anti-CSRF tokens, and CORS misconfigurations.
              </li>
              <li>
                <strong className="text-dark-300">Generate PoC:</strong> Choose an attack vector (Auto-submitting HTML form, Fetch with credentials, Image beacon, or Multipart payload).
              </li>
              <li>
                <strong className="text-dark-300">Test Safely:</strong> Use the isolated in-memory Playground to inspect generated exploit code safely.
              </li>
            </ol>
          </div>

          <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-amber-300">
            <p className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Authorization Notice
            </p>
            <p className="mt-1 text-dark-400">
              Only execute proof of concepts against systems and endpoints where you have explicit written authorization.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
