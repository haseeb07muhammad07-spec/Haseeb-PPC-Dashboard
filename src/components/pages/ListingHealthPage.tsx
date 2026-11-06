import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Image as ImageIcon, 
  FileText, 
  Sparkles, 
  ExternalLink,
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ListingHealthItem } from '../../types';

interface ListingHealthPageProps {
  onOpenNewActivity: () => void;
}

export const ListingHealthPage: React.FC<ListingHealthPageProps> = ({ onOpenNewActivity }) => {
  const { filteredListingHealth, currentAccount } = useApp();

  const [selectedAsin, setSelectedAsin] = useState<ListingHealthItem | null>(null);

  if (!currentAccount) {
    return (
      <div className="card-popup glass-card p-8 md:p-12 rounded-3xl border border-white/95 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center mx-auto text-violet-700">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Listing Health Audits</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Add or connect an Amazon account to monitor Buy Box share, A+ content, and listing suppression alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Listing Health & Buy Box Audit</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">
            {currentAccount.clientName ? `${currentAccount.clientName} · ` : ''}{currentAccount.name}
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitor Buy Box share, listing quality scores, review velocity, and Amazon policy compliance.
        </p>
      </div>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
        <div className="card-popup glass-card p-5 rounded-3xl border border-white/95 space-y-1 cursor-pointer">
          <span className="text-xs text-slate-400 font-semibold">Avg. Buy Box Share</span>
          <p className="text-2xl font-extrabold text-emerald-600 tabular-nums">
            {(filteredListingHealth.reduce((s, l) => s + l.buyBoxPercentage, 0) / (filteredListingHealth.length || 1)).toFixed(1)}%
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Target ≥ 95%</span>
        </div>
        <div className="card-popup glass-card p-5 rounded-3xl border border-white/95 space-y-1 cursor-pointer">
          <span className="text-xs text-slate-400 font-semibold">Avg. Listing Score</span>
          <p className="text-2xl font-extrabold text-violet-700 tabular-nums">
            {Math.round(filteredListingHealth.reduce((s, l) => s + l.listingScore, 0) / (filteredListingHealth.length || 1))}/100
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Content completeness</span>
        </div>
        <div className="card-popup glass-card p-5 rounded-3xl border border-white/95 space-y-1 cursor-pointer">
          <span className="text-xs text-slate-400 font-semibold">A+ Content Coverage</span>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {Math.round((filteredListingHealth.filter(l => l.hasAplus).length / (filteredListingHealth.length || 1)) * 100)}%
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Enhanced Brand Content</span>
        </div>
        <div className="card-popup glass-card p-5 rounded-3xl border border-white/95 space-y-1 cursor-pointer">
          <span className="text-xs text-slate-400 font-semibold">Attention Required</span>
          <p className="text-2xl font-extrabold text-rose-600 tabular-nums">
            {filteredListingHealth.filter(l => l.status === 'WARNING' || l.status === 'SUPPRESSED').length}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Listing defects or hijackers</span>
        </div>
      </div>

      {/* Listing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredListingHealth.map((item) => (
          <div
            key={item.id}
            className="card-popup glass-card p-6 md:p-7 rounded-3xl border border-white/95 space-y-4 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-violet-700 font-bold text-sm">{item.asin}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{item.sku}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1 line-clamp-2" title={item.title}>
                  {item.title}
                </h3>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                item.status === 'HEALTHY'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {item.status}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-xs text-center">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Buy Box %</span>
                <span className={`font-bold ${item.buyBoxPercentage >= 95 ? 'text-emerald-600' : 'text-violet-700'}`}>
                  {item.buyBoxPercentage}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Rating</span>
                <span className="text-slate-800 font-bold flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                  <span>{item.rating}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Review Count</span>
                <span className="text-slate-800 font-bold">
                  {item.reviewCount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Content Audit Checklist */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Catalog Listing Attributes
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div className="flex items-center gap-1.5">
                  {item.imagesCount >= 7 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span>Images: <strong className="text-slate-900">{item.imagesCount}</strong>/7</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.bulletsCount >= 5 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span>Bullets: <strong className="text-slate-900">{item.bulletsCount}</strong>/5</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.hasAplus ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <span>A+ Content: <strong className="text-slate-900">{item.hasAplus ? 'Active' : 'Missing'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Score:</span>
                  <span className="text-violet-700 font-bold">{item.listingScore}/100</span>
                </div>
              </div>
            </div>

            {/* Alerts list if present */}
            {item.alerts.length > 0 && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                <span className="font-bold text-[11px] uppercase tracking-wide block text-amber-700">
                  Recommendations:
                </span>
                {item.alerts.map((al, idx) => (
                  <p key={idx} className="text-[11px] leading-snug">· {al}</p>
                ))}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={onOpenNewActivity}
                className="card-popup w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-violet-600 hover:text-white text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Log Optimization for {item.asin}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
