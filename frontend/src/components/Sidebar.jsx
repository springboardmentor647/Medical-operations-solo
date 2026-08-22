import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  BarChart3, 
  History, 
  MapPin, 
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Command Center" },
    { to: "/floors", icon: Layers, label: "Floor & Bed Maps" },
    { to: "/analytics", icon: BarChart3, label: "Operational Intelligence" },
    { to: "/risks", icon: AlertTriangle, label: "Risk & Alerts" },
    { to: "/events", icon: History, label: "Audit Event Log" },
    { to: "/geographic", icon: MapPin, label: "Geographic Coverage" }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      <div>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-base">MediOps Intelligence</h1>
            <p className="text-[10px] text-blue-400 font-medium">Enterprise Health Platform</p>
          </div>
        </div>

        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/50"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-medium text-slate-400">Database Engine Live</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">SQLite-WAL</span>
        </div>
      </div>
    </aside>
  );
}