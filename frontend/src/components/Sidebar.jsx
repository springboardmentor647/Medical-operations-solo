import { Link } from 'react-router-dom';
import { LayoutDashboard, BedDouble, BarChart3, Activity, Map } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-200 p-6 h-screen sticky top-0 text-slate-100">
      <h2 className="text-xl font-bold mb-10 text-white">MediOps Pro</h2>
      <nav className="space-y-6">
        <Link to="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
          <LayoutDashboard size={20}/> Dashboard
        </Link>
        <Link to="/floors" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
          <BedDouble size={20}/> Floor Management
        </Link>
        <Link to="/analytics" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
          <BarChart3 size={20}/> Analytics
        </Link>
        <Link to="/events" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
          <Activity size={20}/> Events
        </Link>
        <Link to="/geo" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
          <Map size={20}/> Geographic Intel
        </Link>
      </nav>
    </div>
  );
}