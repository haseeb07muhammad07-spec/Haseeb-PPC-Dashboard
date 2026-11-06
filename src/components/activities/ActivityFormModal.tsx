import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ActivityRecord, ActivityModule, ActivityStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { Upload, Image as ImageIcon, Trash2, Eye, CheckCircle2 } from 'lucide-react';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityToEdit?: ActivityRecord | null;
}

const MODULE_OPTIONS: ActivityModule[] = [
  'PPC Optimization',
  'Negative Keywords',
  'Bid Adjustment',
  'Listing Optimization',
  'Inventory Restock',
  'Buy Box / Pricing',
  'Case Log / Support',
  'Promotions & Coupons'
];

const STATUS_OPTIONS: ActivityStatus[] = ['Pending Review', 'In Progress', 'Completed'];

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  onClose,
  activityToEdit
}) => {
  const { accounts, addActivity, updateActivity, activeAccountId } = useApp();

  const [accountId, setAccountId] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [module, setModule] = useState<ActivityModule>('PPC Optimization');
  const [actionTaken, setActionTaken] = useState('');
  const [reference, setReference] = useState('');
  const [previousValue, setPreviousValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [reasonForAction, setReasonForAction] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [status, setStatus] = useState<ActivityStatus>('Pending Review');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [actualOutcome, setActualOutcome] = useState('');
  const [vaName, setVaName] = useState('Alex Rivera');
  const [showImagePreview, setShowImagePreview] = useState(false);

  useEffect(() => {
    if (activityToEdit) {
      setAccountId(activityToEdit.accountId);
      setActivityDate(activityToEdit.activityDate);
      setModule(activityToEdit.module);
      setActionTaken(activityToEdit.actionTaken);
      setReference(activityToEdit.reference);
      setPreviousValue(activityToEdit.previousValue);
      setNewValue(activityToEdit.newValue);
      setReasonForAction(activityToEdit.reasonForAction);
      setExpectedOutcome(activityToEdit.expectedOutcome);
      setReviewDate(activityToEdit.reviewDate);
      setStatus(activityToEdit.status);
      setScreenshotUrl(activityToEdit.screenshotUrl || '');
      setNotes(activityToEdit.notes || '');
      setActualOutcome(activityToEdit.actualOutcome || '');
      setVaName(activityToEdit.vaName || 'Alex Rivera');
    } else {
      // Default new activity values
      const targetAccountId = activeAccountId !== 'all' ? activeAccountId : (accounts[0]?.id || '');
      setAccountId(targetAccountId);
      const today = new Date().toISOString().split('T')[0];
      setActivityDate(today);
      
      const future = new Date();
      future.setDate(future.getDate() + 7);
      setReviewDate(future.toISOString().split('T')[0]);

      setModule('PPC Optimization');
      setActionTaken('');
      setReference('');
      setPreviousValue('');
      setNewValue('');
      setReasonForAction('');
      setExpectedOutcome('');
      setStatus('Pending Review');
      setScreenshotUrl('');
      setNotes('');
      setActualOutcome('');
      setVaName('Alex Rivera');
    }
  }, [activityToEdit, isOpen, activeAccountId, accounts]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadSampleScreenshot = () => {
    // Generate a clean sample SVG data URI for demonstration
    const sampleSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300"><rect width="600" height="300" fill="%231e293b"/><text x="30" y="50" fill="%23f59e0b" font-family="sans-serif" font-weight="bold" font-size="16">AMAZON SELLER CENTRAL PPC CONSOLE AUDIT</text><text x="30" y="90" fill="%2394a3b8" font-family="monospace" font-size="12">Campaign: SP - Manual - Exact Match Core</text><text x="30" y="120" fill="%2394a3b8" font-family="monospace" font-size="12">Keyword: "lightweight hiking stick" | Spend: $85.10 | Orders: 0</text><line x1="30" y1="140" x2="570" y2="140" stroke="%23334155" stroke-width="1"/><rect x="30" y="160" width="120" height="40" fill="%23334155" rx="6"/><text x="45" y="185" fill="%23e2e8f0" font-family="sans-serif" font-size="12">ACOS: 142.8%</text><rect x="170" y="160" width="160" height="40" fill="%23b91c1c" rx="6"/><text x="185" y="185" fill="%23ffffff" font-family="sans-serif" font-size="12">ACTION: BID REDUCED</text><text x="30" y="240" fill="%2364748b" font-family="sans-serif" font-size="11">Verified by Amazon VA Ops Specialist · Target ACOS: 22%</text></svg>`;
    setScreenshotUrl(sampleSvg);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !actionTaken || !reference) {
      alert('Please fill out all required fields (Account, Action Taken, and Reference).');
      return;
    }

    const selectedAccount = accounts.find(a => a.id === accountId);
    const accountName = selectedAccount?.name || 'Unknown Account';

    if (activityToEdit) {
      updateActivity(activityToEdit.id, {
        accountId,
        accountName,
        activityDate,
        module,
        actionTaken,
        reference,
        previousValue,
        newValue,
        reasonForAction,
        expectedOutcome,
        reviewDate,
        status,
        screenshotUrl,
        notes,
        actualOutcome,
        vaName
      });
    } else {
      addActivity({
        accountId,
        accountName,
        activityDate,
        module,
        actionTaken,
        reference,
        previousValue,
        newValue,
        reasonForAction,
        expectedOutcome,
        reviewDate,
        status,
        screenshotUrl,
        notes,
        actualOutcome,
        vaName
      });
    }

    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={activityToEdit ? 'Edit Daily Activity Record' : 'Log Daily Amazon VA Activity'}
        subtitle="Record PPC optimizations, bid adjustments, listing changes, and restock actions."
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Top Row: Account, Date, VA Assignee */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Amazon Account <span className="text-violet-600">*</span>
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              >
                {accounts.length === 0 ? (
                  <option value="">No Accounts Available - Add Account First</option>
                ) : (
                  accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.marketplace})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Activity Date <span className="text-violet-600">*</span>
              </label>
              <input
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                VA Specialist Name
              </label>
              <input
                type="text"
                value={vaName}
                onChange={(e) => setVaName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>
          </div>

          {/* Second Row: Module & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Operations Module <span className="text-violet-600">*</span>
              </label>
              <select
                value={module}
                onChange={(e) => setModule(e.target.value as ActivityModule)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              >
                {MODULE_OPTIONS.map(mod => (
                  <option key={mod} value={mod}>{mod}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Review Status <span className="text-violet-600">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              >
                {STATUS_OPTIONS.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Taken & Reference */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Action Taken <span className="text-violet-600">*</span>
              </label>
              <input
                type="text"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                placeholder="e.g., Lowered bid on bleeding search terms with zero orders"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Campaign / ASIN / Keyword Reference <span className="text-violet-600">*</span>
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., SP - Manual Exact - Trekking Poles [KW: 'lightweight hiking stick'] or ASIN B08Y7Z3K9P"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 font-mono"
              />
            </div>
          </div>

          {/* Previous Value vs New Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Previous Value / State
              </label>
              <input
                type="text"
                value={previousValue}
                onChange={(e) => setPreviousValue(e.target.value)}
                placeholder="e.g., $1.85 / click, 42% ACOS, or Out of stock"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                New Value / Target State
              </label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g., $1.10 / click (-40%), 3 negative exacts added"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>
          </div>

          {/* Reason for Action & Expected Outcome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Reason for Action
              </label>
              <textarea
                value={reasonForAction}
                onChange={(e) => setReasonForAction(e.target.value)}
                rows={2}
                placeholder="e.g., Search term accumulated 46 clicks with $85.10 spend and zero conversions over past 14 days."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Expected Outcome
              </label>
              <textarea
                value={expectedOutcome}
                onChange={(e) => setExpectedOutcome(e.target.value)}
                rows={2}
                placeholder="e.g., Cut wasted ad spend by ~$60/week while preserving top-of-search share for core converting keywords."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>
          </div>

          {/* Review Date & Screenshot Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Review Date
              </label>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Scheduled check-in date to measure performance impact.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Screenshot / Proof of Action
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-violet-600" />
                  <span>{screenshotUrl ? 'Change Image' : 'Upload Screenshot'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleLoadSampleScreenshot}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-[11px] whitespace-nowrap cursor-pointer"
                  title="Insert sample PPC audit screenshot"
                >
                  Load Sample
                </button>
              </div>

              {screenshotUrl && (
                <div className="mt-2 flex items-center justify-between p-2 rounded-xl bg-slate-100 border border-slate-200">
                  <div className="flex items-center gap-2 truncate">
                    <ImageIcon className="w-4 h-4 text-violet-600 shrink-0" />
                    <span className="text-[11px] text-slate-700 truncate">Screenshot attached</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowImagePreview(true)}
                      className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                      title="Preview screenshot"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setScreenshotUrl('')}
                      className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                      title="Remove screenshot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Separate Actual Outcome (Post-review field) */}
          <div className="p-3.5 bg-violet-50/70 border border-violet-200/80 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-violet-900 font-bold text-xs">
                Actual Outcome (Post-Review Update)
              </label>
              <span className="text-[10px] text-violet-600 font-mono font-medium">
                Updated after Review Date
              </span>
            </div>
            <textarea
              value={actualOutcome}
              onChange={(e) => setActualOutcome(e.target.value)}
              rows={2}
              placeholder="e.g., Spend decreased to $14 over following 7 days. Target ACOS dropped to 20.4% with zero loss in keyword rank."
              className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-violet-500 text-xs"
            />
          </div>

          {/* Operational Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Internal VA / Client Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Case ID, special campaign instructions, or client Slack thread link..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6C4CEE] text-white font-semibold text-xs transition-all cursor-pointer shadow-md shadow-violet-500/20 card-popup"
            >
              {activityToEdit ? 'Save Activity Changes' : 'Record Activity Entry'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Screenshot Preview Modal */}
      {showImagePreview && screenshotUrl && (
        <Modal
          isOpen={showImagePreview}
          onClose={() => setShowImagePreview(false)}
          title="Attached Screenshot Proof"
          subtitle={reference}
          maxWidth="4xl"
        >
          <div className="flex flex-col items-center">
            <img 
              src={screenshotUrl} 
              alt="Activity proof screenshot" 
              className="max-h-[65vh] w-auto object-contain rounded-xl border border-slate-200 bg-white shadow-md" 
            />
            <div className="mt-4 flex justify-end w-full">
              <button
                onClick={() => setShowImagePreview(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
