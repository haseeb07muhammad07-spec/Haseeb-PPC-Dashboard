import React, { useState } from 'react';
import { 
  Crosshair, 
  Target, 
  TrendingUp, 
  Percent, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Edit3, 
  Save, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GoalsTargetsPage: React.FC = () => {
  const { currentAccount, salesData, raw30DaySalesData, updateAccount } = useApp();

  const currency = currentAccount?.currency || '€';

  // Configurable Monthly Sales Target
  const initialMonthlyTarget = currentAccount?.monthlySalesTarget || 30000;
  const [monthlyTargetInput, setMonthlyTargetInput] = useState<number>(initialMonthlyTarget);
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  // Exact calculations requested by user:
  // Monthly Target -> Daily Goal = Monthly / 30 -> Weekly Goal = Daily * 7
  const monthlyTarget = monthlyTargetInput;
  const dailyTarget = Math.round(monthlyTarget / 30);
  const weeklyTarget = Math.round(dailyTarget * 7);

  // Actual sales achieved:
  // Today's actual sales (last record in 30-day series)
  const todayRecord = raw30DaySalesData[raw30DaySalesData.length - 1];
  const todayActualSales = todayRecord ? todayRecord.totalSales : 0;

  // This week's actual sales (last 7 days)
  const last7DaysData = raw30DaySalesData.slice(-7);
  const weeklyActualSales = last7DaysData.reduce((s, d) => s + d.totalSales, 0);

  // Month-to-date total sales (all 30 records)
  const monthlyActualSales = raw30DaySalesData.reduce((s, d) => s + d.totalSales, 0);

  // Remaining gaps:
  const dailyGap = dailyTarget - todayActualSales;
  const weeklyGap = weeklyTarget - weeklyActualSales;
  const monthlyGap = monthlyTarget - monthlyActualSales;

  // Percentage completions:
  const dailyPct = Math.min(100, Math.round((todayActualSales / (dailyTarget || 1)) * 100));
  const weeklyPct = Math.min(100, Math.round((weeklyActualSales / (weeklyTarget || 1)) * 100));
  const monthlyPct = Math.min(100, Math.round((monthlyActualSales / (monthlyTarget || 1)) * 100));

  // Required Daily Run Rate to close the remaining monthly gap in next 25 days:
  const daysLeft = 25;
  const requiredDailyPacing = monthlyGap > 0 ? Math.round(monthlyGap / daysLeft) : 0;

  // ACOS targets
  const targetAcos = currentAccount?.acosTarget || 22;
  const totalAdSales = raw30DaySalesData.reduce((s, d) => s + d.adSales, 0);
  const totalAdSpend = raw30DaySalesData.reduce((s, d) => s + d.adSpend, 0);
  const currentAcos = totalAdSales > 0 ? +((totalAdSpend / totalAdSales) * 100).toFixed(1) : 0;

  const handleSaveMonthlyTarget = () => {
    if (currentAccount) {
      updateAccount(currentAccount.id, {
        monthlySalesTarget: Number(monthlyTargetInput)
      });
    }
    setIsEditingTarget(false);
  };

  if (!currentAccount) {
    return (
      <div className="card-popup glass-card p-8 md:p-12 rounded-3xl border border-white/95 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center mx-auto text-violet-700">
          <Target className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Amazon Account Connected</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please add or select an Amazon account to calculate and track your daily, weekly, and monthly sales targets.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Title & Editable Monthly Target Control */}
      <div className="card-popup glass-card p-6 md:p-7 rounded-3xl border border-white/95 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Goals & Target Decomposition Engine
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">
              {currentAccount?.clientName ? `${currentAccount.clientName} · ` : ''}{currentAccount?.name || 'Active Store'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automatic hierarchical target breakdown: Monthly Target → Daily Goal (÷30) → Weekly Goal (×7) with real-time deduction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEditingTarget ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Set Monthly Target:</span>
              <input
                type="number"
                step="1000"
                value={monthlyTargetInput}
                onChange={(e) => setMonthlyTargetInput(Number(e.target.value))}
                className="w-32 bg-white border border-violet-400 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none shadow-sm"
              />
              <button
                onClick={handleSaveMonthlyTarget}
                className="px-3.5 py-1.5 bg-violet-600 text-white font-bold text-xs rounded-xl hover:bg-violet-700 cursor-pointer shadow-sm transition-all"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingTarget(true)}
              className="card-popup flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-violet-50/70 text-violet-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Monthly Goal ({currency}{monthlyTarget.toLocaleString()})</span>
            </button>
          )}
        </div>
      </div>

      {/* THREE-TIER HIERARCHICAL GOALS (DAILY, WEEKLY, MONTHLY) - With Card Popup Hover */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. DAILY GOAL (Monthly / 30) */}
        <div className="card-popup glass-card p-6 md:p-7 rounded-3xl border border-white/95 space-y-4 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 block">
                Tier 1 · Daily Goal (Target ÷ 30)
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">Today's Sales Target</h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 font-bold text-sm shadow-sm">
              {dailyPct}%
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between font-sans">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tabular-nums">
                {currency}{todayActualSales.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                / {currency}{dailyTarget.toLocaleString()} goal
              </span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  dailyPct >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-violet-500 to-indigo-600'
                }`}
                style={{ width: `${dailyPct}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Status vs Target:</span>
            {dailyGap <= 0 ? (
              <span className="text-emerald-600 font-bold">
                ✓ Goal Achieved (+{currency}{Math.abs(dailyGap).toLocaleString()} surplus)
              </span>
            ) : (
              <span className="text-violet-700 font-bold">
                {currency}{dailyGap.toLocaleString()} remaining to hit target
              </span>
            )}
          </div>
        </div>

        {/* 2. WEEKLY GOAL (Daily * 7) */}
        <div className="card-popup glass-card p-6 md:p-7 rounded-3xl border border-white/95 space-y-4 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                Tier 2 · Weekly Goal (Daily × 7)
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">Current Week's Target</h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-sm">
              {weeklyPct}%
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between font-sans">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tabular-nums">
                {currency}{weeklyActualSales.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                / {currency}{weeklyTarget.toLocaleString()} goal
              </span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  weeklyPct >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-violet-600'
                }`}
                style={{ width: `${weeklyPct}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">7-Day Pacing:</span>
            {weeklyGap <= 0 ? (
              <span className="text-emerald-600 font-bold">
                ✓ Weekly Goal Met (+{currency}{Math.abs(weeklyGap).toLocaleString()})
              </span>
            ) : (
              <span className="text-indigo-700 font-bold">
                {currency}{weeklyGap.toLocaleString()} left to complete week
              </span>
            )}
          </div>
        </div>

        {/* 3. MONTHLY GOAL (Total Target with Real-Time Subtraction) */}
        <div className="card-popup glass-card p-6 md:p-7 rounded-3xl border border-white/95 space-y-4 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Tier 3 · Monthly Benchmark
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">Total Month Sales Goal</h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm shadow-sm">
              {monthlyPct}%
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between font-sans">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tabular-nums">
                {currency}{monthlyActualSales.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                / {currency}{monthlyTarget.toLocaleString()} target
              </span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
              <div 
                className="bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${monthlyPct}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Deduction Balance:</span>
            {monthlyGap <= 0 ? (
              <span className="text-emerald-600 font-bold">
                ✓ Full Monthly Target Achieved!
              </span>
            ) : (
              <span className="text-violet-700 font-bold">
                {currency}{monthlyGap.toLocaleString()} remaining to hit target
              </span>
            )}
          </div>
        </div>
      </div>

      {/* REQUIRED PACING & ACOS TARGET CONSOLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Run Rate Card */}
        <div className="card-popup glass-card p-6 md:p-7 rounded-3xl border border-white/95 space-y-4 cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Target Run-Rate Required</span>
            <span className="text-[11px] text-slate-400 font-medium">~{daysLeft} days remaining</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-medium">Required Daily Velocity</span>
              <span className="text-2xl font-extrabold text-slate-900">
                {currency}{requiredDailyPacing.toLocaleString()} / day
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              At your current daily average of <strong className="text-emerald-600 font-bold">{currency}{todayActualSales.toLocaleString()}</strong>, you are currently <strong className="text-emerald-600 font-bold">on pace</strong> to exceed the {currency}{monthlyTarget.toLocaleString()} goal.
            </p>
          </div>
        </div>

        {/* ACOS Target Ceiling Guardrail */}
        <div className="card-popup glass-card p-6 md:p-7 rounded-3xl border border-white/95 space-y-4 cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">ACOS Target Ceiling vs Actual</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              currentAcos <= targetAcos ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {currentAcos <= targetAcos ? 'Operating Profitably' : 'Alert: Over Target'}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-medium">Current Account ACOS</span>
              <span className="text-2xl font-extrabold text-emerald-600">
                {currentAcos}% <span className="text-xs text-slate-400 font-normal">/ max {targetAcos}%</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Total PPC spend is safely constrained. Every {currency}1 spent in ads returns <strong className="text-slate-800 font-bold">{currency}{(totalAdSales / (totalAdSpend || 1)).toFixed(2)}</strong> in attributed revenue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
