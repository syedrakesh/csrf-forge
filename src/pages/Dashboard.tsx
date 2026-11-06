import { Shield, FileCode, Zap, AlertTriangle } from 'lucide-react';

const stats = [
  { label: 'Requests Parsed', value: '0', icon: FileCode, color: 'text-blue-400' },
  { label: 'Vulnerabilities Found', value: '0', icon: AlertTriangle, color: 'text-amber-400' },
  { label: 'PoCs Generated', value: '0', icon: Zap, color: 'text-cyber-400' },
  { label: 'Security Score', value: 'N/A', icon: Shield, color: 'text-purple-400' },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-dark-400 mt-1">
          CSRF vulnerability testing overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="cyber-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-dark-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold mt-1">{value}</p>
              </div>
              <Icon className={`w-8 h-8 ${color} opacity-50`} />
            </div>
          </div>
        ))}
      </div>

      <div className="cyber-card">
        <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-md bg-dark-950/50">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyber-600/20 text-cyber-400 text-xs font-bold">1</span>
            <div>
              <p className="text-sm font-medium">Paste HTTP Request or cURL Command</p>
              <p className="text-xs text-dark-400 mt-0.5">Navigate to the Request Parser to input your HTTP request</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-md bg-dark-950/50">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyber-600/20 text-cyber-400 text-xs font-bold">2</span>
            <div>
              <p className="text-sm font-medium">Analyze for CSRF Vulnerabilities</p>
              <p className="text-xs text-dark-400 mt-0.5">The analyzer checks for missing tokens, headers, and protections</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-md bg-dark-950/50">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyber-600/20 text-cyber-400 text-xs font-bold">3</span>
            <div>
              <p className="text-sm font-medium">Generate CSRF Proof of Concept</p>
              <p className="text-xs text-dark-400 mt-0.5">Create a working PoC to demonstrate the vulnerability</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
