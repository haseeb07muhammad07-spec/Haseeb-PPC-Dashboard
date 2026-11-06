import React, { useState } from 'react';
import { 
  Package, 
  Target, 
  TrendingUp, 
  Sparkles, 
  Plus, 
  Edit3, 
  Star, 
  Check, 
  ArrowUpRight, 
  DollarSign, 
  BarChart2, 
  ShieldCheck, 
  ChevronRight,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { CatalogAsin, AsinPriorityTier } from '../../types';
import { Modal } from '../common/Modal';

interface AsinTrackerPageProps {
  onOpenNewActivity: () => void;
}

export const AsinTrackerPage: React.FC<AsinTrackerPageProps> = ({ onOpenNewActivity }) => {
  const { 
    filteredCatalogAsins, 
    currentAccount, 
    updateAsinPriority, 
    toggleAsinFocusGoal, 
    addCatalogAsin 
  } = useApp();

  const currency = currentAccount?.currency || '€';

  // State for Add ASIN Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAsin, setNewAsin] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState(29.99);
  const [newTier, setNewTier] = useState<AsinPriorityTier>('Tier 1 (Hero ASIN)');
  const [newDailyTarget, setNewDailyTarget] = useState(25);
  const [newCategory, setNewCategory] = useState('Home & Living');
  const [newStock, setNewStock] = useState(300);

  // Selected Focus ASIN for detailed tracking view
  const [selectedAsinId, setSelectedAsinId] = useState<string>(() => {
    const focus = filteredCatalogAsins.find(a => a.isFocusGoal);
    return focus ? focus.id : filteredCatalogAsins[0]?.id || '';
  });

  const activeAsin = filteredCatalogAsins.find(a => a.id === selectedAsinId) || filteredCatalogAsins[0];

  const handleCreateAsin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount) return;

    addCatalogAsin({
      accountId: currentAccount.id,
      asin: newAsin.toUpperCase(),
      sku: newSku,
      title: newTitle,
      price: Number(newPrice),
      priorityTier: newTier,
      isFocusGoal: false,
      targetDailyUnits: Number(newDailyTarget),
      category: newCategory,
      fbaStock: Number(newStock),
      dailyVelocity: Math.round(Number(newDailyTarget) * 0.8)
    });

    setIsAddModalOpen(false);
    setNewAsin('');
    setNewSku('');
    setNewTitle('');
  };

  if (!currentAccount) {
    return (
      <div className="card-popup glass-card p-8 md:p-12 rounded-3xl border border-white/95 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center mx-auto text-violet-700">
          <Package className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Amazon Account Connected</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Add or connect an Amazon account to track Hero ASIN targets, daily units, and priority tiers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>ASIN Hierarchy & Dedicated Goal Tracker</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">
              {currentAccount.clientName ? `${currentAccount.clientName} · ` : ''}{currentAccount.name}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize catalog into Hero, Growth, and Long-Tail ASINs with daily unit targets and stockout runways.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="card-popup flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-violet-500/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Catalog ASIN</span>
        </button>
      </div>

      {/* SPECIFIC ASIN DEDICATED GOAL TRACKER */}
      {activeAsin && (
        <div className="card-popup glass-card p-6 md:p-8 rounded-3xl border border-white/95 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-600 text-white uppercase">
                  Hero ASIN Spotlight
                </span>
                <span className="font-bold text-violet-700 text-sm">{activeAsin.asin}</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">{activeAsin.sku}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{activeAsin.title}</h3>
              <p className="text-xs text-slate-500">
                Category: <span className="text-slate-700 font-medium">{activeAsin.category}</span> · Unit Price: <strong className="text-slate-900 font-bold">{currency}{activeAsin.price}</strong> · BSR Rank: <strong className="text-violet-700 font-bold">#{activeAsin.currentRank}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleAsinFocusGoal(activeAsin.id)}
                className={`card-popup px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeAsin.isFocusGoal
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-violet-600" />
                <span>{activeAsin.isFocusGoal ? 'Primary Focus (Active)' : 'Set as Primary Focus'}</span>
              </button>

              <button
                onClick={onOpenNewActivity}
                className="card-popup px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer"
              >
                Log Activity
              </button>
            </div>
          </div>

          {/* ASIN Daily Sales & Velocity Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block">Today's Units</span>
              <p className="text-xl font-extrabold text-emerald-600 tabular-nums">
                {activeAsin.dailyHistory[activeAsin.dailyHistory.length - 1]?.units || 38} units
              </p>
              <span className="text-[10px] text-slate-400">
                {currency}{(activeAsin.dailyHistory[activeAsin.dailyHistory.length - 1]?.sales || 1253.62).toFixed(2)} rev
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block">Yesterday's Units</span>
              <p className="text-xl font-extrabold text-slate-800 tabular-nums">
                {activeAsin.dailyHistory[activeAsin.dailyHistory.length - 2]?.units || 36} units
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">+5.5% DoD</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block">Day Before Yesterday</span>
              <p className="text-xl font-extrabold text-slate-800 tabular-nums">
                {activeAsin.dailyHistory[activeAsin.dailyHistory.length - 3]?.units || 29} units
              </p>
              <span className="text-[10px] text-slate-400">Nov 03</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block">Daily Target Goal</span>
              <p className="text-xl font-extrabold text-violet-700 tabular-nums">
                {activeAsin.targetDailyUnits || 40} /day
              </p>
              <span className="text-[10px] text-slate-400">
                {Math.round(((activeAsin.dailyHistory[activeAsin.dailyHistory.length - 1]?.units || 38) / (activeAsin.targetDailyUnits || 40)) * 100)}% to goal
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block">FBA Available Stock</span>
              <p className="text-xl font-extrabold text-slate-900 tabular-nums">
                {activeAsin.fbaStock} units
              </p>
              <span className="text-[10px] text-slate-400">
                {Math.round(activeAsin.fbaStock / (activeAsin.dailyVelocity || 1))} days runway
              </span>
            </div>
          </div>

          {/* ASIN Daily History Trend Chart */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Daily Sales Velocity: Organic vs Sponsored PPC Units</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Organic Units
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-600" /> PPC Ad Units
                </span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeAsin.dailyHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.7)" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#e2e8f0', borderRadius: '16px', fontSize: '12px' }}
                  />
                  <Bar dataKey="organicUnits" name="Organic Units" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="ppcOrders" name="PPC Ad Orders" fill="#7c5cfc" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ASIN CATALOG HIERARCHY */}
      <div className="card-popup glass-card p-6 md:p-8 rounded-3xl border border-white/95 space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Catalog Priority Tiers</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize advertising focus, inventory safety margins, and scaling objectives.
          </p>
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-3">Target</th>
                <th className="pb-3">ASIN / SKU</th>
                <th className="pb-3">Title</th>
                <th className="pb-3">Priority Tier</th>
                <th className="pb-3 text-right">Price</th>
                <th className="pb-3 text-right">Daily Velocity</th>
                <th className="pb-3 text-right">Target Daily</th>
                <th className="pb-3 text-right">FBA Stock</th>
                <th className="pb-3 text-right pr-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredCatalogAsins.map(a => {
                const isSelected = activeAsin?.id === a.id;

                return (
                  <tr 
                    key={a.id} 
                    className={`card-popup transition-all cursor-pointer hover:bg-violet-50/60 ${
                      isSelected ? 'bg-violet-50/80 font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 pl-3">
                      <button
                        onClick={() => setSelectedAsinId(a.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-violet-600 border-violet-600 text-white font-bold shadow-sm'
                            : 'border-slate-300 hover:border-violet-600 text-transparent'
                        }`}
                        title="View detailed ASIN tracker"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </td>

                    <td className="py-3.5">
                      <span className="text-violet-700 font-bold block">{a.asin}</span>
                      <span className="text-[10px] text-slate-400 block">{a.sku}</span>
                    </td>

                    <td className="py-3.5 max-w-[240px]">
                      <p className="text-slate-800 font-bold truncate" title={a.title}>
                        {a.title}
                      </p>
                      <span className="text-[10px] text-slate-400">{a.category}</span>
                    </td>

                    <td className="py-3.5">
                      <select
                        value={a.priorityTier}
                        onChange={(e) => updateAsinPriority(a.id, e.target.value as AsinPriorityTier)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border bg-white cursor-pointer focus:outline-none shadow-sm ${
                          a.priorityTier.includes('Tier 1')
                            ? 'text-violet-700 border-violet-200'
                            : a.priorityTier.includes('Tier 2')
                            ? 'text-indigo-700 border-indigo-200'
                            : 'text-slate-600 border-slate-200'
                        }`}
                      >
                        <option value="Tier 1 (Hero ASIN)">Tier 1 (Hero ASIN)</option>
                        <option value="Tier 2 (Growth ASIN)">Tier 2 (Growth ASIN)</option>
                        <option value="Tier 3 (Long-Tail / Test)">Tier 3 (Long-Tail / Test)</option>
                      </select>
                    </td>

                    <td className="py-3.5 text-right font-bold text-slate-800">
                      {currency}{a.price.toFixed(2)}
                    </td>

                    <td className="py-3.5 text-right text-emerald-600 font-bold">
                      {a.dailyVelocity} /d
                    </td>

                    <td className="py-3.5 text-right font-bold text-violet-700">
                      {a.targetDailyUnits || 30} /d
                    </td>

                    <td className="py-3.5 text-right text-slate-800 font-bold">
                      {a.fbaStock}
                    </td>

                    <td className="py-3.5 text-right pr-3 font-sans">
                      <button
                        onClick={() => setSelectedAsinId(a.id)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-violet-600 hover:text-white text-violet-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
                      >
                        Track ASIN
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Catalog ASIN Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Catalog ASIN"
          subtitle={`Register product under ${currentAccount?.name || 'Active Account'}`}
        >
          <form onSubmit={handleCreateAsin} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Amazon ASIN <span className="text-violet-600">*</span>
                </label>
                <input
                  type="text"
                  value={newAsin}
                  onChange={(e) => setNewAsin(e.target.value)}
                  placeholder="e.g. B09X8K92LM"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono uppercase focus:outline-none focus:border-violet-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Seller SKU <span className="text-violet-600">*</span>
                </label>
                <input
                  type="text"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  placeholder="e.g. TMY-CONT-12"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-violet-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Product Title <span className="text-violet-600">*</span>
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Full Amazon listing title..."
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-violet-500 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Selling Price ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-violet-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Priority Tier
                </label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as AsinPriorityTier)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-violet-500 shadow-sm"
                >
                  <option value="Tier 1 (Hero ASIN)">Tier 1 (Hero ASIN)</option>
                  <option value="Tier 2 (Growth ASIN)">Tier 2 (Growth ASIN)</option>
                  <option value="Tier 3 (Long-Tail / Test)">Tier 3 (Long-Tail / Test)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Daily Target (Units)
                </label>
                <input
                  type="number"
                  value={newDailyTarget}
                  onChange={(e) => setNewDailyTarget(Number(e.target.value))}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-violet-500 shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-md shadow-violet-500/25 cursor-pointer"
              >
                Save ASIN & Set Hierarchy
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
