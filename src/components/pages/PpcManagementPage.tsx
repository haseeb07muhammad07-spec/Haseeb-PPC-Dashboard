import React, { useState } from 'react';
import { 
  Target, 
  Search, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ShieldAlert,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PpcCampaign, CampaignTargeting } from '../../types';
import { Modal } from '../common/Modal';

export const PpcManagementPage: React.FC = () => {
  const { 
    filteredCampaigns, 
    accounts, 
    activeAccountId, 
    currentAccount, 
    updateCampaign, 
    addActivity 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [targetingFilter, setTargetingFilter] = useState<'all' | 'AUTO' | 'MANUAL'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [adjustingCampaign, setAdjustingCampaign] = useState<PpcCampaign | null>(null);
  const [newBudget, setNewBudget] = useState<number>(0);
  const [bidAdjustmentPct, setBidAdjustmentPct] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [isBleederScannerOpen, setIsBleederScannerOpen] = useState(false);

  const currency = currentAccount?.currency || '$';

  // Filter pipeline
  const displayedCampaigns = filteredCampaigns.filter(c => {
    const matchesSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.targetAsins.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTargeting = targetingFilter === 'all' || c.targetingKind === targetingFilter;
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesTargeting && matchesType && matchesStatus;
  });

  // Calculate Auto vs Manual distributions
  const autoCampaigns = filteredCampaigns.filter(c => c.targetingKind === 'AUTO');
  const manualCampaigns = filteredCampaigns.filter(c => c.targetingKind === 'MANUAL');

  const autoSpend = autoCampaigns.reduce((s, c) => s + c.spend, 0);
  const autoSales = autoCampaigns.reduce((s, c) => s + c.sales, 0);
  const manualSpend = manualCampaigns.reduce((s, c) => s + c.spend, 0);
  const manualSales = manualCampaigns.reduce((s, c) => s + c.sales, 0);

  const totalSpend = displayedCampaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalSales = displayedCampaigns.reduce((sum, c) => sum + c.sales, 0);
  const overallAcos = totalSales > 0 ? +((totalSpend / totalSales) * 100).toFixed(1) : 0;
  const overallRoas = totalSpend > 0 ? +(totalSales / totalSpend).toFixed(2) : 0;

  const handleOpenAdjust = (c: PpcCampaign) => {
    setAdjustingCampaign(c);
    setNewBudget(c.dailyBudget);
    setBidAdjustmentPct(0);
    setAdjustmentReason(`Optimizing bids: current ACOS is ${c.acos}% vs target ${c.targetAcos}%`);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingCampaign) return;

    const prevBudget = adjustingCampaign.dailyBudget;
    const prevCpc = adjustingCampaign.cpc;
    const newEstCpc = +(prevCpc * (1 + bidAdjustmentPct / 100)).toFixed(2);

    updateCampaign(adjustingCampaign.id, {
      dailyBudget: Number(newBudget),
      cpc: newEstCpc,
      bidsAdjustedAt: new Date().toISOString().split('T')[0]
    });

    const targetAccount = accounts.find(a => a.id === adjustingCampaign.accountId);
    addActivity({
      accountId: adjustingCampaign.accountId,
      accountName: targetAccount?.name || 'Account',
      activityDate: new Date().toISOString().split('T')[0],
      module: 'PPC Optimization',
      actionTaken: `Updated campaign daily budget to ${currency}${newBudget} & adjusted bids by ${bidAdjustmentPct > 0 ? '+' : ''}${bidAdjustmentPct}%`,
      reference: `Campaign: ${adjustingCampaign.name} (ASINs: ${adjustingCampaign.targetAsins.join(', ')})`,
      previousValue: `Budget: ${currency}${prevBudget} | CPC: ${currency}${prevCpc}`,
      newValue: `Budget: ${currency}${newBudget} | Est. CPC: ${currency}${newEstCpc}`,
      reasonForAction: adjustmentReason,
      expectedOutcome: `Align campaign ACOS to target ${adjustingCampaign.targetAcos}% within 7 days.`,
      reviewDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'Pending Review',
      vaName: targetAccount?.assignedVa || 'Alex Rivera'
    });

    setAdjustingCampaign(null);
  };

  const handleToggleStatus = (c: PpcCampaign) => {
    const nextStatus = c.status === 'ENABLED' ? 'PAUSED' : 'ENABLED';
    updateCampaign(c.id, { status: nextStatus });

    const targetAccount = accounts.find(a => a.id === c.accountId);
    addActivity({
      accountId: c.accountId,
      accountName: targetAccount?.name || 'Account',
      activityDate: new Date().toISOString().split('T')[0],
      module: 'PPC Optimization',
      actionTaken: `${nextStatus === 'PAUSED' ? 'Paused' : 'Enabled'} campaign`,
      reference: `Campaign: ${c.name}`,
      previousValue: `Status: ${c.status}`,
      newValue: `Status: ${nextStatus}`,
      reasonForAction: nextStatus === 'PAUSED' ? 'Prevent bleeding ad budget' : 'Resumed active advertising',
      expectedOutcome: nextStatus === 'PAUSED' ? 'Protect net margin' : 'Drive sales volume',
      reviewDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'Completed',
      vaName: targetAccount?.assignedVa || 'Alex Rivera'
    });
  };

  const bleederQueries = [
    { query: 'cheap silicone plastic food containers bulk', clicks: 38, spend: 54.20, orders: 0, campaign: 'SP - Auto - Catch-All Discovery' },
    { query: 'free camping dry bag giveaway', clicks: 29, spend: 41.50, orders: 0, campaign: 'SP - Auto - Catch All Discovery Outdoor' },
    { query: 'discount over the sink rack under 15 dollars', clicks: 24, spend: 32.80, orders: 0, campaign: 'SBV - Video - Dish Rack Counter Showcase' }
  ];

  const handleApplyNegativeExact = (b: typeof bleederQueries[0]) => {
    const targetAccount = accounts[0];
    if (!targetAccount) return;
    addActivity({
      accountId: targetAccount.id,
      accountName: targetAccount.name,
      activityDate: new Date().toISOString().split('T')[0],
      module: 'Negative Keywords',
      actionTaken: `Negated search query [Exact Match]: "${b.query}"`,
      reference: `${b.campaign} · Query: "${b.query}"`,
      previousValue: `Spend: $${b.spend} | 0 conversions`,
      newValue: 'Added as Negative Exact',
      reasonForAction: `Zero orders after ${b.clicks} clicks ($${b.spend} wasted spend).`,
      expectedOutcome: `Save ~$${b.spend}/month of wasted PPC ad spend.`,
      reviewDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'Completed',
      vaName: targetAccount.assignedVa
    });
    alert(`Negated "${b.query}" as Negative Exact in ${b.campaign}. Logged to Daily Activity Log!`);
  };

  if (accounts.length === 0) {
    return (
      <div className="p-8 md:p-12 rounded-2xl glass-card text-center space-y-4 card-popup">
        <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto text-violet-600">
          <Target className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No PPC Campaigns Available</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Add or connect an Amazon account to manage Sponsored Products (Auto/Manual), Sponsored Brands, and bid optimizations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Bleeder Scanner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>PPC Advertising Command Center</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-violet-50 text-violet-700 border border-violet-200 font-semibold">
              PPC Console
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto vs Manual campaign allocation, ASIN mapping, bid optimization, and bleeder keyword negation.
          </p>
        </div>

        <button
          onClick={() => setIsBleederScannerOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto card-popup"
        >
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Bleeder Query Scanner ({bleederQueries.length})</span>
        </button>
      </div>

      {/* AUTO vs MANUAL Campaign Segmentation Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total PPC Operations */}
        <div className="card-popup glass-card p-6 rounded-3xl border border-white/95 space-y-3 cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">All Campaigns ({filteredCampaigns.length})</span>
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between font-sans">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Ad Spend</span>
              <span className="text-xl font-extrabold text-slate-900">{currency}{totalSpend.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-medium block">Ad Revenue</span>
              <span className="text-xl font-extrabold text-violet-700">{currency}{totalSales.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs pt-2 border-t border-slate-100 text-slate-500 font-medium">
            <span>ACOS: <strong className="text-violet-700 font-bold">{overallAcos}%</strong></span>
            <span>ROAS: <strong className="text-emerald-600 font-bold">{overallRoas}x</strong></span>
          </div>
        </div>

        {/* Auto Targeting Campaigns */}
        <div 
          onClick={() => setTargetingFilter(targetingFilter === 'AUTO' ? 'all' : 'AUTO')}
          className={`card-popup glass-card p-6 rounded-3xl border transition-all cursor-pointer space-y-3 ${
            targetingFilter === 'AUTO'
              ? 'border-violet-300 ring-2 ring-violet-500/20 shadow-lg'
              : 'border-white/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              <span className="text-xs font-bold text-slate-800">Sponsored Products: AUTO</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
              {autoCampaigns.length} Active
            </span>
          </div>
          <div className="flex items-baseline justify-between font-sans">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Auto Spend</span>
              <span className="text-xl font-extrabold text-slate-900">{currency}{autoSpend.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-medium block">Auto Sales</span>
              <span className="text-xl font-extrabold text-emerald-600">{currency}{autoSales.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
            <span>Search Term Discovery</span>
            <span className="text-violet-600 font-bold">{targetingFilter === 'AUTO' ? 'Filtered' : 'Filter Auto'}</span>
          </div>
        </div>

        {/* Manual Targeting Campaigns (Exact, Broad, Phrase, SBV) */}
        <div 
          onClick={() => setTargetingFilter(targetingFilter === 'MANUAL' ? 'all' : 'MANUAL')}
          className={`card-popup glass-card p-6 rounded-3xl border transition-all cursor-pointer space-y-3 ${
            targetingFilter === 'MANUAL'
              ? 'border-violet-300 ring-2 ring-violet-500/20 shadow-lg'
              : 'border-white/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-xs font-bold text-slate-800">Manual (Exact, Broad, SBV)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              {manualCampaigns.length} Active
            </span>
          </div>
          <div className="flex items-baseline justify-between font-sans">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Manual Spend</span>
              <span className="text-xl font-extrabold text-slate-900">{currency}{manualSpend.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-medium block">Manual Sales</span>
              <span className="text-xl font-extrabold text-emerald-600">{currency}{manualSales.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
            <span>High-Intent Scaling</span>
            <span className="text-violet-600 font-bold">{targetingFilter === 'MANUAL' ? 'Filtered' : 'Filter Manual'}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-card flex flex-col md:flex-row items-center gap-3 text-xs card-popup">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns by name or targeted ASIN..."
            className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl pl-10 pr-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all"
          />
        </div>

        <div className="w-full md:w-44">
          <select
            value={targetingFilter}
            onChange={(e) => setTargetingFilter(e.target.value as any)}
            className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-violet-500"
          >
            <option value="all">Auto & Manual (All)</option>
            <option value="AUTO">Auto Only</option>
            <option value="MANUAL">Manual Only</option>
          </select>
        </div>

        <div className="w-full md:w-44">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Campaign Types</option>
            <option value="SP Manual Exact">SP Manual Exact</option>
            <option value="SP Auto">SP Auto</option>
            <option value="SP Manual Phrase">SP Manual Phrase</option>
            <option value="SB Video">SB Video</option>
            <option value="SD Audience">SD Audience</option>
          </select>
        </div>

        <div className="w-full md:w-36">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Statuses</option>
            <option value="ENABLED">Active (Enabled)</option>
            <option value="PAUSED">Paused</option>
            <option value="BUDGET_CAPPED">Budget Capped</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table with ASIN Mapping */}
      <div className="p-5 rounded-2xl glass-card space-y-4 card-popup">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="pb-3 pl-2">Status</th>
                <th className="pb-3">Campaign Name & Type</th>
                <th className="pb-3">Targeted ASINs</th>
                <th className="pb-3 text-right">Daily Budget</th>
                <th className="pb-3 text-right">Ad Spend</th>
                <th className="pb-3 text-right">Ad Sales</th>
                <th className="pb-3 text-right">ACOS</th>
                <th className="pb-3 text-right">ROAS</th>
                <th className="pb-3 text-right">CPC</th>
                <th className="pb-3 text-right">CVR %</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {displayedCampaigns.map(c => {
                const isOverTarget = c.acos > c.targetAcos;

                return (
                  <tr key={c.id} className="hover:bg-violet-50/40 transition-colors">
                    <td className="py-3 pl-2 font-sans">
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          c.status === 'ENABLED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.status === 'BUDGET_CAPPED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {c.status === 'ENABLED' ? <Play className="w-2.5 h-2.5 fill-current" /> : <Pause className="w-2.5 h-2.5 fill-current" />}
                        <span>{c.status}</span>
                      </button>
                    </td>

                    <td className="py-3 font-sans font-medium text-slate-800 max-w-[220px]">
                      <p className="truncate font-bold text-slate-900" title={c.name}>{c.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-mono">
                        <span className={`px-1.5 py-0.5 rounded-md font-bold ${
                          c.targetingKind === 'AUTO' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-violet-50 text-violet-700 border border-violet-200'
                        }`}>
                          {c.targetingKind}
                        </span>
                        <span className="text-slate-400">{c.type}</span>
                      </div>
                    </td>

                    {/* Targeted ASINs Column */}
                    <td className="py-3 font-sans">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {c.targetAsins.map(asin => (
                          <span 
                            key={asin} 
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-violet-50 text-violet-700 border border-violet-200 font-semibold"
                            title={`Active ASIN: ${asin}`}
                          >
                            {asin}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 text-right text-slate-700 font-medium">
                      {currency}{c.dailyBudget}/d
                    </td>

                    <td className="py-3 text-right text-rose-600 font-semibold">
                      {currency}{c.spend.toLocaleString()}
                    </td>

                    <td className="py-3 text-right text-violet-700 font-bold">
                      {currency}{c.sales.toLocaleString()}
                    </td>

                    <td className="py-3 text-right">
                      <span className={`font-bold ${isOverTarget ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {c.acos}%
                      </span>
                      <span className="text-[10px] text-slate-400 block font-normal">≤{c.targetAcos}%</span>
                    </td>

                    <td className="py-3 text-right text-slate-800 font-bold">
                      {c.roas}x
                    </td>

                    <td className="py-3 text-right text-slate-600">
                      {currency}{c.cpc}
                    </td>

                    <td className="py-3 text-right text-emerald-600 font-bold">
                      {c.cvr}%
                    </td>

                    <td className="py-3 text-right pr-2 font-sans">
                      <button
                        onClick={() => handleOpenAdjust(c)}
                        className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-[11px] font-bold transition-all cursor-pointer card-popup"
                      >
                        Adjust Bids
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bid / Budget Adjustment Modal */}
      {adjustingCampaign && (
        <Modal
          isOpen={!!adjustingCampaign}
          onClose={() => setAdjustingCampaign(null)}
          title="Optimize PPC Campaign Bids & Budget"
          subtitle={adjustingCampaign.name}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-violet-50/60 border border-violet-100 font-mono text-center">
              <div>
                <span className="text-[10px] text-slate-500 block font-sans font-medium">Current ACOS</span>
                <span className={`font-bold text-sm ${adjustingCampaign.acos > adjustingCampaign.targetAcos ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {adjustingCampaign.acos}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-sans font-medium">Target ACOS</span>
                <span className="text-violet-700 font-bold text-sm">{adjustingCampaign.targetAcos}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-sans font-medium">Current CPC</span>
                <span className="text-slate-800 font-bold text-sm">{currency}{adjustingCampaign.cpc}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Daily Budget ({currency})
              </label>
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(Number(e.target.value))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-mono focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-semibold">
                  Keyword Bid Percentage Shift: <span className="font-mono text-violet-700 font-bold">{bidAdjustmentPct > 0 ? `+${bidAdjustmentPct}` : bidAdjustmentPct}%</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  Est. CPC: {currency}{(adjustingCampaign.cpc * (1 + bidAdjustmentPct / 100)).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                value={bidAdjustmentPct}
                onChange={(e) => setBidAdjustmentPct(Number(e.target.value))}
                className="w-full accent-violet-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>-50% (Cut Bleed)</span>
                <span>0% (Maintain)</span>
                <span>+50% (Scale Aggressive)</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Reason for Optimization (Logs to Activity Trail)
              </label>
              <textarea
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                rows={2}
                required
                placeholder="e.g. Lowering bid to reduce bleed on non-converting targets..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setAdjustingCampaign(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6C4CEE] text-white font-semibold cursor-pointer shadow-md shadow-violet-500/20 card-popup"
              >
                Apply & Record to Activity Log
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bleeder Query Scanner Modal */}
      {isBleederScannerOpen && (
        <Modal
          isOpen={isBleederScannerOpen}
          onClose={() => setIsBleederScannerOpen(false)}
          title="Amazon PPC Bleeder Scanner"
          subtitle="Customer search queries with > 15 clicks, > $30 spend and zero conversions."
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-2.5">
              {bleederQueries.map((b, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-mono font-bold text-rose-600">"{b.query}"</p>
                    <p className="text-[11px] text-slate-500">
                      {b.campaign} · <span className="font-mono text-slate-700 font-semibold">{b.clicks} clicks</span> · <span className="font-mono text-rose-600 font-bold">${b.spend} spent</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleApplyNegativeExact(b)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold whitespace-nowrap cursor-pointer transition-all"
                  >
                    Negate Exact
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsBleederScannerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
