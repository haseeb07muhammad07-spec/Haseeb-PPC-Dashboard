import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Truck, 
  Calculator, 
  Plus, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryItem } from '../../types';
import { Modal } from '../common/Modal';

export const InventoryPage: React.FC = () => {
  const { 
    filteredInventory, 
    accounts, 
    updateInventory, 
    addActivity, 
    currentAccount 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Restock Shipment Modal
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [unitsToShip, setUnitsToShip] = useState<number>(500);
  const [carrier, setCarrier] = useState('Amazon Partnered LTL (Freightos)');
  const [etaDays, setEtaDays] = useState<number>(10);
  const [restockNotes, setRestockNotes] = useState('');

  const currency = currentAccount?.currency || '€';

  const displayedInventory = filteredInventory.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.asin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.restockAlert === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenRestock = (item: InventoryItem) => {
    setRestockItem(item);
    const neededDays = Math.max(0, 45 - item.daysOfSupply);
    const suggestedUnits = Math.ceil(neededDays * item.dailyVelocity);
    setUnitsToShip(suggestedUnits > 0 ? suggestedUnits : 300);
    setEtaDays(item.leadTimeDays || 12);
    setRestockNotes(`Inbound shipment to prevent stockout and maintain BSR rank.`);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem) return;

    const newInbound = restockItem.fbaInboundUnits + Number(unitsToShip);
    const totalFutureUnits = restockItem.fbaAvailableUnits + newInbound;
    const newDaysSupply = Math.round(totalFutureUnits / (restockItem.dailyVelocity || 1));

    updateInventory(restockItem.id, {
      fbaInboundUnits: newInbound,
      daysOfSupply: newDaysSupply,
      restockAlert: newDaysSupply > 30 ? 'NORMAL' : 'LOW'
    });

    const targetAccount = accounts.find(a => a.id === restockItem.accountId);
    addActivity({
      accountId: restockItem.accountId,
      accountName: targetAccount?.name || 'Account',
      activityDate: new Date().toISOString().split('T')[0],
      module: 'Inventory Restock',
      actionTaken: `Created FBA Inbound Shipment: +${unitsToShip} units for ${restockItem.asin} (${restockItem.sku})`,
      reference: `FBA Shipment · Carrier: ${carrier} · ETA: ${etaDays} days`,
      previousValue: `Available: ${restockItem.fbaAvailableUnits} | Inbound: ${restockItem.fbaInboundUnits} | Days: ${restockItem.daysOfSupply}d`,
      newValue: `Available: ${restockItem.fbaAvailableUnits} | Inbound: ${newInbound} | Days: ${newDaysSupply}d`,
      reasonForAction: restockNotes || 'Prevent stockout and protect BSR sales rank.',
      expectedOutcome: `Secure 45+ days of supply runway through delivery on ${new Date(Date.now() + etaDays * 86400000).toISOString().split('T')[0]}.`,
      reviewDate: new Date(Date.now() + (etaDays + 2) * 86400000).toISOString().split('T')[0],
      status: 'Completed',
      vaName: targetAccount?.assignedVa || 'Haseeb Malik'
    });

    setRestockItem(null);
  };

  if (!currentAccount) {
    return (
      <div className="card-popup glass-card p-8 md:p-12 rounded-3xl border border-white/95 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center mx-auto text-violet-700">
          <Package className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Amazon Account Connected</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Add or connect an Amazon account to manage inventory levels, calculate restock recommendations, and log FBA shipments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>FBA Inventory & Restock Command</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">
              {currentAccount.clientName ? `${currentAccount.clientName} · ` : ''}{currentAccount.name}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track real-time stock velocity, days of supply runway, and initiate FBA replenishments.
          </p>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
        <div className="card-popup glass-card p-5 rounded-3xl border border-white/95 space-y-1 cursor-pointer">
          <span className="text-xs text-slate-400 font-semibold">Catalog SKUs</span>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {filteredInventory.length}
          </p>
        </div>
        <div className="card-popup glass-card p-5 rounded-3xl border border-white/95 space-y-1 cursor-pointer">
          <span className="text-xs text-slate-400 font-semibold">Total Available Units</span>
          <p className="text-2xl font-extrabold text-emerald-600 tabular-nums">
            {filteredInventory.reduce((s, i) => s + i.fbaAvailableUnits, 0).toLocaleString()}
          </p>
        </div>
        <div className="card-popup glass-card p-5 rounded-3xl border border-white/95 space-y-1 cursor-pointer">
          <span className="text-xs text-slate-400 font-semibold">In Transit (Inbound)</span>
          <p className="text-2xl font-extrabold text-violet-700 tabular-nums">
            {filteredInventory.reduce((s, i) => s + i.fbaInboundUnits, 0).toLocaleString()}
          </p>
        </div>
        <div className="card-popup glass-card p-5 rounded-3xl border border-white/95 space-y-1 cursor-pointer">
          <span className="text-xs text-slate-400 font-semibold">Low Stock Alerts</span>
          <p className="text-2xl font-extrabold text-rose-600 tabular-nums">
            {filteredInventory.filter(i => i.restockAlert === 'CRITICAL' || i.restockAlert === 'LOW').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-popup glass-card p-4 rounded-3xl border border-white/95 flex flex-col md:flex-row items-center gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ASIN, SKU, or Product Name..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 shadow-sm"
          />
        </div>

        <div className="w-full md:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-slate-800 font-bold focus:outline-none focus:border-violet-500 shadow-sm cursor-pointer"
          >
            <option value="all">All Alert Levels</option>
            <option value="CRITICAL">Critical (&lt; 15 days)</option>
            <option value="LOW">Low (&lt; 30 days)</option>
            <option value="NORMAL">Normal (30+ days)</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card-popup glass-card p-6 md:p-8 rounded-3xl border border-white/95 space-y-4">
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-3">Status</th>
                <th className="pb-3">ASIN / SKU</th>
                <th className="pb-3">Product Name</th>
                <th className="pb-3 text-right">Price</th>
                <th className="pb-3 text-right">Available</th>
                <th className="pb-3 text-right">Inbound</th>
                <th className="pb-3 text-right">Reserved</th>
                <th className="pb-3 text-right">Velocity</th>
                <th className="pb-3 text-right">Days Left</th>
                <th className="pb-3 text-right pr-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {displayedInventory.map(item => (
                <tr key={item.id} className="card-popup hover:bg-violet-50/50 transition-colors">
                  <td className="py-3.5 pl-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                      item.restockAlert === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.restockAlert === 'LOW'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.restockAlert}
                    </span>
                  </td>

                  <td className="py-3.5">
                    <span className="text-violet-700 font-bold block">{item.asin}</span>
                    <span className="text-[10px] text-slate-400 block">{item.sku}</span>
                  </td>

                  <td className="py-3.5 max-w-[200px]">
                    <span className="text-slate-800 font-bold truncate block" title={item.title}>
                      {item.title}
                    </span>
                  </td>

                  <td className="py-3.5 text-right font-bold text-slate-800">
                    {currency}{item.price.toFixed(2)}
                  </td>

                  <td className="py-3.5 text-right font-extrabold text-emerald-600">
                    {item.fbaAvailableUnits.toLocaleString()}
                  </td>

                  <td className="py-3.5 text-right font-bold text-violet-700">
                    {item.fbaInboundUnits.toLocaleString()}
                  </td>

                  <td className="py-3.5 text-right font-medium text-slate-500">
                    {item.reservedUnits}
                  </td>

                  <td className="py-3.5 text-right font-bold text-slate-800">
                    {item.dailyVelocity}/d
                  </td>

                  <td className="py-3.5 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      item.daysOfSupply < 15
                        ? 'bg-rose-100 text-rose-800'
                        : item.daysOfSupply < 30
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.daysOfSupply}d
                    </span>
                  </td>

                  <td className="py-3.5 text-right pr-3">
                    <button
                      onClick={() => handleOpenRestock(item)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-violet-600 hover:text-white text-violet-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Ship FBA
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Shipment Modal */}
      {restockItem && (
        <Modal
          isOpen={!!restockItem}
          onClose={() => setRestockItem(null)}
          title="Create FBA Inbound Shipment"
          subtitle={`Restock ${restockItem.asin} · ${restockItem.sku}`}
        >
          <form onSubmit={handleConfirmRestock} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Velocity:</span>
                <span className="font-bold text-slate-800">{restockItem.dailyVelocity} units/day</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Days of Supply Left:</span>
                <span className={`font-bold ${restockItem.daysOfSupply < 20 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {restockItem.daysOfSupply} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estimated Reorder Cost:</span>
                <span className="font-bold text-violet-700">
                  {currency}{(unitsToShip * (restockItem.reorderUnitCost || 8.5)).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Units to Inbound <span className="text-violet-600">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  step="50"
                  value={unitsToShip}
                  onChange={(e) => setUnitsToShip(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-violet-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Carrier ETA (Days)
                </label>
                <input
                  type="number"
                  min="3"
                  max="45"
                  value={etaDays}
                  onChange={(e) => setEtaDays(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-violet-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Log Operational Reason
              </label>
              <textarea
                rows={2}
                value={restockNotes}
                onChange={(e) => setRestockNotes(e.target.value)}
                placeholder="Why is this replenishment being placed now?..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-violet-500 shadow-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRestockItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-md shadow-violet-500/25 cursor-pointer"
              >
                Confirm Inbound Shipment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
