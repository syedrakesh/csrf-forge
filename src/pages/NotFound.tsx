import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <AlertTriangle className="w-16 h-16 text-amber-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">404 — Page Not Found</h2>
      <p className="text-dark-400 mb-6">The requested page does not exist.</p>
      <Link to="/" className="cyber-btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
}
