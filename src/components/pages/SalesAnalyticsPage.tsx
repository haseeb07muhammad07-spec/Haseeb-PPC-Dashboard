import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Sliders, 
  Layers, 
  Percent, 
  DollarSign, 
  ShoppingCart, 
  Check, 
  Sparkles,
  Target
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricKey } from '../../types';

interface MetricConfig {
  key: MetricKey;
  label: string;
  color: string;
  unit: string;
  isCurrency?: boolean;
  isPercent?: boolean;
  yAxisId: 'currency' | 'percent' | 'count';
}

const AVAILABLE_METRICS: MetricConfig[] = [
  { key: 'totalSales', label: 'Total Sales', color: '#7c5cfc', unit: '€', isCurrency: true, yAxisId: 'currency' },
  { key: 'adSales', label: 'PPC Ad Sales', color: '#4f46e5', unit: '€', isCurrency: true, yAxisId: 'currency' },
  { key: 'organicSales', label: 'Organic Sales', color: '#10b981', unit: '€', isCurrency: true, yAxisId: 'currency' },
  { key: 'adSpend', label: 'PPC Ad Spend', color: '#f43f5e', unit: '€', isCurrency: true, yAxisId: 'currency' },
  { key: 'orders', label: 'Total Orders', color: '#8b5cf6', unit: '', yAxisId: 'count' },
  { key: 'acos', label: 'ACOS', color: '#e11d48', unit: '%', isPercent: true, yAxisId: 'percent' },
  { key: 'tacos', label: 'TACOS', color: '#06b6d4', unit: '%', isPercent: true, yAxisId: 'percent' },
  { key: 'roas', label: 'ROAS', color: '#059669', unit: 'x', yAxisId: 'percent' },
  { key: 'cvr', label: 'CVR (Conversion Rate)', color: '#ec4899', unit: '%', isPercent: true, yAxisId: 'percent' },
  { key: 'ctr', label: 'CTR (Click-Through)', color: '#0d9488', unit: '%', isPercent: true, yAxisId: 'percent' },
  { key: 'cpc', label: 'CPC (Cost per Click)', color: '#9333ea', unit: '€', isCurrency: true, yAxisId: 'percent' },
];

export const SalesAnalyticsPage: React.FC = () => {
  const { salesData, currentAccount, filteredCatalogAsins } = useApp();

  const currency = currentAccount?.currency || '€';

  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>([
    'totalSales',
    'acos',
    'tacos'
  ]);

  const handleToggleMetric = (key: MetricKey) => {
    if (selectedMetrics.includes(key)) {
      if (selectedMetrics.length === 1) return;
      setSelectedMetrics(selectedMetrics.filter(m => m !== key));
    } else {
      if (selectedMetrics.length >= 3) {
        setSelectedMetrics([...selectedMetrics.slice(1), key]);
      } else {
        setSelectedMetrics([...selectedMetrics, key]);
      }
    }
  };

  const totalSales = salesData.reduce((s, d) => s + d.totalSales, 0);
  const totalOrganicSales = salesData.reduce((s, d) => s + d.organicSales, 0);
  const totalAdSales = salesData.reduce((s, d) => s + d.adSales, 0);

  const organicPct = totalSales > 0 ? Math.round((totalOrganicSales / totalSales) * 100) : 50;
  const adPct = totalSales > 0 ? 100 - organicPct : 50;

  const pieData = [
    { name: 'Organic Sales', value: totalOrganicSales, color: '#10b981' },
    { name: 'Sponsored Ad Sales', value: totalAdSales, color: '#7c5cfc' }
  ];

  if (salesData.length === 0) {
    return (
      <div className="card-popup glass-card p-8 md:p-12 rounded-3xl border border-white/95 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center mx-auto text-violet-700">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Sales Data Available</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Add or connect an Amazon account to plot 3-metric comparative timelines (Sales, ACOS, TACOS, CTR, CVR).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Sales & Multi-Metric Correlation Engine</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">
            3-Metric Graph Selector
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select any 3 performance KPIs simultaneously to evaluate how PPC spend, ACOS, and TACOS impact conversion and organic rank.
        </p>
      </div>

      {/* 3-METRIC MULTI-SELECTION GRAPH CONTROLLER */}
      <div className="card-popup glass-card p-6 md:p-8 rounded-3xl border border-white/95 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Interactive 3-Metric Comparative Timeline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any metric to plot. Active: <span className="text-violet-700 font-bold">{selectedMetrics.length}/3 selected</span>
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1 hidden sm:inline">Presets:</span>
            <button
              onClick={() => setSelectedMetrics(['totalSales', 'acos', 'tacos'])}
              className="card-popup px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Sales + ACOS + TACOS
            </button>
            <button
              onClick={() => setSelectedMetrics(['cvr', 'ctr', 'orders'])}
              className="card-popup px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              CVR + CTR + Orders
            </button>
            <button
              onClick={() => setSelectedMetrics(['adSpend', 'cpc', 'acos'])}
              className="card-popup px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Spend + CPC + ACOS
            </button>
          </div>
        </div>

        {/* Metric Selection Pills Grid */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          {AVAILABLE_METRICS.map(m => {
            const isSelected = selectedMetrics.includes(m.key);
            const selectionIndex = selectedMetrics.indexOf(m.key) + 1;

            return (
              <button
                key={m.key}
                onClick={() => handleToggleMetric(m.key)}
                className={`card-popup flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-violet-300 text-violet-800 shadow-sm bg-violet-50/80'
                    : 'bg-white/90 border-slate-200/80 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                <span>{m.label}</span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center font-sans">
                    {selectionIndex}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Multi-Axis Recharts Line Chart */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.7)" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              
              {/* Left Currency Axis */}
              <YAxis 
                yAxisId="currency" 
                orientation="left" 
                stroke="#7c5cfc" 
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${currency}${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} 
              />
              
              {/* Right Percent Axis for ACOS / TACOS / CVR / CTR */}
              <YAxis 
                yAxisId="percent" 
                orientation="right" 
                stroke="#06b6d4" 
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}%`} 
              />

              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#e2e8f0', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 25px -4px rgba(0,0,0,0.1)' }}
                formatter={(val: any, name: any) => {
                  const cfg = AVAILABLE_METRICS.find(m => m.label === name || m.key === name);
                  if (cfg?.isCurrency) return [`${currency}${Number(val).toLocaleString()}`, cfg.label];
                  if (cfg?.isPercent) return [`${val}%`, cfg.label];
                  return [val, cfg?.label || name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />

              {/* Dynamically Render Lines for Selected Metrics */}
              {selectedMetrics.map(key => {
                const config = AVAILABLE_METRICS.find(m => m.key === key);
                if (!config) return null;

                const axisId = (config.isPercent || config.key === 'roas' || config.key === 'cpc') 
                  ? 'percent' 
                  : 'currency';

                return (
                  <Line
                    key={config.key}
                    yAxisId={axisId}
                    type="monotone"
                    dataKey={config.key}
                    name={config.label}
                    stroke={config.color}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: config.color }}
                    activeDot={{ r: 5 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Row: Revenue Source Split & ASIN Catalog Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Organic vs Ad Sales */}
        <div className="lg:col-span-1 card-popup glass-card p-6 md:p-7 rounded-3xl border border-white/95 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Revenue Source Split</h3>
            <p className="text-xs text-slate-500 mt-0.5">Organic vs Sponsored discovery mix</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#e2e8f0', borderRadius: '16px', fontSize: '12px' }}
                  formatter={(val: any) => [`${currency}${Number(val).toLocaleString()}`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Organic Sales
              </span>
              <span className="font-bold text-emerald-600">{organicPct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                Sponsored Ad Sales
              </span>
              <span className="font-bold text-violet-700">{adPct}%</span>
            </div>
          </div>
        </div>

        {/* ASIN Breakdown for Active Account */}
        <div className="lg:col-span-2 card-popup glass-card p-6 md:p-7 rounded-3xl border border-white/95 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Catalog ASIN Performance</h3>
            <p className="text-xs text-slate-500 mt-0.5">Daily unit velocity and revenue pacing by SKU</p>
          </div>

          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">ASIN / SKU</th>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Tier</th>
                  <th className="pb-3 text-right">Unit Price</th>
                  <th className="pb-3 text-right">Daily Units</th>
                  <th className="pb-3 text-right">30D Run Rate</th>
                  <th className="pb-3 text-right pr-2">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCatalogAsins.map(a => (
                  <tr key={a.id} className="hover:bg-violet-50/50 transition-colors">
                    <td className="py-3 pl-2">
                      <span className="text-violet-700 font-bold block">{a.asin}</span>
                      <span className="text-[10px] text-slate-400 block">{a.sku}</span>
                    </td>
                    <td className="py-3 text-slate-700 font-medium max-w-[180px] truncate" title={a.title}>
                      {a.title}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.priorityTier.includes('Tier 1') ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {a.priorityTier.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-800 font-bold">
                      {currency}{a.price.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-emerald-600 font-bold">
                      {a.dailyVelocity} /d
                    </td>
                    <td className="py-3 text-right text-slate-900 font-bold">
                      {currency}{(a.dailyVelocity * a.price * 30).toLocaleString()}
                    </td>
                    <td className="py-3 text-right pr-2 text-violet-700 font-bold">
                      {a.fbaStock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
