import React, { useState } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Plus, 
  Bell, 
  Calendar, 
  Check, 
  Layers,
  ArrowRight,
  User,
  LogOut,
  UserPlus,
  ShieldCheck,
  Eye,
  Sliders,
  Search,
  Sparkles,
  Store
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { DateFilterOption } from '../../types';

interface HeaderProps {
  onOpenNewActivity: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewActivity }) => {
  const { 
    activePage, 
    accounts, 
    activeAccountId, 
    setActiveAccountId, 
    dateFilter, 
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    filteredAlerts,
    resolveAlert,
    currentAccount,
    setActivePage
  } = useApp();

  const { currentUser, logout, hasPermission } = useAuth();

  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navTabs = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'ppc-management', label: 'PPC Manager' },
    { id: 'asin-tracker', label: 'ASIN Matrix' },
    { id: 'inventory', label: 'Inventory (FBA)' },
    { id: 'listing-health', label: 'Listing Health' },
    { id: 'activity-log', label: 'Activities' },
    { id: 'ai-analyst', label: 'AI Analyst' },
    { id: 'team-invites', label: 'Team' },
  ];

  const dateOptions: { id: DateFilterOption; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '3d', label: '3D' },
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
    { id: 'custom', label: 'Custom' }
  ];

  return (
    <header className="h-20 bg-white/75 backdrop-blur-2xl border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-[0_4px_20px_rgba(112,100,160,0.03)]">
      {/* Left: Modern Logo & Store Selector */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative">
          <button
            onClick={() => {
              setIsAccountDropdownOpen(!isAccountDropdownOpen);
              setIsAlertsOpen(false);
              setIsCustomDateOpen(false);
              setIsProfileMenuOpen(false);
            }}
            className="card-popup flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-xs cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 font-bold text-[10px] shrink-0">
              {accounts.length === 0 ? '+' : (activeAccountId === 'all' ? 'ALL' : currentAccount?.countryCode || 'EU')}
            </div>
            
            <div className="text-left">
              <span className="font-bold text-slate-800 tracking-tight block max-w-[140px] md:max-w-[190px] truncate group-hover:text-violet-600 transition-colors">
                {accounts.length === 0 ? 'No Accounts' : (activeAccountId === 'all' ? 'All Accounts Rollup' : currentAccount?.name)}
              </span>
              <span className="text-[10px] text-slate-500 block -mt-0.5 truncate max-w-[140px] md:max-w-[190px]">
                {accounts.length === 0 ? 'Click to add store' : (activeAccountId === 'all' ? `${accounts.length} Client Stores (EU)` : `${currentAccount?.clientName ? `${currentAccount.clientName} · ` : ''}${currentAccount?.marketplace || 'Amazon'}`)}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-600 shrink-0 ml-0.5 transition-colors" />
          </button>

          {/* Account Switching Dropdown */}
          {isAccountDropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden text-xs">
              <div className="px-4 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Switch Amazon Client Store</span>
                <span className="text-violet-600 font-mono font-semibold">{accounts.length} connected</span>
              </div>

              {/* All Accounts Option */}
              <button
                onClick={() => {
                  setActiveAccountId('all');
                  setIsAccountDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-violet-50/70 transition-colors cursor-pointer ${
                  activeAccountId === 'all' ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">All Accounts Rollup Matrix</p>
                    <p className="text-[10px] text-slate-500">Thomas Mild, Haas, Benoit, Ruben</p>
                  </div>
                </div>
                {activeAccountId === 'all' && <Check className="w-4 h-4 text-violet-600" />}
              </button>

              <div className="h-px bg-slate-100 my-1" />

              {/* Individual Client Stores */}
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {accounts.map(acc => {
                  const isCurrent = activeAccountId === acc.id;

                  return (
                    <button
                      key={acc.id}
                      onClick={() => {
                        setActiveAccountId(acc.id);
                        setIsAccountDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-violet-50/60 transition-colors cursor-pointer ${
                        isCurrent ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-violet-700 font-bold text-[10px] shrink-0">
                          {acc.countryCode}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5 truncate">
                            <p className="font-bold text-slate-900 truncate">{acc.name}</p>
                            {acc.clientName && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-violet-100 text-violet-700 font-medium shrink-0">
                                {acc.clientName}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">
                            {acc.marketplace} · Target ACOS: {acc.acosTarget}%
                          </p>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-violet-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Segmented Navigation Pills (Matching screenshot) */}
      <div className="hidden xl:flex items-center gap-1 p-1.5 bg-slate-100/80 rounded-full border border-slate-200/60 shadow-inner">
        {navTabs.map(tab => {
          const isActive = activePage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePage(tab.id)}
              className={`card-popup px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right: Date Filter, Alerts, User Profile, New Activity CTA */}
      <div className="flex items-center gap-2.5">
        {/* Date Filter Segmented Bar */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100/90 border border-slate-200/70 rounded-full text-xs">
          {dateOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                setDateFilter(opt.id);
                if (opt.id === 'custom') {
                  setIsCustomDateOpen(true);
                } else {
                  setIsCustomDateOpen(false);
                }
              }}
              className={`px-3 py-1 rounded-full font-sans text-xs transition-all cursor-pointer whitespace-nowrap ${
                dateFilter === opt.id
                  ? 'bg-white text-violet-700 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range Popover */}
        {isCustomDateOpen && (
          <div className="absolute top-20 right-48 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-2">
            <span className="font-bold text-slate-800 block text-xs">Select Custom Date Range</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-mono text-xs"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* Alerts Notification Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsAlertsOpen(!isAlertsOpen);
              setIsAccountDropdownOpen(false);
              setIsCustomDateOpen(false);
              setIsProfileMenuOpen(false);
            }}
            className="card-popup relative p-2.5 rounded-full bg-white/90 border border-slate-200/80 text-slate-600 hover:text-violet-600 shadow-sm cursor-pointer"
            title="Performance alerts"
          >
            <Bell className="w-4 h-4" />
            {filteredAlerts.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {filteredAlerts.length}
              </span>
            )}
          </button>

          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-2xl py-3 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Active Alerts ({filteredAlerts.length})</span>
                <span className="text-[10px] text-slate-400">Seller Central Monitoring</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {filteredAlerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No active performance alerts.
                  </div>
                ) : (
                  filteredAlerts.map(alert => (
                    <div key={alert.id} className="p-3.5 hover:bg-slate-50 transition-colors text-xs space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-800">{alert.title}</span>
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="text-[10px] text-violet-600 font-semibold hover:underline shrink-0 cursor-pointer"
                        >
                          Resolve
                        </button>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{alert.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Session Profile & Role Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsAccountDropdownOpen(false);
              setIsAlertsOpen(false);
              setIsCustomDateOpen(false);
            }}
            className="card-popup flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-full bg-white/90 border border-slate-200/80 shadow-sm text-xs cursor-pointer"
            title="User Profile & Role"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {currentUser?.avatarInitials || 'HM'}
            </div>
            <div className="text-left hidden sm:block">
              <span className="font-bold text-slate-800 block text-xs leading-tight">
                {currentUser?.name || 'Haseeb Malik'}
              </span>
              <span className="text-[9px] font-mono uppercase font-bold text-violet-600 block">
                {currentUser?.role === 'admin' ? 'Owner / Admin' : currentUser?.role === 'editor' ? 'VA Editor' : 'Client Viewer'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-xs space-y-1">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-bold text-slate-900">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{currentUser?.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500">Role:</span>
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-violet-100 text-violet-700">
                    {currentUser?.role.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Role Info */}
              <div className="px-4 py-2 bg-slate-50 rounded-xl mx-2 text-[11px] text-slate-600">
                <span className="font-semibold block text-slate-700">Account Access Level</span>
                <span className="text-[10px] text-slate-500">
                  {currentUser?.role === 'admin' 
                    ? 'Owner with Full Administrative Privileges' 
                    : currentUser?.role === 'editor' 
                    ? 'VA Specialist (Bid & Activity Operations)' 
                    : 'Client (Read-Only Performance Oversight)'}
                </span>
              </div>

              <div className="h-px bg-slate-100 my-1" />

              <button
                onClick={() => {
                  logout();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
