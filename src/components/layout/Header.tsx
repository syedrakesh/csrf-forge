import { Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="h-14 border-b border-dark-800 bg-dark-950/80 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-cyber-400" />
        <h1 className="text-lg font-semibold">
          <span className="text-cyber-400">CSRF</span>
          <span className="text-dark-300 ml-1">Forge</span>
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-dark-500 font-mono">v1.0.0</span>
      </div>
    </header>
  );
}
