import React from 'react';
import { 
  LayoutDashboard, 
  Store, 
  ClipboardList, 
  Target, 
  LineChart, 
  Package, 
  ShieldCheck, 
  Crosshair, 
  CalendarRange, 
  FileText, 
  Sparkles, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { 
    activePage, 
    setActivePage, 
    isSidebarCollapsed, 
    setIsSidebarCollapsed,
    filteredActivities,
    accounts,
  } = useApp();

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'asin-tracker', label: 'ASIN Priority', icon: Crosshair, badge: 'Hero', badgeColor: 'bg-violet-100 text-violet-700' },
    { id: 'accounts', label: 'Client Accounts', icon: Store, badge: accounts.length },
    { id: 'activity-log', label: 'Activity Log', icon: ClipboardList, badge: filteredActivities.length },
    { id: 'ppc-management', label: 'PPC Management', icon: Target },
    { id: 'sales-analytics', label: 'Sales Analytics', icon: LineChart },
    { id: 'inventory', label: 'Inventory (FBA)', icon: Package },
    { id: 'listing-health', label: 'Listing Health', icon: ShieldCheck },
    { id: 'goals-targets', label: 'Goals & Targets', icon: Crosshair },
    { id: 'weekly-reports', label: 'Weekly Reports', icon: CalendarRange },
    { id: 'monthly-reports', label: 'Monthly Reports', icon: FileText },
    { id: 'ai-analyst', label: 'AI Analyst', icon: Sparkles, badge: 'AI', badgeColor: 'bg-indigo-100 text-indigo-700' },
    { id: 'team-invites', label: 'Team & Invites', icon: UserPlus, badge: 'Invite', badgeColor: 'bg-emerald-100 text-emerald-700' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`relative flex flex-col bg-white/70 backdrop-blur-2xl border-r border-slate-200/80 transition-all duration-300 select-none z-20 shadow-[2px_0_20px_rgba(112,100,160,0.03)] ${
        isSidebarCollapsed ? 'w-[76px]' : 'w-[250px]'
      }`}
    >
      {/* Brand Header with futuristic ring logo mark like screenshot */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-slate-200/70">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActivePage('overview')}>
          {/* Logo Mark Matching the Screenshot */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-violet-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-md shadow-violet-500/25">
            <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          {!isSidebarCollapsed && (
            <div className="truncate">
              <span className="text-sm font-extrabold text-slate-900 tracking-tight block">Haseeb PPC</span>
              <span className="text-[10px] text-violet-600 font-bold tracking-wider uppercase block">Operations Hub</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsSidebarCollapsed(prev => !prev)}
          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group cursor-pointer ${
                isActive
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25 translate-x-1'
                  : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50/70 hover:translate-x-1'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform ${
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-violet-600'
              }`} />

              {!isSidebarCollapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : (item.badgeColor || 'bg-slate-100 text-slate-600')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Agency Footer */}
      {!isSidebarCollapsed && (
        <div className="p-4 border-t border-slate-200/70 m-3 rounded-2xl bg-gradient-to-br from-violet-50/80 to-indigo-50/80 border border-violet-100 text-slate-700 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-900 text-[11px]">4 Client Stores Active</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            DE · FR · UK · NL · IT · ES portfolio managed in Euro (€).
          </p>
        </div>
      )}
    </aside>
  );
};
