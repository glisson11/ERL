import React, { useState } from 'react';
import { X, BookOpen, Search, ShieldCheck, AlertOctagon, Mail, CheckCircle2, Copy, Check, Sparkles, FileText } from 'lucide-react';
import { SOP_RULES_DOCUMENTATION, SOP_MACROS } from '../data/sopKnowledge';

interface SopReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'rules' | 'macros';
}

export const SopReferenceModal: React.FC<SopReferenceModalProps> = ({ isOpen, onClose, defaultTab = 'rules' }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'macros'>(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedMacroCode, setCopiedMacroCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyMacro = async (text: string, code: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMacroCode(code);
      setTimeout(() => setCopiedMacroCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const filteredRules = SOP_RULES_DOCUMENTATION.filter(
    (rule) =>
      rule.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMacros = SOP_MACROS.filter(
    (m) =>
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.scenario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[88vh] flex flex-col border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-rose-800" />
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900">
                Emma & Rose London — Customer Service SOP Manual v1.0
              </h2>
              <p className="text-xs text-stone-500">
                Escalation contacts: Sam (Base Works) / Nijs (NRK Business) • Inbox: info@emmaroselondon.com
              </p>
            </div>
          </div>
          <button
            id="close-sop-modal"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-100/60 px-5 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'border-rose-700 text-rose-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SOP Rules & Policies ({SOP_RULES_DOCUMENTATION.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('macros')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'macros'
                ? 'border-rose-700 text-rose-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Suggested Macros Library — SOP §17 ({SOP_MACROS.length})</span>
          </button>
        </div>

        {/* Search & Highlights */}
        <div className="p-4 border-b border-stone-200 bg-white space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === 'rules'
                  ? "Search SOP rules (e.g. 'cancellation', '30-day', 'reorder', 'chargeback')..."
                  : "Search macros (e.g. 'R1', 'E1', 'W1', 'cancellation', '50% refund')..."
              }
              className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg outline-hidden focus:border-rose-500 focus:bg-white"
            />
          </div>

          {activeTab === 'rules' && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-950">
              <div className="font-bold flex items-center gap-1.5 text-rose-900 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-700" />
                <span>SOP §19 Policy Overrides — Golden Rules</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] list-disc list-inside text-rose-900/90">
                <li>Strict 30 days from delivery return window (never 15)</li>
                <li>NEVER charge or mention the £20/€20 restocking fee</li>
                <li>Sale & discounted items ARE eligible for refunds</li>
                <li>Never mention customs duties or Asia shipping details</li>
              </ul>
            </div>
          )}

          {activeTab === 'macros' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-950 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>All 11 standardized macros from SOP §17 ready for 1-click clipboard copy.</span>
              </div>
              <span className="font-mono text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                11 SOP Templates
              </span>
            </div>
          )}
        </div>

        {/* Content List */}
        <div className="p-4 overflow-y-auto space-y-4">
          {activeTab === 'rules' ? (
            <div className="space-y-3 divide-y divide-stone-100">
              {filteredRules.map((rule, idx) => (
                <div key={idx} className="pt-3 first:pt-0">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                    {rule.section}
                  </h3>
                  <p className="text-xs text-stone-700 leading-relaxed font-sans pl-2.5">
                    {rule.summary}
                  </p>
                </div>
              ))}

              {filteredRules.length === 0 && (
                <div className="py-8 text-center text-xs text-stone-400">
                  No matching SOP sections found for "{searchTerm}".
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMacros.map((macro) => (
                <div 
                  key={macro.code} 
                  className="bg-stone-50/70 border border-stone-200 rounded-lg p-3.5 space-y-2 hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs bg-stone-800 text-white px-2 py-0.5 rounded">
                          Macro {macro.code}
                        </span>
                        <h4 className="text-xs font-bold text-stone-900">
                          {macro.name}
                        </h4>
                        <span className="text-[10px] text-stone-500 font-mono bg-stone-200/70 px-1.5 py-0.2 rounded">
                          {macro.section}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-1">
                        <strong>Scenario:</strong> {macro.scenario}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyMacro(macro.templateRaw, macro.code)}
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 transition-colors shadow-2xs"
                    >
                      {copiedMacroCode === macro.code ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold text-[11px]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-stone-500" />
                          <span className="text-[11px]">Copy Template</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="bg-white border border-stone-200 rounded p-2.5 text-[11px] font-sans text-stone-800 whitespace-pre-wrap leading-relaxed shadow-2xs">
                    {macro.templateRaw}
                  </pre>
                </div>
              ))}

              {filteredMacros.length === 0 && (
                <div className="py-8 text-center text-xs text-stone-400">
                  No matching SOP macros found for "{searchTerm}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Sign-off: "Warm wishes, Emma • Emma & Rose London team"</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-stone-800 text-white rounded hover:bg-stone-900 transition-colors"
          >
            Close Handbook
          </button>
        </div>
      </div>
    </div>
  );
};

