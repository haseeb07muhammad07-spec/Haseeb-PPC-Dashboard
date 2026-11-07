import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  Layers, 
  Plus, 
  ShieldCheck, 
  Ban, 
  DollarSign, 
  TrendingUp, 
  HelpCircle,
  Copy,
  Check,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MinedSearchTerm } from '../../types';
import { Modal } from '../common/Modal';

export const SearchTermHarvester: React.FC = () => {
  const { 
    filteredSearchTerms, 
    filteredCampaigns, 
    currentAccount, 
    harvestSearchTerm, 
    negateSearchTerm 
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'opportunities' | 'bleeders' | 'cannibalized'>('opportunities');
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string>('all');

  // Harvesting Modal state
  const [harvestingTerm, setHarvestingTerm] = useState<MinedSearchTerm | null>(null);
  const [targetExactCampaign, setTargetExactCampaign] = useState<string>('');
  const [recommendedBid, setRecommendedBid] = useState<number>(0.65);
  const [addNegativeExact, setAddNegativeExact] = useState<boolean>(true);
  const [harvestSuccessNotice, setHarvestSuccessNotice] = useState<string | null>(null);

  const currency = currentAccount?.currency || '€';
  const targetAcos = currentAccount?.acosTarget || 22;

  // Filter available manual exact campaigns for harvesting destination
  const exactCampaigns = filteredCampaigns.filter(c => c.type === 'SP Manual Exact');

  // Filter terms by tab and query
  const displayedTerms = filteredSearchTerms.filter(term => {
    const matchesSearch = !searchFilter || 
      term.searchQuery.toLowerCase().includes(searchFilter.toLowerCase()) ||
      term.sourceCampaignName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      term.targetAsin.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesCampaign = selectedCampaignFilter === 'all' || term.sourceCampaignId === selectedCampaignFilter;

    let matchesTab = true;
    if (activeTab === 'opportunities') {
      matchesTab = term.classification === 'OPPORTUNITY' && !term.alreadyInExact && !term.harvested;
    } else if (activeTab === 'bleeders') {
      matchesTab = term.classification === 'BLEEDER' && !term.negated;
    } else if (activeTab === 'cannibalized') {
      matchesTab = term.alreadyInExact;
    }

    return matchesSearch && matchesCampaign && matchesTab;
  });

  // KPI Calculations
  const opportunityCount = filteredSearchTerms.filter(t => t.classification === 'OPPORTUNITY' && !t.alreadyInExact && !t.harvested).length;
  const bleederCount = filteredSearchTerms.filter(t => t.classification === 'BLEEDER' && !t.negated).length;
  const cannibalizedCount = filteredSearchTerms.filter(t => t.alreadyInExact).length;
  const totalWastedSpend = filteredSearchTerms
    .filter(t => t.classification === 'BLEEDER')
    .reduce((sum, t) => sum + t.spend, 0);

  const handleOpenHarvestModal = (term: MinedSearchTerm) => {
    setHarvestingTerm(term);
    const defaultExact = exactCampaigns[0]?.name || 'SP - Manual - Exact - Top Converting Keywords';
    setTargetExactCampaign(defaultExact);

    // Calculate smart recommended bid based on target ACOS
    // Target Bid = (Sales / Clicks) * Target ACOS
    const estRpc = term.clicks > 0 ? (term.sales / term.clicks) : 2.5;
    const smartBid = +((estRpc * (targetAcos / 100)) * 0.95).toFixed(2);
    setRecommendedBid(Math.max(0.35, Math.min(smartBid, term.cpc * 0.9)));
    setAddNegativeExact(true);
  };

  const handleConfirmHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!harvestingTerm) return;

    harvestSearchTerm(
      harvestingTerm.id,
      targetExactCampaign,
      recommendedBid,
      addNegativeExact
    );

    setHarvestSuccessNotice(`Harvested "${harvestingTerm.searchQuery}" into ${targetExactCampaign} with isolation!`);
    setHarvestingTerm(null);
    setTimeout(() => setHarvestSuccessNotice(null), 3500);
  };

  const handleQuickNegate = (term: MinedSearchTerm) => {
    negateSearchTerm(term.id);
    setHarvestSuccessNotice(`Added "${term.searchQuery}" as Negative Exact in ${term.sourceCampaignName}!`);
    setTimeout(() => setHarvestSuccessNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Opportunity Card */}
        <div className="p-5 rounded-3xl glass-card border border-emerald-200/80 bg-emerald-50/40 relative overflow-hidden card-popup">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Harvest Opportunities
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-950">{opportunityCount}</span>
            <span className="text-xs text-emerald-700 font-semibold">Keywords to Exact</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">
            Converting queries from Auto/Broad ready for CPC reduction.
          </p>
        </div>

        {/* Bleeders / Wasted Spend Card */}
        <div className="p-5 rounded-3xl glass-card border border-rose-200/80 bg-rose-50/40 relative overflow-hidden card-popup">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
              Zero-Order Bleeders
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-950">{bleederCount}</span>
            <span className="text-xs text-rose-700 font-semibold">Wasted Queries</span>
          </div>
          <p className="text-[11px] text-rose-600 mt-1">
            High clicks with 0 orders. Add to Negative Exact immediately.
          </p>
        </div>

        {/* Preventable Waste Card */}
        <div className="p-5 rounded-3xl glass-card border border-amber-200/80 bg-amber-50/40 relative overflow-hidden card-popup">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Monthly Waste Prevented
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-950">
              {currency}{totalWastedSpend.toFixed(0)}/mo
            </span>
            <span className="text-xs text-amber-700 font-semibold">Save Budget</span>
          </div>
          <p className="text-[11px] text-amber-600 mt-1">
            Budget recovered to reinvest into high-ROAS Hero ASINs.
          </p>
        </div>

        {/* Cannibalization Guard Card */}
        <div className="p-5 rounded-3xl glass-card border border-violet-200/80 bg-violet-50/40 relative overflow-hidden card-popup">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-violet-800 uppercase tracking-wider">
              Duplicate Exact Guard
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-violet-950">{cannibalizedCount}</span>
            <span className="text-xs text-violet-700 font-semibold">Already in Exact</span>
          </div>
          <p className="text-[11px] text-violet-600 mt-1">
            Prevents bidding against yourself across campaigns.
          </p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {harvestSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 card-popup">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{harvestSuccessNotice}</span>
        </div>
      )}

      {/* Controls & Segmented Tab Navigation */}
      <div className="p-5 rounded-3xl glass-card border border-slate-200/80 bg-white/90 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'opportunities'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Harvest Opportunities</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
                {opportunityCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('bleeders')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bleeders'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Zero-Order Bleeders</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
                {bleederCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('cannibalized')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'cannibalized'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Already in Exact</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
                {cannibalizedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Search Terms ({filteredSearchTerms.length})
            </button>
          </div>

          {/* Search Input & Source Campaign Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search query, ASIN, or campaign..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <select
              value={selectedCampaignFilter}
              onChange={(e) => setSelectedCampaignFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All Source Campaigns</option>
              {filteredCampaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Terms Mining Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Customer Search Query</th>
                <th className="py-3 px-4">Source Campaign & ASIN</th>
                <th className="py-3 px-3 text-right">Clicks / Impr</th>
                <th className="py-3 px-3 text-right">Spend ({currency})</th>
                <th className="py-3 px-3 text-right">Sales / Orders</th>
                <th className="py-3 px-3 text-right">ACOS / CPC</th>
                <th className="py-3 px-4">Exact Guard Status</th>
                <th className="py-3 px-4 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {displayedTerms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-bold text-slate-700">No search terms match this filter!</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      All opportunities harvested or bleeders already isolated into negatives.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedTerms.map((term) => {
                  const isOpp = term.classification === 'OPPORTUNITY';
                  const isBleeder = term.classification === 'BLEEDER';
                  const isExactDup = term.alreadyInExact;

                  return (
                    <tr 
                      key={term.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Search Query */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/70">
                            {term.searchQuery}
                          </span>
                        </div>
                      </td>

                      {/* Source Campaign & ASIN */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <p className="text-[11px] font-medium text-slate-800 truncate max-w-[200px]" title={term.sourceCampaignName}>
                          {term.sourceCampaignName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ASIN: <strong className="text-slate-600">{term.targetAsin}</strong> · ({term.sourceTargeting})
                        </p>
                      </td>

                      {/* Clicks / Impr */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        <span className="font-bold text-slate-900">{term.clicks}</span>
                        <span className="text-[10px] text-slate-400 block">{term.impressions.toLocaleString()} imp</span>
                      </td>

                      {/* Spend */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        {currency}{term.spend.toFixed(2)}
                      </td>

                      {/* Sales / Orders */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        <span className={`font-bold ${term.sales > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {currency}{term.sales.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          <strong>{term.orders}</strong> orders
                        </span>
                      </td>

                      {/* ACOS / CPC */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                          term.orders === 0 
                            ? 'bg-rose-100 text-rose-800' 
                            : term.acos <= targetAcos 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {term.orders === 0 ? '0 Sales' : `${term.acos}%`}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          CPC: {currency}{term.cpc.toFixed(2)}
                        </span>
                      </td>

                      {/* Exact Guard Status */}
                      <td className="py-3.5 px-4">
                        {isExactDup ? (
                          <div className="flex items-center gap-1.5 text-violet-700 text-[11px] font-bold bg-violet-50 px-2 py-1 rounded-xl border border-violet-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                            <span className="truncate max-w-[130px]" title={term.existingExactCampaignName}>
                              Already in Exact
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-200">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Not in Exact</span>
                          </div>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        {term.harvested ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> Harvested
                          </span>
                        ) : term.negated ? (
                          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-bold inline-flex items-center gap-1">
                            <Ban className="w-3 h-3 text-slate-400" /> Negated
                          </span>
                        ) : isBleeder ? (
                          <button
                            onClick={() => handleQuickNegate(term)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                            title="Add to Negative Exact on Auto/Broad campaign"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Add Negative Exact</span>
                          </button>
                        ) : isExactDup ? (
                          <span className="text-[11px] text-slate-400 italic">
                            Already Protected
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenHarvestModal(term)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Harvest to Exact</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Harvest to Manual Exact Modal */}
      {harvestingTerm && (
        <Modal
          isOpen={!!harvestingTerm}
          onClose={() => setHarvestingTerm(null)}
          title={`Harvest Search Query: "${harvestingTerm.searchQuery}"`}
        >
          <form onSubmit={handleConfirmHarvest} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Search Term Performance in Auto/Discovery:</span>
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                <div>Orders: <strong>{harvestingTerm.orders}</strong></div>
                <div>Sales: <strong>{currency}{harvestingTerm.sales.toFixed(2)}</strong></div>
                <div>ACOS: <strong>{harvestingTerm.acos}%</strong> (Target: {targetAcos}%)</div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Destination Manual Exact Campaign <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetExactCampaign}
                onChange={(e) => setTargetExactCampaign(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {exactCampaigns.length > 0 ? (
                  exactCampaigns.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({currency}{c.cpc} CPC)</option>
                  ))
                ) : (
                  <option value="SP - Manual - Exact - Top Converting Keywords">
                    SP - Manual - Exact - Top Converting Keywords (Auto Created)
                  </option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recommended Initial Exact Bid ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.10"
                  value={recommendedBid}
                  onChange={(e) => setRecommendedBid(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Previous Auto CPC: {currency}{harvestingTerm.cpc.toFixed(2)}. Reduced by ~15% to lower ACOS.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Match Type
                </label>
                <input
                  type="text"
                  disabled
                  value="Exact Match [Keyword]"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-600"
                />
              </div>
            </div>

            {/* Search Term Isolation Checkbox (Crucial!) */}
            <div className="p-3.5 rounded-2xl bg-violet-50/60 border border-violet-200/80 space-y-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addNegativeExact}
                  onChange={(e) => setAddNegativeExact(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 mt-0.5 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-violet-900 block">
                    Enable Search Term Isolation (Recommended)
                  </span>
                  <span className="text-[11px] text-violet-700 block leading-relaxed">
                    Add <code className="font-mono font-bold">[{harvestingTerm.searchQuery}]</code> as <strong>Negative Exact</strong> in the source campaign (<code>{harvestingTerm.sourceCampaignName}</code>). This prevents the auto campaign from wasting spend or competing with your new manual exact bid.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setHarvestingTerm(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Confirm Harvest & Isolate</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
