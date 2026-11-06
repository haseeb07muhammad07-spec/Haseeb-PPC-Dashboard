import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  Download,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivityRecord, ActivityModule, ActivityStatus } from '../../types';
import { Modal } from '../common/Modal';

interface ActivityLogPageProps {
  onOpenNewActivity: () => void;
  onEditActivity: (activity: ActivityRecord) => void;
}

export const ActivityLogPage: React.FC<ActivityLogPageProps> = ({ 
  onOpenNewActivity, 
  onEditActivity 
}) => {
  const { 
    filteredActivities, 
    accounts, 
    deleteActivity, 
    updateActivity, 
    activeAccountId
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all');
  
  // Modal states for inspecting detail and editing actual outcome
  const [viewingActivity, setViewingActivity] = useState<ActivityRecord | null>(null);
  const [editingOutcomeActivity, setEditingOutcomeActivity] = useState<ActivityRecord | null>(null);
  const [newActualOutcome, setNewActualOutcome] = useState('');
  const [newOutcomeStatus, setNewOutcomeStatus] = useState<ActivityStatus>('Completed');

  // Filter pipeline
  const activitiesToDisplay = filteredActivities.filter(act => {
    // Search query matching
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      act.actionTaken.toLowerCase().includes(q) ||
      act.reference.toLowerCase().includes(q) ||
      act.reasonForAction.toLowerCase().includes(q) ||
      act.expectedOutcome.toLowerCase().includes(q) ||
      act.vaName.toLowerCase().includes(q) ||
      act.accountName.toLowerCase().includes(q);

    // Module filter
    const matchesModule = selectedModule === 'all' || act.module === selectedModule;

    // Status filter
    const matchesStatus = selectedStatus === 'all' || act.status === selectedStatus;

    // Local account filter (if activeAccountId === 'all')
    const matchesAccount = activeAccountId !== 'all' || selectedAccountFilter === 'all' || act.accountId === selectedAccountFilter;

    return matchesSearch && matchesModule && matchesStatus && matchesAccount;
  });

  const handleOpenOutcomeModal = (act: ActivityRecord) => {
    setEditingOutcomeActivity(act);
    setNewActualOutcome(act.actualOutcome || '');
    setNewOutcomeStatus(act.status);
  };

  const handleSaveOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOutcomeActivity) {
      updateActivity(editingOutcomeActivity.id, {
        actualOutcome: newActualOutcome,
        status: newOutcomeStatus
      });
      setEditingOutcomeActivity(null);
    }
  };

  const exportActivitiesCsv = () => {
    const headers = ['Date', 'Account', 'Module', 'Action Taken', 'Reference', 'Prev Value', 'New Value', 'Reason', 'Expected Outcome', 'Review Date', 'Status', 'Actual Outcome', 'VA'];
    const rows = activitiesToDisplay.map(a => [
      `"${a.activityDate}"`,
      `"${a.accountName}"`,
      `"${a.module}"`,
      `"${a.actionTaken.replace(/"/g, '""')}"`,
      `"${a.reference.replace(/"/g, '""')}"`,
      `"${a.previousValue.replace(/"/g, '""')}"`,
      `"${a.newValue.replace(/"/g, '""')}"`,
      `"${a.reasonForAction.replace(/"/g, '""')}"`,
      `"${a.expectedOutcome.replace(/"/g, '""')}"`,
      `"${a.reviewDate}"`,
      `"${a.status}"`,
      `"${(a.actualOutcome || '').replace(/"/g, '""')}"`,
      `"${a.vaName}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Amazon_VA_Activity_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allModules: ActivityModule[] = [
    'PPC Optimization',
    'Negative Keywords',
    'Bid Adjustment',
    'Listing Optimization',
    'Inventory Restock',
    'Buy Box / Pricing',
    'Case Log / Support',
    'Promotions & Coupons'
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Daily Operations & Activity Log</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of operational decisions, bid adjustments, listing updates, and measured outcomes.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportActivitiesCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:border-violet-300 text-xs font-semibold shadow-xs transition-all cursor-pointer card-popup"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenNewActivity}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6C4CEE] text-white font-semibold text-xs transition-all cursor-pointer shadow-md shadow-violet-500/20 card-popup"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Daily Activity</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-card space-y-3 card-popup">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions, ASINs, keywords, campaign names, reasons..."
              className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all"
            />
          </div>

          {/* Module Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Modules</option>
              {allModules.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-40">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Account Filter (if viewing all) */}
          {activeAccountId === 'all' && (
            <div className="w-full md:w-48">
              <select
                value={selectedAccountFilter}
                onChange={(e) => setSelectedAccountFilter(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Accounts ({accounts.length})</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Quick status count strip */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span>Showing <span className="font-mono text-slate-900 font-bold">{activitiesToDisplay.length}</span> activities</span>
            <span>·</span>
            <span className="text-amber-600 font-medium">
              {activitiesToDisplay.filter(a => a.status === 'Pending Review').length} Pending
            </span>
            <span>·</span>
            <span className="text-blue-600 font-medium">
              {activitiesToDisplay.filter(a => a.status === 'In Progress').length} In Progress
            </span>
            <span>·</span>
            <span className="text-emerald-600 font-medium">
              {activitiesToDisplay.filter(a => a.status === 'Completed').length} Completed
            </span>
          </div>

          {(searchQuery || selectedModule !== 'all' || selectedStatus !== 'all' || selectedAccountFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedModule('all');
                setSelectedStatus('all');
                setSelectedAccountFilter('all');
              }}
              className="text-violet-600 font-semibold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Activities Records Table */}
      <div className="p-5 rounded-2xl glass-card space-y-4 card-popup">
        {activitiesToDisplay.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No activity records found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No daily activities match your current search and filter settings. Try adjusting filters or create a new entry.
            </p>
            <button
              onClick={onOpenNewActivity}
              className="px-4 py-2 rounded-xl bg-[#7C5CFC] text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
            >
              Log First Activity
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Account</th>
                  <th className="pb-3">Module</th>
                  <th className="pb-3">Action Taken</th>
                  <th className="pb-3">Reference (ASIN / KW)</th>
                  <th className="pb-3">Prev → New</th>
                  <th className="pb-3">Review Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {activitiesToDisplay.map((act) => (
                  <tr key={act.id} className="hover:bg-violet-50/40 transition-colors group">
                    <td className="py-3 pl-2 font-mono text-slate-500 whitespace-nowrap">
                      {act.activityDate}
                    </td>

                    <td className="py-3 text-slate-900 font-bold whitespace-nowrap max-w-[140px] truncate" title={act.accountName}>
                      {act.accountName}
                    </td>

                    <td className="py-3">
                      <span className="text-violet-700 bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100 font-semibold text-[11px] whitespace-nowrap">
                        {act.module}
                      </span>
                    </td>

                    <td className="py-3 max-w-xs">
                      <p className="text-slate-800 font-semibold line-clamp-1 group-hover:text-violet-700 transition-colors">
                        {act.actionTaken}
                      </p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {act.reasonForAction}
                      </p>
                    </td>

                    <td className="py-3 font-mono text-slate-500 max-w-[160px] truncate" title={act.reference}>
                      {act.reference}
                    </td>

                    <td className="py-3 max-w-[140px]">
                      <div className="text-[11px] font-mono text-slate-500 line-clamp-1">
                        <span className="line-through text-slate-400">{act.previousValue || '—'}</span>
                        <ArrowRight className="inline w-3 h-3 mx-1 text-slate-400" />
                        <span className="text-slate-800 font-semibold">{act.newValue}</span>
                      </div>
                    </td>

                    <td className="py-3 font-mono text-slate-500 whitespace-nowrap">
                      {act.reviewDate}
                    </td>

                    <td className="py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        act.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : act.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {act.status}
                      </span>
                    </td>

                    <td className="py-3 text-right pr-2 whitespace-nowrap font-sans">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingActivity(act)}
                          className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
                          title="View complete record & outcome"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenOutcomeModal(act)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Update Actual Outcome"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditActivity(act)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit activity"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this activity record?')) {
                              deleteActivity(act.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      {viewingActivity && (
        <Modal
          isOpen={!!viewingActivity}
          onClose={() => setViewingActivity(null)}
          title="Activity Audit Record"
          subtitle={`${viewingActivity.module} · ${viewingActivity.accountName} · Logged ${viewingActivity.activityDate}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Status</span>
                <span className="font-bold text-violet-700">{viewingActivity.status}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Activity Date</span>
                <span className="font-mono text-slate-700">{viewingActivity.activityDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Review Date</span>
                <span className="font-mono text-slate-700">{viewingActivity.reviewDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Logged By</span>
                <span className="text-slate-800 font-medium">{viewingActivity.vaName}</span>
              </div>
            </div>

            {/* Core Action & Reference */}
            <div className="space-y-2">
              <div>
                <span className="text-slate-600 font-semibold block mb-1">Action Taken:</span>
                <p className="p-3 bg-violet-50/60 border border-violet-100 rounded-xl text-slate-800 font-bold text-sm">
                  {viewingActivity.actionTaken}
                </p>
              </div>

              <div>
                <span className="text-slate-600 font-semibold block mb-1">Campaign / ASIN / Keyword Reference:</span>
                <p className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-violet-700 font-medium">
                  {viewingActivity.reference}
                </p>
              </div>
            </div>

            {/* Value Changes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block mb-1">Previous Value / State:</span>
                <p className="text-slate-600 font-mono">{viewingActivity.previousValue || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-xl bg-violet-50/60 border border-violet-200">
                <span className="text-[10px] text-violet-700 font-semibold block mb-1">New Value / Target:</span>
                <p className="text-violet-800 font-mono font-bold">{viewingActivity.newValue || 'N/A'}</p>
              </div>
            </div>

            {/* Reason & Expected Outcome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-slate-600 font-semibold block">Reason for Action:</span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed border border-slate-200">
                  {viewingActivity.reasonForAction || 'No reason specified'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-600 font-semibold block">Expected Outcome:</span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed border border-slate-200">
                  {viewingActivity.expectedOutcome || 'No expected outcome specified'}
                </p>
              </div>
            </div>

            {/* Actual Outcome Section */}
            <div className="p-4 rounded-xl bg-violet-50/70 border border-violet-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-violet-900 font-bold">Actual Measured Outcome:</span>
                <button
                  onClick={() => {
                    handleOpenOutcomeModal(viewingActivity);
                    setViewingActivity(null);
                  }}
                  className="text-[11px] text-violet-600 font-semibold hover:underline cursor-pointer"
                >
                  Edit Outcome
                </button>
              </div>
              <p className="text-slate-800 leading-relaxed">
                {viewingActivity.actualOutcome || (
                  <span className="text-slate-400 italic">
                    Pending review date measurement. Click "Edit Outcome" to record actual performance results.
                  </span>
                )}
              </p>
            </div>

            {/* Screenshot proof if present */}
            {viewingActivity.screenshotUrl && (
              <div className="space-y-1.5">
                <span className="text-slate-600 font-semibold block">Attached Screenshot:</span>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <img 
                    src={viewingActivity.screenshotUrl} 
                    alt="Proof" 
                    className="max-h-60 mx-auto rounded-lg object-contain shadow-xs" 
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            {viewingActivity.notes && (
              <div className="space-y-1">
                <span className="text-slate-600 font-semibold block">Internal Notes:</span>
                <p className="p-2.5 bg-slate-50 rounded-xl text-slate-600 italic border border-slate-200">
                  {viewingActivity.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setViewingActivity(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Actual Outcome Modal */}
      {editingOutcomeActivity && (
        <Modal
          isOpen={!!editingOutcomeActivity}
          onClose={() => setEditingOutcomeActivity(null)}
          title="Update Actual Outcome"
          subtitle={`Post-review evaluation for: ${editingOutcomeActivity.actionTaken}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveOutcome} className="space-y-4 text-xs">
            <div className="p-3 bg-violet-50/60 rounded-xl border border-violet-100 text-slate-700 space-y-1">
              <p className="text-slate-400 text-[11px] font-medium">Expected Outcome was:</p>
              <p className="font-semibold text-violet-900">{editingOutcomeActivity.expectedOutcome}</p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Actual Measured Outcome <span className="text-violet-600">*</span>
              </label>
              <textarea
                value={newActualOutcome}
                onChange={(e) => setNewActualOutcome(e.target.value)}
                rows={4}
                required
                placeholder="e.g. Over the 7-day review period, wasted ad spend fell from $85/wk to $12/wk. Keyword conversion rate remained stable and overall ACOS dropped to 20.4%."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Update Status
              </label>
              <select
                value={newOutcomeStatus}
                onChange={(e) => setNewOutcomeStatus(e.target.value as ActivityStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500"
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress (Needs Further Optimization)</option>
                <option value="Pending Review">Pending Review</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingOutcomeActivity(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6C4CEE] text-white font-semibold cursor-pointer shadow-md shadow-violet-500/20 card-popup"
              >
                Save Measured Outcome
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
