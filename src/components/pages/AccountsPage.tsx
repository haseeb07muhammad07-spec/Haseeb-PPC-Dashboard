import React, { useState } from 'react';
import { 
  Plus, 
  Building2, 
  DollarSign, 
  Percent, 
  Target, 
  Users, 
  Edit3, 
  Trash2, 
  Check, 
  Globe, 
  TrendingUp,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { AmazonAccount, Marketplace } from '../../types';
import { Modal } from '../common/Modal';

const MARKETPLACES: { name: Marketplace; country: string; code: string; currency: string }[] = [
  { name: 'Amazon.de', country: 'Germany', code: 'DE', currency: '€' },
  { name: 'Amazon.fr', country: 'France', code: 'FR', currency: '€' },
  { name: 'Amazon.it', country: 'Italy', code: 'IT', currency: '€' },
  { name: 'Amazon.es', country: 'Spain', code: 'ES', currency: '€' },
  { name: 'Amazon.nl', country: 'Netherlands', code: 'NL', currency: '€' },
  { name: 'Multi-Marketplace (EU)', country: 'Pan-European Union', code: 'EU', currency: '€' },
  { name: 'Amazon.co.uk', country: 'United Kingdom', code: 'UK', currency: '£' },
  { name: 'Amazon.com', country: 'United States', code: 'US', currency: '$' },
  { name: 'Amazon.ca', country: 'Canada', code: 'CA', currency: 'C$' },
  { name: 'Amazon.co.jp', country: 'Japan', code: 'JP', currency: '¥' },
  { name: 'Amazon.com.au', country: 'Australia', code: 'AU', currency: 'A$' }
];

export const AccountsPage: React.FC = () => {
  const { 
    accounts, 
    activeAccountId, 
    setActiveAccountId, 
    addAccount, 
    updateAccount, 
    deleteAccount 
  } = useApp();

  const { hasPermission } = useAuth();
  const canAdmin = hasPermission('admin');
  const canEdit = hasPermission('edit');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AmazonAccount | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [marketplace, setMarketplace] = useState<Marketplace>('Amazon.de');
  const [monthlySalesTarget, setMonthlySalesTarget] = useState(35000);
  const [acosTarget, setAcosTarget] = useState(22);
  const [roasTarget, setRoasTarget] = useState(4.55);
  const [ppcBudget, setPpcBudget] = useState(4500);
  const [asinCount, setAsinCount] = useState(10);
  const [assignedVa, setAssignedVa] = useState('Haseeb Malik (PPC Lead)');
  const [status, setStatus] = useState<'active' | 'paused' | 'onboarding'>('active');
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setName('');
    setClientName('');
    setBrandName('');
    setMarketplace('Amazon.de');
    setMonthlySalesTarget(35000);
    setAcosTarget(22);
    setRoasTarget(4.55);
    setPpcBudget(4500);
    setAsinCount(10);
    setAssignedVa('Haseeb Malik (PPC Lead)');
    setStatus('active');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: AmazonAccount) => {
    setEditingAccount(acc);
    setName(acc.name);
    setClientName(acc.clientName || '');
    setBrandName(acc.brandName);
    setMarketplace(acc.marketplace);
    setMonthlySalesTarget(acc.monthlySalesTarget);
    setAcosTarget(acc.acosTarget);
    setRoasTarget(acc.roasTarget);
    setPpcBudget(acc.ppcBudget);
    setAsinCount(acc.asinCount);
    setAssignedVa(acc.assignedVa);
    setStatus(acc.status);
    setNotes(acc.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mpInfo = MARKETPLACES.find(m => m.name === marketplace) || MARKETPLACES[0];

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name,
        clientName: clientName.trim() || undefined,
        brandName,
        marketplace,
        country: mpInfo.country,
        countryCode: mpInfo.code,
        currency: mpInfo.currency,
        monthlySalesTarget: Number(monthlySalesTarget),
        acosTarget: Number(acosTarget),
        roasTarget: Number(roasTarget),
        ppcBudget: Number(ppcBudget),
        asinCount: Number(asinCount),
        assignedVa,
        status,
        notes
      });
    } else {
      addAccount({
        name,
        clientName: clientName.trim() || undefined,
        brandName,
        marketplace,
        country: mpInfo.country,
        countryCode: mpInfo.code,
        currency: mpInfo.currency,
        monthlySalesTarget: Number(monthlySalesTarget),
        acosTarget: Number(acosTarget),
        roasTarget: Number(roasTarget),
        ppcBudget: Number(ppcBudget),
        asinCount: Number(asinCount),
        assignedVa,
        status,
        notes
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Amazon Client Accounts</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage multiple client store credentials, performance targets, and VA assignees.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveAccountId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer card-popup ${
              activeAccountId === 'all'
                ? 'bg-[#7C5CFC] text-white shadow-md shadow-violet-500/20'
                : 'bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 shadow-xs'
            }`}
          >
            View All Accounts (Aggregated)
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6C4CEE] text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-violet-500/20 card-popup"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Client Account</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid or Empty State */}
      {accounts.length === 0 ? (
        <div className="p-8 md:p-12 rounded-2xl glass-card text-center space-y-4 card-popup">
          <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto text-violet-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Amazon Accounts Connected</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              All dummy accounts have been removed. Click below to add your first client store, or share your account info with me in chat.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-violet-500/25"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Amazon Account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((acc) => {
          const isSelected = activeAccountId === acc.id;

          return (
            <div
              key={acc.id}
              className={`card-popup glass-card p-6 md:p-7 rounded-3xl border transition-all space-y-4 cursor-pointer ${
                isSelected
                  ? 'border-violet-300 ring-2 ring-violet-500/20 shadow-lg'
                  : 'border-white/90'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                    {acc.countryCode}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base tracking-tight">{acc.name}</h3>
                      {acc.clientName && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">
                          Client: {acc.clientName}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>Brand: <strong className="text-slate-700">{acc.brandName}</strong></span>
                      <span>·</span>
                      <span className="font-sans text-slate-600">{acc.marketplace}</span>
                      {acc.marketplacesList && acc.marketplacesList.length > 0 && (
                        <div className="flex items-center gap-1 ml-1">
                          {acc.marketplacesList.map(m => (
                            <span key={m} className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(acc);
                      }}
                      className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors cursor-pointer"
                      title="Edit account configuration"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  {canAdmin && accounts.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to remove account "${acc.name}"?`)) {
                          deleteAccount(acc.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Targets and Budgets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Monthly Target</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {acc.currency}{acc.monthlySalesTarget.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Target ACOS</span>
                  <span className="font-bold text-violet-700 tabular-nums">
                    ≤ {acc.acosTarget}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Target ROAS</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    ≥ {acc.roasTarget}x
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">PPC Budget</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {acc.currency}{acc.ppcBudget.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Extra details & VA Assignment */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>VA: <span className="text-slate-700 font-semibold">{acc.assignedVa}</span></span>
                  <span>·</span>
                  <span>{acc.asinCount} ASINs</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {acc.status}
                  </span>
                </div>
              </div>

              {acc.notes && (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                  "{acc.notes}"
                </p>
              )}

              {/* Select Active Account Action */}
              <div className="pt-2">
                <button
                  onClick={() => setActiveAccountId(acc.id)}
                  className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'bg-violet-600 text-white shadow-violet-500/25'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'Currently Selected' : 'Switch to this Account'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Account Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccount ? 'Edit Amazon Account Configuration' : 'Add New Amazon Client Account'}
        subtitle="Configure marketplace details, monthly targets, and Virtual Assistant assignment."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Client Name <span className="text-violet-600">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Thomas Mild, Haas, Benoit, Ruben"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Account / Store Name <span className="text-violet-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tomishop (DE)"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Brand Name <span className="text-violet-600">*</span>
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Tomishop"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Amazon Marketplace <span className="text-violet-600">*</span>
              </label>
              <select
                value={marketplace}
                onChange={(e) => setMarketplace(e.target.value as Marketplace)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              >
                {MARKETPLACES.map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.country} - {m.currency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Assigned VA Specialist
              </label>
              <input
                type="text"
                value={assignedVa}
                onChange={(e) => setAssignedVa(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>
          </div>

          {/* Targets row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Monthly Target ($)
              </label>
              <input
                type="number"
                value={monthlySalesTarget}
                onChange={(e) => setMonthlySalesTarget(Number(e.target.value))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ACOS Target (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={acosTarget}
                onChange={(e) => setAcosTarget(Number(e.target.value))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ROAS Target (x)
              </label>
              <input
                type="number"
                step="0.01"
                value={roasTarget}
                onChange={(e) => setRoasTarget(Number(e.target.value))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                PPC Budget ($)
              </label>
              <input
                type="number"
                value={ppcBudget}
                onChange={(e) => setPpcBudget(Number(e.target.value))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Catalog ASIN Count
              </label>
              <input
                type="number"
                value={asinCount}
                onChange={(e) => setAsinCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              >
                <option value="active">Active Operations</option>
                <option value="paused">Paused</option>
                <option value="onboarding">Onboarding</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Strategy / Operations Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g., Focus on Q4 scale, strict ACOS ceiling of 24%, weekly bid harvesting..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6C4CEE] text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-violet-500/20 card-popup"
            >
              {editingAccount ? 'Update Account' : 'Save New Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
