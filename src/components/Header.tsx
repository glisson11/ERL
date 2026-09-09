import React from 'react';
import { BookOpen, Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';

interface HeaderProps {
  onOpenSopModal: (tab?: 'rules' | 'macros') => void;
  hasGeminiKey?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSopModal, hasGeminiKey }) => {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-800 font-serif font-bold text-lg shadow-inner">
            E&R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-serif tracking-tight font-semibold text-stone-900">
                Emma & Rose London
              </h1>
              <span className="hidden xs:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100/70 text-rose-800 border border-rose-200">
                AI Co-Pilot
              </span>
            </div>
            <p className="text-xs text-stone-500 flex items-center gap-1.5">
              <span>Customer Care Desk</span>
              <span className="text-stone-300">•</span>
              <span className="inline-flex items-center gap-1 text-stone-600">
                <HeartHandshake className="w-3 h-3 text-rose-600" />
                Mother & Daughter Boutique
              </span>
              <span className="text-stone-300">•</span>
              <span>GBP (£) / UK Only</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-50 rounded-md border border-stone-200 text-xs text-stone-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium">SOP v1.0 Active</span>
            <span className="text-stone-300">|</span>
            <span className="text-stone-500">§19 Overrides Enforced</span>
          </div>

          <button
            id="sop-macros-button"
            type="button"
            onClick={() => onOpenSopModal('macros')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-md transition-colors shadow-xs"
            title="Open SOP Suggested Macros Library (§17)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>SOP Macros (§17)</span>
          </button>

          <button
            id="sop-handbook-button"
            type="button"
            onClick={() => onOpenSopModal('rules')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-md transition-colors shadow-xs"
            title="Open SOP Customer Service Manual"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-600" />
            <span>SOP Rules (§1–§19)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
