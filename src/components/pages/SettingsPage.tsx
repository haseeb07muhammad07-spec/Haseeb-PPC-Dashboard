import React, { useState } from 'react';
import { 
  RotateCcw, 
  Download, 
  Upload, 
  Users, 
  Bell, 
  ShieldCheck, 
  Save, 
  Check 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { 
    accounts, 
    activities, 
    ppcCampaigns, 
    inventory, 
    listingHealth, 
    tasks, 
    alerts, 
    resetAllToDemoData 
  } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [vaTeam] = useState([
    { id: 'va-1', name: 'Alex Rivera', role: 'Sr. Amazon PPC & Operations Specialist', email: 'alex.rivera@va-agency.com', accountsCount: 2 },
    { id: 'va-2', name: 'Sarah Chen', role: 'Catalog & Listing Optimization Specialist', email: 'sarah.chen@va-agency.com', accountsCount: 1 },
    { id: 'va-3', name: 'Marcus Vance', role: 'Inventory & FBA Logistics Associate', email: 'marcus.v@va-agency.com', accountsCount: 1 }
  ]);

  const [alertSettings, setAlertSettings] = useState({
    acosThreshold: 30,
    minDaysOfSupply: 14,
    buyBoxThreshold: 90,
    emailDailyDigest: true,
    slackWebhook: 'https://hooks.slack.com/services/DEMO/AMAZON/VA_OPS'
  });

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const backupData = {
      accounts,
      activities,
      ppcCampaigns,
      inventory,
      listingHealth,
      tasks,
      alerts,
      exportedAt: new Date().toISOString()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Amazon_VA_Command_Center_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.accounts && parsed.activities) {
            localStorage.setItem('amz_va_accounts_v1', JSON.stringify(parsed.accounts));
            localStorage.setItem('amz_va_activities_v1', JSON.stringify(parsed.activities));
            if (parsed.ppcCampaigns) localStorage.setItem('amz_va_campaigns_v1', JSON.stringify(parsed.ppcCampaigns));
            if (parsed.inventory) localStorage.setItem('amz_va_inventory_v1', JSON.stringify(parsed.inventory));
            if (parsed.listingHealth) localStorage.setItem('amz_va_listings_v1', JSON.stringify(parsed.listingHealth));
            alert('Backup successfully imported! Refreshing dashboard data...');
            window.location.reload();
          } else {
            alert('Invalid backup file structure.');
          }
        } catch (err) {
          alert('Failed to parse backup JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System & VA Operations Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure operations team members, alert trigger thresholds, and prototype demo storage.
        </p>
      </div>

      {/* Alert Thresholds Form */}
      <form onSubmit={handleSavePreferences} className="p-6 rounded-2xl glass-card space-y-4 text-xs card-popup">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-bold text-slate-900">Performance Alert Thresholds</h3>
          </div>
          {savedSuccess && (
            <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
              <Check className="w-3.5 h-3.5" /> Preferences Saved!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Trigger High ACOS Alert at:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={alertSettings.acosThreshold}
                onChange={(e) => setAlertSettings({ ...alertSettings, acosThreshold: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-mono focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
              <span className="text-slate-500 font-mono font-bold">%</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Trigger Low Stock Alert at:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={alertSettings.minDaysOfSupply}
                onChange={(e) => setAlertSettings({ ...alertSettings, minDaysOfSupply: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-mono focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
              <span className="text-slate-500 font-mono font-bold">days</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Trigger Buy Box Drop Alert below:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={alertSettings.buyBoxThreshold}
                onChange={(e) => setAlertSettings({ ...alertSettings, buyBoxThreshold: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-mono focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />
              <span className="text-slate-500 font-mono font-bold">%</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6C4CEE] text-white font-semibold text-xs cursor-pointer transition-all shadow-md shadow-violet-500/20 card-popup"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Threshold Rules</span>
          </button>
        </div>
      </form>

      {/* VA Team Members */}
      <div className="p-6 rounded-2xl glass-card space-y-4 card-popup">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-bold text-slate-900">VA Team & Operations Assignees</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {vaTeam.map(va => (
            <div key={va.id} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{va.name}</h4>
                  <p className="text-[11px] text-violet-700 font-medium">{va.role}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-violet-50 text-violet-700 border border-violet-100 font-semibold">
                  {va.accountsCount} accounts
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">{va.email}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Data Management & Storage */}
      <div className="p-6 rounded-2xl glass-card space-y-4 text-xs card-popup">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-bold text-slate-900">Prototype LocalStorage & Demo Data Manager</h3>
        </div>

        <p className="text-slate-500 leading-relaxed">
          For this prototype version, all data (Amazon accounts, daily activity logs, campaign adjustments, and inventory plans) is saved directly in your browser's persistent LocalStorage. No external API keys are required.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* Reset Demo Data */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-900">Restore Sample Demo Data</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Reset all records, campaigns, and activity logs back to default pre-loaded sample state.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset all accounts and activities to initial sample demo data?')) {
                  resetAllToDemoData();
                  alert('Reset complete! Default demo data loaded.');
                }
              }}
              className="w-full mt-3 py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs card-popup"
            >
              <RotateCcw className="w-3.5 h-3.5 text-violet-600" />
              <span>Reset to Sample Data</span>
            </button>
          </div>

          {/* Export JSON Backup */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-900">Export JSON State Backup</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Save an offline JSON snapshot of your logged activities, accounts, and inventory plans.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="w-full mt-3 py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs card-popup"
            >
              <Download className="w-3.5 h-3.5 text-violet-600" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Import JSON Backup */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-900">Import JSON Backup</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Restore a previously exported command center snapshot from your computer.
              </p>
            </div>
            <label className="w-full mt-3 py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center shadow-xs card-popup">
              <Upload className="w-3.5 h-3.5 text-violet-600" />
              <span>Load Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
