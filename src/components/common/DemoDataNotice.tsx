import React from 'react';
import { Info, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoDataNotice: React.FC = () => {
  const { accounts, clearAllData, setActivePage } = useApp();

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-2 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200 uppercase tracking-wider font-mono">
          {accounts.length === 0 ? 'Clean Slate Active' : `${accounts.length} Store${accounts.length > 1 ? 's' : ''} Connected`}
        </span>
        <span className="hidden sm:inline text-slate-600 font-medium">
          {accounts.length === 0 
            ? 'All sample accounts and dummy data removed. Ready to add your own Amazon accounts & live KPIs.' 
            : 'Custom Amazon Seller Central & PPC operations workspace.'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {accounts.length === 0 ? (
          <button
            onClick={() => setActivePage('accounts')}
            className="inline-flex items-center gap-1.5 text-xs text-violet-700 hover:text-violet-900 font-bold transition-colors cursor-pointer"
          >
            <span>+ Add Amazon Account</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (window.confirm('Wipe all accounts and reset to a completely empty workspace?')) {
                clearAllData();
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors cursor-pointer"
            title="Clear all stored accounts"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear All Accounts</span>
          </button>
        )}
      </div>
    </div>
  );
};
