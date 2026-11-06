import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCode,
  Shield,
  Zap,
  PlayCircle,
  FolderOpen,
  FileText,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/parser', icon: FileCode, label: 'Request Parser' },
  { to: '/analyzer', icon: Shield, label: 'Analyzer' },
  { to: '/generator', icon: Zap, label: 'PoC Generator' },
  { to: '/playground', icon: PlayCircle, label: 'Playground' },
  { to: '/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

export function Sidebar() {
  return (
    <aside className="w-60 border-r border-dark-800 bg-dark-950 flex flex-col">
      <div className="p-4 border-b border-dark-800">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-cyber-400" />
          <span className="font-bold text-lg tracking-tight">
            <span className="text-cyber-400">CSRF</span>
            <span className="text-dark-300">Forge</span>
          </span>
        </div>
        <p className="text-xs text-dark-500 mt-1">PoC Generator & Analyzer</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-cyber-600/10 text-cyber-400 border border-cyber-500/20'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-900'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-dark-800">
        <p className="text-xs text-dark-600 text-center">
          Security Testing Tool
        </p>
      </div>
    </aside>
  );
}
