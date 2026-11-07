import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Sliders, 
  CheckCircle2, 
  RotateCcw, 
  HelpCircle,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DaypartingSlot } from '../../types';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const PpcDaypartingHeatmap: React.FC = () => {
  const { 
    daypartingSlots, 
    updateDaypartingSlot, 
    applyDaypartingPreset, 
    currentAccount 
  } = useApp();

  const [activePreset, setActivePreset] = useState<'smart' | 'aggressive' | 'saver' | 'custom'>('smart');
  const [selectedSlot, setSelectedSlot] = useState<DaypartingSlot | null>(null);
  const [editMultiplier, setEditMultiplier] = useState<number>(0);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const currency = currentAccount?.currency || '€';

  const handleSelectSlot = (slot: DaypartingSlot) => {
    setSelectedSlot(slot);
    setEditMultiplier(slot.bidMultiplier);
  };

  const handleSaveSlotMultiplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    updateDaypartingSlot(selectedSlot.day, selectedSlot.hour, editMultiplier);
    setActivePreset('custom');
    setSelectedSlot(null);
    setAppliedNotice(`Updated ${DAYS_OF_WEEK[selectedSlot.day]} at ${String(selectedSlot.hour).padStart(2, '0')}:00 to ${editMultiplier > 0 ? '+' : ''}${editMultiplier}%`);
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  const handleApplyPreset = (preset: 'smart' | 'aggressive' | 'saver' | 'reset') => {
    applyDaypartingPreset(preset);
    setActivePreset(preset === 'reset' ? 'custom' : preset);
    setAppliedNotice(`Applied ${preset.toUpperCase()} Dayparting Schedule to ${currentAccount ? currentAccount.name : 'All Accounts'}!`);
    setTimeout(() => setAppliedNotice(null), 3500);
  };

  // Color helper based on multiplier and CVR
  const getSlotColor = (slot: DaypartingSlot) => {
    if (slot.bidMultiplier >= 25) {
      return 'bg-violet-600 text-white font-bold shadow-xs';
    }
    if (slot.bidMultiplier > 0) {
      return 'bg-violet-100 text-violet-800 font-semibold border border-violet-200';
    }
    if (slot.bidMultiplier <= -30) {
      return 'bg-rose-50 text-rose-700 font-semibold border border-rose-200';
    }
    if (slot.bidMultiplier < 0) {
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
    return 'bg-slate-50 text-slate-600 hover:bg-slate-100';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-950 text-white shadow-xl shadow-violet-950/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-violet-400/20 text-violet-200 border border-violet-400/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>24/7 Hourly Bid Dayparting</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-slate-300">
                Active Store: {currentAccount ? currentAccount.name : 'All Accounts'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              PPC Dayparting & Hourly Performance Heatmap
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Dynamically scale your Amazon PPC bids during peak conversion hours (18:00 - 23:00) and throttle bids by -40% during sleep hours (01:00 - 06:00) to stop wasting budget on dead clicks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Peak Window CVR</p>
              <p className="text-lg font-black text-emerald-400">19.5% - 24%</p>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Est. Budget Saved</p>
              <p className="text-lg font-black text-white">{currency}420 / mo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applied Notice */}
      {appliedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 card-popup">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Preset Strategy Selector Bar */}
      <div className="p-5 rounded-3xl glass-card border border-slate-200/80 bg-white/90 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-violet-600" />
              <span>Automated Schedule Presets</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select an agency-tested bid strategy or click individual cells in the heatmap below to fine-tune.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleApplyPreset('smart')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activePreset === 'smart'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Agency Curve (Recommended)</span>
            </button>

            <button
              onClick={() => handleApplyPreset('aggressive')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activePreset === 'aggressive'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Aggressive Rank Push (+35%)</span>
            </button>

            <button
              onClick={() => handleApplyPreset('saver')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activePreset === 'saver'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Conservative Budget Saver (-50%)</span>
            </button>

            <button
              onClick={() => handleApplyPreset('reset')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              title="Reset all multipliers to flat 0%"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-violet-600 inline-block" />
              <span>Prime Evening Boost (+25% to +35%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-violet-100 border border-violet-200 inline-block" />
              <span>Moderate Lunch (+10%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block" />
              <span>Normal Standard (0%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-50 border border-rose-200 inline-block" />
              <span>Sleep Hours Waste Filter (-40%)</span>
            </span>
          </div>
          <span className="font-semibold text-slate-700 italic">
            *Click any cell to edit its multiplier
          </span>
        </div>

        {/* 7-Day x 24-Hour Interactive Grid */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-3">
          <div className="min-w-[900px]">
            {/* Hour Header (00 to 23) */}
            <div className="grid grid-cols-[100px_repeat(24,1fr)] gap-1 text-[10px] font-mono text-slate-400 mb-2 font-bold text-center">
              <div className="text-left pl-2">Day / Time</div>
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className={h >= 18 && h <= 23 ? 'text-violet-700 font-extrabold' : ''}>
                  {String(h).padStart(2, '0')}
                </div>
              ))}
            </div>

            {/* Days Rows */}
            {DAYS_OF_WEEK.map((dayName, dayIndex) => {
              const daySlots = daypartingSlots.filter(s => s.day === dayIndex);

              return (
                <div 
                  key={dayIndex}
                  className="grid grid-cols-[100px_repeat(24,1fr)] gap-1 mb-1 items-center"
                >
                  {/* Day Label */}
                  <div className="text-xs font-bold text-slate-700 pl-2 truncate">
                    {dayName}
                  </div>

                  {/* 24 Hourly Slots */}
                  {daySlots.map((slot) => {
                    const isSelected = selectedSlot?.day === slot.day && selectedSlot?.hour === slot.hour;

                    return (
                      <button
                        key={slot.hour}
                        onClick={() => handleSelectSlot(slot)}
                        title={`${dayName} ${String(slot.hour).padStart(2, '0')}:00\nMultiplier: ${slot.bidMultiplier > 0 ? '+' : ''}${slot.bidMultiplier}%\nCVR: ${slot.cvrAvg}%\nEst. Orders: ${slot.ordersCount}`}
                        className={`h-9 rounded-lg text-[10px] font-mono flex items-center justify-center transition-all cursor-pointer relative group ${getSlotColor(slot)} ${
                          isSelected ? 'ring-2 ring-violet-900 ring-offset-1' : ''
                        }`}
                      >
                        {slot.bidMultiplier !== 0 ? (
                          <span>{slot.bidMultiplier > 0 ? `+${slot.bidMultiplier}` : slot.bidMultiplier}</span>
                        ) : (
                          <span className="opacity-30">·</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Slot Modal / Panel */}
      {selectedSlot && (
        <div className="p-5 rounded-3xl glass-card border border-violet-200 bg-violet-50/50 space-y-3 card-popup">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-violet-600" />
              <span>
                Edit Multiplier for {DAYS_OF_WEEK[selectedSlot.day]} at {String(selectedSlot.hour).padStart(2, '0')}:00
              </span>
            </h4>
            <button
              onClick={() => setSelectedSlot(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>

          <form onSubmit={handleSaveSlotMultiplier} className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">Bid Adjustment (%):</label>
              <input
                type="number"
                min="-60"
                max="60"
                step="5"
                value={editMultiplier}
                onChange={(e) => setEditMultiplier(Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <span className="text-xs text-slate-500 font-mono">%</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setEditMultiplier(-40)}
                className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-mono font-bold text-[11px]"
              >
                -40% (Sleep Saver)
              </button>
              <button
                type="button"
                onClick={() => setEditMultiplier(0)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-[11px]"
              >
                0% (Normal)
              </button>
              <button
                type="button"
                onClick={() => setEditMultiplier(25)}
                className="px-2.5 py-1 rounded-lg bg-violet-100 hover:bg-violet-200 text-violet-800 font-mono font-bold text-[11px]"
              >
                +25% (Prime Evening)
              </button>
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-xs ml-auto cursor-pointer"
            >
              Save Hour Multiplier
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
