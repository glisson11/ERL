import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  Mail, 
  Heart, 
  Tag, 
  Percent, 
  Clock, 
  Download,
  CheckCircle2,
  CornerDownRight,
  Sparkles,
  BookOpen,
  Eye,
  Code
} from 'lucide-react';
import { TriageResult, SopMacro } from '../types';
import { SOP_MACROS } from '../data/sopKnowledge';

interface TriageOutputViewProps {
  result: TriageResult;
}

export const TriageOutputView: React.FC<TriageOutputViewProps> = ({ result }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  // Find currently suggested macro code (e.g. 'R1', 'E1', 'CB1', etc.)
  const matchedMacroCode = result.draftA.templateCode?.toUpperCase() || 
    result.triage.suggestedMacro?.match(/\b(C1|C2|C3|W1|F1|R1|R2|R3|R4|E1|CB1)\b/i)?.[1]?.toUpperCase() || 
    'R1';

  const [activeMacroCode, setActiveMacroCode] = useState<string>(matchedMacroCode);
  const [viewRawTemplate, setViewRawTemplate] = useState<boolean>(false);
  const [showMacroLibrary, setShowMacroLibrary] = useState<boolean>(false);

  const copyToClipboard = async (text: string, sectionKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionKey);
      setTimeout(() => {
        setCopiedSection(null);
      }, 2200);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const getTriageFormattedText = () => {
    return `### 1. 📋 Internal Case Triage
- **Customer Issue**: ${result.triage.customerIssue}
- **SOP Category**: ${result.triage.sopCategory}
- **Suggested SOP Macro**: ${result.triage.suggestedMacro || 'Macro ' + matchedMacroCode}
- **Recommended Action**: ${result.triage.recommendedAction}
- **Calculated Refund Maths (if applicable)**: ${result.triage.calculatedRefundMaths}
- **Policy Overrides Applied**: ${result.triage.policyOverridesApplied}`;
  };

  const currentMacro = SOP_MACROS.find(m => m.code.toUpperCase() === activeMacroCode.toUpperCase()) || SOP_MACROS[0];
  const isCurrentlySuggested = activeMacroCode.toUpperCase() === matchedMacroCode.toUpperCase();

  // Content for Draft A: if they selected a different macro or toggled raw template
  const getDisplayDraftA = () => {
    if (viewRawTemplate) {
      return currentMacro.templateRaw;
    }
    if (isCurrentlySuggested) {
      return result.draftA.content;
    }
    // If they switched to another macro, render its raw or basic populated form
    return currentMacro.templateRaw;
  };

  const getFullMarkdown = () => {
    return `${getTriageFormattedText()}

--------------------------------------------------

### 2. ✉️ Draft A: Suggested SOP Macro (${result.triage.suggestedMacro || 'Macro ' + matchedMacroCode})
*This draft strictly mirrors the official templates from the customer service manual (§17), customized with the customer's name, order number, and refund calculations.*

${result.draftA.content}

--------------------------------------------------

### 3. ✉️ Draft B: Brand-Aligned Tailored Draft
*This draft covers the exact same policy resolution but uses our boutique brand voice. It acknowledges her situation with care, mentions our mother-daughter boutique philosophy where appropriate, and addresses sizing or delivery anxiety warmly to make her feel completely at ease.*

${result.draftB.content}

--------------------------------------------------

### 4. ✍️ Help Scout Documentation Note
*Standard internal note to be saved in Help Scout:*
${result.helpScoutNote.rawNote}`;
  };

  const isEscalation = result.triage.riskLevel === 'escalation';

  return (
    <div className="space-y-6">
      {/* Master Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900 text-stone-100 px-4 sm:px-5 py-3 rounded-xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
              <span>Triage & Response Suite Generated</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {result.triage.suggestedMacro?.split('—')[0]?.trim() || `Macro ${matchedMacroCode}`}
              </span>
            </h2>
            <p className="text-[11px] text-stone-400">
              SOP §17 verified • Suggested macro applied • Double-drafting complete
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            id="copy-all-button"
            type="button"
            onClick={() => copyToClipboard(getFullMarkdown(), 'all')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 transition-colors shadow-2xs"
          >
            {copiedSection === 'all' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">All 4 Sections Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-300" />
                <span>Copy Entire Suite</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Escalation Alert if applicable */}
      {isEscalation && (
        <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-lg flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-amber-900 text-sm">
              🚨 SOP §14 / §15 Escalation Triggered: Chargeback / Dispute Mentioned
            </div>
            <div className="text-amber-800 mt-1">
              Do not use standard offer funnels. De-escalate immediately using Macro CB1 below and escalate the ticket link to <strong>Sam (Base Works)</strong> or <strong>Nijs (NRK Business)</strong> within 24 hours.
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: INTERNAL CASE TRIAGE */}
      <div id="section-1-triage" className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="bg-stone-50/90 border-b border-stone-200 px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <div>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                1. Internal Case Triage
              </h3>
              <p className="text-[11px] text-stone-500">
                Categorisation, suggested SOP macro & calculated refund breakdown
              </p>
            </div>
          </div>

          <button
            id="copy-triage-button"
            type="button"
            onClick={() => copyToClipboard(getTriageFormattedText(), 'triage')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 transition-colors shadow-2xs"
          >
            {copiedSection === 'triage' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied Triage</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copy Triage</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm text-stone-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-1">
            <div className="bg-stone-50/60 p-3 rounded-lg border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                SOP Category
              </span>
              <div className="font-serif font-bold text-stone-900 text-sm sm:text-base flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-xs font-sans font-medium bg-rose-100 text-rose-800 border border-rose-200">
                  {result.triage.sopCategory}
                </span>
              </div>
            </div>

            <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Suggested SOP Macro (§17)
              </span>
              <div className="font-sans font-semibold text-amber-950 text-xs sm:text-sm leading-snug">
                {result.triage.suggestedMacro || `Macro ${matchedMacroCode}`}
              </div>
            </div>

            <div className="bg-stone-50/60 p-3 rounded-lg border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                Customer Issue Summary
              </span>
              <p className="text-stone-800 font-medium text-xs leading-relaxed line-clamp-2">
                {result.triage.customerIssue}
              </p>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Recommended Action
            </span>
            <div className="bg-stone-50/80 p-3 rounded-lg border border-stone-200 text-stone-900 font-medium leading-relaxed">
              {result.triage.recommendedAction}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Calculated Refund Maths (GBP)
            </span>
            <div className="bg-rose-50/40 p-3 rounded-lg border border-rose-200/80 text-stone-900 font-mono text-xs leading-relaxed">
              {result.triage.calculatedRefundMaths}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Policy Overrides Applied (SOP §19)
            </span>
            <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200 text-emerald-950 text-xs leading-relaxed flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>{result.triage.policyOverridesApplied}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DIVIDER 1 */}
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-dashed border-stone-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-stone-100 px-3 py-1 text-[11px] font-medium text-stone-500 rounded-full border border-stone-200">
            Divider • Suggested SOP Macro below
          </span>
        </div>
      </div>

      {/* SECTION 2: DRAFT A: SUGGESTED SOP MACRO DRAFT */}
      <div id="section-2-draft-a" className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="bg-stone-50/90 border-b border-stone-200 px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">✉️</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                  2. Draft A: Suggested SOP Macro Draft
                </h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 rounded-md">
                  {currentMacro.code} — {currentMacro.name}
                </span>
                {isCurrentlySuggested && (
                  <span className="px-1.5 py-0.2 text-[10px] font-medium bg-emerald-100 text-emerald-800 rounded">
                    Auto-Suggested
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {currentMacro.scenario} ({currentMacro.section})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Toggle: Populated vs Raw */}
            <button
              type="button"
              onClick={() => setViewRawTemplate(!viewRawTemplate)}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 transition-colors"
              title="Toggle between populated draft and raw SOP template with [Name]/#[X] placeholders"
            >
              {viewRawTemplate ? (
                <>
                  <Eye className="w-3 h-3 text-stone-500" />
                  <span>Show Populated</span>
                </>
              ) : (
                <>
                  <Code className="w-3 h-3 text-stone-500" />
                  <span>Show Raw Template</span>
                </>
              )}
            </button>

            <button
              id="copy-draft-a-button"
              type="button"
              onClick={() => copyToClipboard(getDisplayDraftA(), 'draftA')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-stone-800 hover:bg-stone-900 text-white transition-colors shadow-2xs"
            >
              {copiedSection === 'draftA' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Draft A!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Draft A</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SOP Macro Quick Switcher Bar */}
        <div className="bg-stone-100/70 border-b border-stone-200 px-4 sm:px-5 py-2 flex items-center justify-between gap-2 overflow-x-auto text-[11px]">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-semibold text-stone-600 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-stone-500" />
              SOP §17 Macros:
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 overflow-x-auto py-0.5">
            {SOP_MACROS.map((macro) => {
              const isSelected = activeMacroCode.toUpperCase() === macro.code.toUpperCase();
              const isSuggested = matchedMacroCode.toUpperCase() === macro.code.toUpperCase();

              return (
                <button
                  key={macro.code}
                  type="button"
                  onClick={() => {
                    setActiveMacroCode(macro.code);
                  }}
                  className={`px-2 py-1 rounded text-xs font-mono transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-stone-800 text-white font-bold shadow-xs'
                      : isSuggested
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold hover:bg-amber-200'
                        : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-200'
                  }`}
                  title={`${macro.code}: ${macro.name} (${macro.section})`}
                >
                  <span>{macro.code}</span>
                  {isSuggested && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  )}
                </button>
              );
            })}
          </div>

          {!isCurrentlySuggested && (
            <button
              type="button"
              onClick={() => setActiveMacroCode(matchedMacroCode)}
              className="shrink-0 text-[10px] font-semibold text-amber-800 hover:underline px-1.5 py-0.5 bg-amber-50 rounded border border-amber-200"
            >
              Reset to Suggested ({matchedMacroCode})
            </button>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <div className="bg-stone-50/40 rounded-lg border border-stone-200 p-4 font-sans text-xs sm:text-sm text-stone-900 whitespace-pre-wrap leading-relaxed">
            {getDisplayDraftA()}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-500">
            <span>
              {viewRawTemplate ? 'Raw manual macro template from SOP §17' : 'Personalised with customer query details & exact refund maths'}
            </span>
            <span className="font-mono text-[10px]">
              SOP Macro: {currentMacro.code} · {currentMacro.section}
            </span>
          </div>
        </div>
      </div>

      {/* DIVIDER 2 */}
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-dashed border-stone-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-800 rounded-full border border-rose-200">
            Divider • Brand-Aligned Tailored Draft below
          </span>
        </div>
      </div>

      {/* SECTION 3: DRAFT B: BRAND-ALIGNED TAILORED DRAFT */}
      <div id="section-3-draft-b" className="bg-white rounded-xl border border-rose-200 shadow-xs overflow-hidden ring-1 ring-rose-100">
        <div className="bg-rose-50/80 border-b border-rose-200 px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">✉️</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-rose-950 uppercase tracking-wide">
                  3. Draft B: Brand-Aligned Tailored Draft
                </h3>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-200/80 text-rose-900 rounded">
                  Recommended Voice
                </span>
              </div>
              <p className="text-[11px] text-rose-800/80">
                Warm, deeply empathetic boutique voice acknowledging occasion & sizing anxiety
              </p>
            </div>
          </div>

          <button
            id="copy-draft-b-button"
            type="button"
            onClick={() => copyToClipboard(result.draftB.content, 'draftB')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-rose-800 hover:bg-rose-900 text-white transition-colors shadow-2xs"
          >
            {copiedSection === 'draftB' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copied Draft B!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Draft B</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <div className="bg-white rounded-lg border border-rose-100 p-4 font-sans text-xs sm:text-sm text-stone-900 whitespace-pre-wrap leading-relaxed shadow-inner-xs">
            {result.draftB.content}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
            <span className="flex items-center gap-1 text-rose-800 font-medium">
              <Heart className="w-3 h-3 text-rose-600 fill-rose-600" />
              Sign-off verified: "Warm wishes, Emma / Emma & Rose London team"
            </span>
            <span>Target: UK 35+ Women</span>
          </div>
        </div>
      </div>

      {/* DIVIDER 3 */}
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-dashed border-stone-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-stone-100 px-3 py-1 text-[11px] font-medium text-stone-500 rounded-full border border-stone-200">
            Divider • Help Scout Documentation Note below
          </span>
        </div>
      </div>

      {/* SECTION 4: HELP SCOUT DOCUMENTATION NOTE */}
      <div id="section-4-help-scout" className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="bg-stone-50/90 border-b border-stone-200 px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">✍️</span>
            <div>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                4. Help Scout Documentation Note
              </h3>
              <p className="text-[11px] text-stone-500">
                Internal record ready for ticket sidebar paste
              </p>
            </div>
          </div>

          <button
            id="copy-helpscout-button"
            type="button"
            onClick={() => copyToClipboard(result.helpScoutNote.rawNote, 'helpscout')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-stone-800 hover:bg-stone-900 text-white transition-colors shadow-2xs"
          >
            {copiedSection === 'helpscout' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied Note!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Help Scout Note</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          <pre className="bg-stone-900 text-emerald-300 p-3.5 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner">
            {result.helpScoutNote.rawNote}
          </pre>

          {/* Tags Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-stone-500 font-medium mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Applied Tags:
            </span>
            {result.helpScoutNote.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-800 border border-stone-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

