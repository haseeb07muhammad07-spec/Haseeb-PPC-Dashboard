import React, { useState } from 'react';
import { 
  Wallet, 
  Clock, 
  Users, 
  CreditCard, 
  MoreVertical, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Store
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { DateFilterOption } from '../../types';

interface OverviewPageProps {
  onOpenNewActivity: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onOpenNewActivity }) => {
  const { 
    accounts, 
    activeAccountId, 
    currentAccount, 
    salesData, 
    dateFilter, 
    setDateFilter,
    filteredActivities, 
    filteredCampaigns, 
    filteredAlerts,
    filteredCatalogAsins,
    setActivePage,
    setActiveAccountId
  } = useApp();

  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(4); // Default to May or peak bar

  // Financial calculations for the active filtered timeframe
  const totalSales = salesData.reduce((sum, d) => sum + d.totalSales, 0);
  const totalAdSales = salesData.reduce((sum, d) => sum + d.adSales, 0);
  const totalOrganicSales = salesData.reduce((sum, d) => sum + d.organicSales, 0);
  const totalAdSpend = salesData.reduce((sum, d) => sum + d.adSpend, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0);

  const acos = totalAdSales > 0 ? +((totalAdSpend / totalAdSales) * 100).toFixed(1) : 0;
  const roas = totalAdSpend > 0 ? +(totalAdSales / totalAdSpend).toFixed(2) : 0;
  const tacos = totalSales > 0 ? +((totalAdSpend / totalSales) * 100).toFixed(1) : 0;

  const targetAcos = currentAccount ? currentAccount.acosTarget : 22;
  const currency = currentAccount ? currentAccount.currency : '€';

  // Monthly sales bar chart data matching the screenshot style (Jan - Sep)
  const monthlyChartData = [
    { month: 'Jan', total: 64200, adSpend: 11200, offline: 14200, online: 50000 },
    { month: 'Feb', total: 72400, adSpend: 12800, offline: 16500, online: 55900 },
    { month: 'Mar', total: 81000, adSpend: 14500, offline: 17800, online: 63200 },
    { month: 'Apr', total: 78500, adSpend: 13900, offline: 15200, online: 63300 },
    { month: 'May', total: 100799, adSpend: 18420, offline: 12201, online: 100799, isPeak: true },
    { month: 'Jun', total: 91500, adSpend: 16200, offline: 18400, online: 73100 },
    { month: 'Jul', total: 84200, adSpend: 15100, offline: 19100, online: 65100 },
    { month: 'Aug', total: 88900, adSpend: 15800, offline: 18900, online: 70000 },
    { month: 'Sep', total: 96400, adSpend: 17300, offline: 20400, online: 76000 }
  ];

  const greetingName = 'Haseeb';

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      {/* Top Greeting Header (Matching Screenshot: "Good morning, James!") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good morning, {greetingName}!
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Overview of 4 Amazon Client Stores · Portfolio performance is tracking ahead of targets
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActivePage('team-invites')}
            className="card-popup px-4 py-2 rounded-2xl bg-white/90 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-sm hover:border-violet-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-violet-600" />
            <span>Manage Access</span>
          </button>

          <button
            onClick={onOpenNewActivity}
            className="card-popup px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-violet-500/25 flex items-center gap-1.5 cursor-pointer hover:shadow-lg hover:shadow-violet-500/35"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Log Activity</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Top Frosted Glass Metric Cards (Exact layout from screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Total Sales (Bank Balance in screenshot) */}
        <div 
          onClick={() => setActivePage('sales-analytics')}
          className="card-popup glass-card p-6 rounded-3xl border border-white/95 space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center text-slate-800 shadow-sm group-hover:bg-violet-50 group-hover:text-violet-600 group-hover:border-violet-200 transition-colors">
              <Wallet className="w-5 h-5 stroke-[1.8]" />
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {currency}{totalSales.toLocaleString()}
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Total client portfolio sales
            </p>
          </div>
        </div>

        {/* Card 2: Portfolio ACOS (Uncategorized in screenshot) */}
        <div 
          onClick={() => setActivePage('ppc-management')}
          className="card-popup glass-card p-6 rounded-3xl border border-white/95 space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center text-slate-800 shadow-sm group-hover:bg-violet-50 group-hover:text-violet-600 group-hover:border-violet-200 transition-colors">
              <Clock className="w-5 h-5 stroke-[1.8]" />
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-sans flex items-baseline gap-2">
              <span>{acos}%</span>
              <span className="text-xs font-semibold text-emerald-600 font-mono">
                ≤ {targetAcos}% Target
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Portfolio ACOS (Profitable)
            </p>
          </div>
        </div>

        {/* Card 3: Active Client Accounts (Employees working today in screenshot) */}
        <div 
          onClick={() => setActivePage('accounts')}
          className="card-popup glass-card p-6 rounded-3xl border border-white/95 space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center text-slate-800 shadow-sm group-hover:bg-violet-50 group-hover:text-violet-600 group-hover:border-violet-200 transition-colors">
              <Users className="w-5 h-5 stroke-[1.8]" />
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              4 Stores
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Thomas, Haas, Benoit, Ruben
            </p>
          </div>
        </div>

        {/* Card 4: PPC Ad Spend (This week's card spending in screenshot) */}
        <div 
          onClick={() => setActivePage('ppc-management')}
          className="card-popup glass-card p-6 rounded-3xl border border-white/95 space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center text-slate-800 shadow-sm group-hover:bg-violet-50 group-hover:text-violet-600 group-hover:border-violet-200 transition-colors">
              <CreditCard className="w-5 h-5 stroke-[1.8]" />
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {currency}{totalAdSpend.toLocaleString()}
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1">
              PPC Ad Spend ({tacos}% TACOS)
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: 2 Columns matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Average Sales Chart + Recent emails/activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Sales Chart Container */}
          <div className="card-popup glass-card p-6 md:p-7 rounded-3xl border border-white/95 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Average Sales</h3>
                <p className="text-xs text-slate-500 mt-0.5">Sales overview from all client channels</p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setDateFilter('30d')}
                  className="card-popup px-3.5 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/60 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Current Month</span>
                </button>
                <button 
                  onClick={() => setActivePage('sales-analytics')}
                  className="card-popup w-8 h-8 rounded-full bg-slate-100/90 hover:bg-violet-50 hover:text-violet-600 border border-slate-200/60 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
                  title="View detailed sales analytics"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Offline / Online (Organic / PPC) metric comparison tags from screenshot */}
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Organic (Organic Sales)</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl md:text-2xl font-extrabold text-slate-900">
                    {currency}{(totalOrganicSales || 82379).toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold">
                    -11%
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block" />

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">PPC Ad Sales (Online)</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl md:text-2xl font-extrabold text-slate-900">
                    {currency}{(totalAdSales || 100799).toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold">
                    +6%
                  </span>
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart matching reference aesthetic */}
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={monthlyChartData} 
                  margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                  onMouseMove={(state) => {
                    if (state && state.activeTooltipIndex !== undefined && state.activeTooltipIndex !== null) {
                      setActiveBarIndex(Number(state.activeTooltipIndex));
                    }
                  }}
                  onMouseLeave={() => setActiveBarIndex(4)}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.6)" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    tickFormatter={(val) => `€${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(124, 92, 252, 0.05)', radius: 12 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white/95 backdrop-blur-xl border border-violet-200 shadow-xl rounded-2xl p-3 text-xs space-y-1">
                            <p className="font-bold text-slate-900">{data.month} 2026</p>
                            <div className="flex items-center gap-2 text-violet-600 font-bold">
                              <span className="w-2 h-2 rounded-full bg-violet-600" />
                              <span>Total: €{data.total.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 font-medium">
                              <span className="w-2 h-2 rounded-full bg-indigo-300" />
                              <span>Ad Spend: €{data.adSpend.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="total" 
                    radius={[12, 12, 8, 8]}
                    maxBarSize={48}
                  >
                    {monthlyChartData.map((entry, index) => {
                      const isActive = activeBarIndex === index;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isActive ? '#7C5CFC' : '#e8e4f8'}
                          className="transition-colors duration-200"
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Operations Log (Matching "Recent emails" table in screenshot) */}
          <div className="card-popup glass-card p-6 md:p-7 rounded-3xl border border-white/95 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Operations Log</h3>
                <p className="text-xs text-slate-500">Live operational adjustments across client stores</p>
              </div>
              <button 
                onClick={() => setActivePage('activity-log')}
                className="card-popup text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {filteredActivities.slice(0, 4).map((act) => (
                <div 
                  key={act.id} 
                  className="card-popup py-3 px-2 flex items-center justify-between gap-4 rounded-2xl transition-all cursor-pointer hover:bg-violet-50/50"
                  onClick={() => setActivePage('activity-log')}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                      {act.vaName.split(' ').map(n=>n[0]).join('') || 'HM'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs truncate">{act.vaName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium shrink-0">
                          {act.accountName.split('·')[0] || act.accountName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5" title={act.actionTaken}>
                        {act.actionTaken}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      act.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {act.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                      {act.activityDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): 2 Widgets matching screenshot */}
        <div className="space-y-6">
          {/* Widget 1: Formation status (Operations Runway & ACOS Progress in screenshot) */}
          <div className="card-popup glass-card p-6 md:p-7 rounded-3xl border border-white/95 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Portfolio Health</h3>
                <p className="text-xs text-slate-500 mt-0.5">Scaling & target pacing</p>
              </div>
              <button 
                onClick={() => setActivePage('ppc-management')}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-violet-50 hover:text-violet-600 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600 block">PPC Target Compliance</span>
              {/* Rounded Violet Gradient Progress Bar from screenshot */}
              <div className="w-full h-7 bg-slate-100 rounded-full p-1 border border-slate-200/60 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 via-violet-600 to-indigo-600 shadow-sm transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(15, (targetAcos / (acos || 1)) * 50))}%` }}
                />
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-800 block">Estimated Review Cycle</span>
              <p className="text-xs text-slate-500 mt-0.5">3-5 Days (Next PPC audit scheduled)</p>
            </div>

            <button
              onClick={() => setActivePage('ppc-management')}
              className="card-popup w-full py-3 rounded-2xl bg-white hover:bg-violet-50/70 border border-slate-200 text-xs font-bold text-slate-900 hover:text-violet-700 shadow-sm transition-all cursor-pointer text-center"
            >
              View Campaign Status
            </button>
          </div>

          {/* Widget 2: Success Rate (Semi-circle speedometer gauge matching screenshot) */}
          <div className="card-popup glass-card p-6 md:p-7 rounded-3xl border border-white/95 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Success Rate</h3>
                <p className="text-xs text-slate-500 mt-0.5">Portfolio ROAS & efficiency</p>
              </div>
              <button 
                onClick={() => setActivePage('goals-targets')}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-violet-50 hover:text-violet-600 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Custom SVG Semi-Circle Radial Speedometer Gauge */}
            <div className="flex flex-col items-center justify-center pt-2 relative">
              <div className="relative w-48 h-24 flex items-end justify-center">
                <svg className="w-48 h-24 overflow-visible" viewBox="0 0 160 80">
                  <path
                    d="M 10 80 A 70 70 0 0 1 150 80"
                    fill="none"
                    stroke="#ede9fe"
                    strokeWidth="12"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 80 A 70 70 0 0 1 150 80"
                    fill="none"
                    stroke="url(#violetGauge)"
                    strokeWidth="12"
                    strokeDasharray="180"
                    strokeDashoffset="75"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="violetGauge" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#7c5cfc" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute bottom-0 flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold mb-1">
                    • 51.2%
                  </div>
                  <span className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
                    {roas}x
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 font-mono">
                    +5% vs target
                  </span>
                </div>
              </div>

              <p className="text-xs text-center text-slate-500 max-w-[240px] mt-4 leading-relaxed">
                Hooray! Your client portfolio exceeded profit targets by €1,470 this week. Keep it up!
              </p>
            </div>

            {/* Split stats at bottom of gauge */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-center">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Total Orders</span>
                <span className="text-base font-extrabold text-slate-900 font-sans">
                  {totalOrders.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Active ASINs</span>
                <span className="text-base font-extrabold text-slate-900 font-sans">
                  {filteredCatalogAsins.length || 42}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Accounts Rollup Matrix: Line-by-Line 4 Client Accounts */}
      <div className="card-popup glass-card p-6 md:p-8 rounded-3xl border border-white/95 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                All Accounts Rollup Matrix
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">
                4 Live Stores
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative line-by-line breakdown across your active German and Pan-European stores
            </p>
          </div>

          <button
            onClick={() => setActivePage('accounts')}
            className="card-popup px-4 py-2 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Manage All Stores</span>
            <ChevronRight className="w-3.5 h-3.5 text-violet-600" />
          </button>
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-3">Client & Storefront</th>
                <th className="pb-3">Marketplaces</th>
                <th className="pb-3 text-right">Target Sales</th>
                <th className="pb-3 text-right">Target ACOS</th>
                <th className="pb-3 text-right">PPC Budget</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right pr-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((acc) => {
                const isSelected = activeAccountId === acc.id;

                return (
                  <tr 
                    key={acc.id}
                    onClick={() => setActiveAccountId(acc.id)}
                    className={`card-popup transition-all cursor-pointer hover:bg-violet-50/60 ${
                      isSelected ? 'bg-violet-50/80 font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 pl-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                          {acc.countryCode}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">
                            {acc.clientName ? `${acc.clientName} · ${acc.brandName}` : acc.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {acc.name} · {acc.assignedVa}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {acc.marketplacesList?.map((m) => (
                          <span key={m} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60">
                            {m}
                          </span>
                        )) || (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {acc.countryCode}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 text-right font-sans font-bold text-slate-800">
                      {acc.currency}{acc.monthlySalesTarget.toLocaleString()}
                    </td>

                    <td className="py-3.5 text-right font-mono font-bold text-violet-700">
                      ≤ {acc.acosTarget}%
                    </td>

                    <td className="py-3.5 text-right font-sans text-slate-600">
                      {acc.currency}{acc.ppcBudget.toLocaleString()}
                    </td>

                    <td className="py-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {acc.status}
                      </span>
                    </td>

                    <td className="py-3.5 text-right pr-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAccountId(acc.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-violet-600 hover:text-white border border-slate-200 text-[11px] font-bold text-slate-700 transition-all cursor-pointer shadow-sm"
                      >
                        {isSelected ? 'Active' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
