import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCode,
  Shield,
  Zap,
  PlayCircle,
  FolderOpen,
  FileText,
  Activity,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', badge: 'Live' },
  { to: '/parser', icon: FileCode, label: 'Request Parser' },
  { to: '/analyzer', icon: Shield, label: 'Analyzer' },
  { to: '/generator', icon: Zap, label: 'PoC Generator' },
  { to: '/playground', icon: PlayCircle, label: 'Playground' },
  { to: '/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-dark-800 bg-dark-950 flex flex-col shrink-0 select-none">
      {/* Brand */}
      <div className="p-4 border-b border-dark-800">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-lg bg-cyber-950 border border-cyber-500/40 group-hover:border-cyber-400/80 transition-colors shadow-sm shadow-cyber-500/20">
            <Zap className="w-5 h-5 text-cyber-400 group-hover:text-cyber-300 transition-colors" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight leading-none">
              <span className="text-cyber-400">CSRF</span>
              <span className="text-dark-200 ml-1">Forge</span>
            </div>
            <p className="text-[11px] text-dark-500 font-mono mt-1">PoC Generator & Analyzer</p>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-dark-500 font-semibold">
          Core Modules
        </div>

        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyber-500/15 text-cyber-300 border border-cyber-500/30 shadow-sm shadow-cyber-500/10'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-900/80 border border-transparent'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </div>
            {badge && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyber-500/20 text-cyber-400 border border-cyber-500/30">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status Footer */}
      <div className="p-4 border-t border-dark-800 bg-dark-950/60">
        <div className="flex items-center justify-between p-2 rounded-md bg-dark-900 border border-dark-800/80 text-[11px] text-dark-400 font-mono">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyber-400" />
            <span>State: IDLE</span>
          </div>
          <span className="text-cyber-400 font-semibold">CLIENT-SIDE</span>
        </div>
      </div>
    </aside>
  );
}
