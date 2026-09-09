import React from 'react';
import { Send, RotateCcw, Sparkles, User, Hash, Tag, Calendar, PackageCheck, AlertCircle, Bookmark } from 'lucide-react';
import { TriageRequest, PresetCase } from '../types';
import { SOP_PRESETS } from '../data/sopKnowledge';
import { RefundCalculatorWidget } from './RefundCalculatorWidget';

interface CaseInputFormProps {
  formData: TriageRequest;
  onChange: (data: Partial<TriageRequest>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onReset: () => void;
}

export const CaseInputForm: React.FC<CaseInputFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isLoading,
  onReset
}) => {
  const handlePresetSelect = (preset: PresetCase) => {
    onChange({
      customerQuery: preset.customerQuery,
      customerName: preset.customerName,
      orderNumber: preset.orderNumber,
      orderAmount: preset.orderAmount,
      itemName: preset.itemName,
      deliveryDate: preset.deliveryDate,
      trackingStatus: preset.trackingStatus || '',
      currentStep: 'initial',
      orderFulfilmentStatus: preset.id === 'hannah-cancel' ? 'unfulfilled' : 'delivered'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
      {/* Presets Bar */}
      <div className="bg-stone-50/90 border-b border-stone-200 px-4 py-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
            <Bookmark className="w-3.5 h-3.5 text-rose-700" />
            <span>Load Real Customer Inquiry Scenario:</span>
          </div>
          <span className="text-[11px] text-stone-400">Click to autofill case</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {SOP_PRESETS.map((preset) => (
            <button
              key={preset.id}
              id={`preset-${preset.id}`}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-rose-50/60 text-stone-700 hover:text-rose-900 border border-stone-200 hover:border-rose-300 transition-all shrink-0 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span className="font-semibold">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Customer Email Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="customer-query-input" className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Customer Message / Email Text <span className="text-rose-600">*</span>
            </label>
            <span className="text-xs text-stone-400">
              {formData.customerQuery.length} chars
            </span>
          </div>
          <textarea
            id="customer-query-input"
            rows={5}
            value={formData.customerQuery}
            onChange={(e) => onChange({ customerQuery: e.target.value })}
            placeholder="Paste customer's email, message, or screenshot text here... (e.g. 'Hi, I received my Riviera set yesterday and while I love the color, the top is far too tight around my chest...')"
            className="w-full text-sm text-stone-900 bg-stone-50/50 hover:bg-white focus:bg-white border border-stone-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200/50 rounded-lg p-3 transition-colors outline-hidden resize-y font-sans leading-relaxed"
          />
        </div>

        {/* Structured Context Fields */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Customer Name */}
          <div>
            <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-stone-400" />
              Customer Name
            </label>
            <input
              id="customer-name-input"
              type="text"
              value={formData.customerName || ''}
              onChange={(e) => onChange({ customerName: e.target.value })}
              placeholder="e.g. Sarah"
              className="w-full text-xs text-stone-900 bg-stone-50/40 border border-stone-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-300 rounded-md p-2 outline-hidden"
            />
          </div>

          {/* Order # */}
          <div>
            <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Hash className="w-3 h-3 text-stone-400" />
              Order Number
            </label>
            <input
              id="order-number-input"
              type="text"
              value={formData.orderNumber || ''}
              onChange={(e) => onChange({ orderNumber: e.target.value })}
              placeholder="e.g. #4821"
              className="w-full text-xs text-stone-900 bg-stone-50/40 border border-stone-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-300 rounded-md p-2 outline-hidden"
            />
          </div>

          {/* Amount (£) */}
          <div>
            <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="font-bold text-rose-700">£</span>
              Order Value (GBP)
            </label>
            <input
              id="order-amount-input"
              type="text"
              value={formData.orderAmount || ''}
              onChange={(e) => onChange({ orderAmount: e.target.value })}
              placeholder="39.95"
              className="w-full text-xs text-stone-900 bg-stone-50/40 border border-stone-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-300 rounded-md p-2 outline-hidden font-medium"
            />
          </div>

          {/* Item Name */}
          <div>
            <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-stone-400" />
              Item / Garment
            </label>
            <input
              id="item-name-input"
              type="text"
              value={formData.itemName || ''}
              onChange={(e) => onChange({ itemName: e.target.value })}
              placeholder="e.g. Riviera Set"
              className="w-full text-xs text-stone-900 bg-stone-50/40 border border-stone-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-300 rounded-md p-2 outline-hidden"
            />
          </div>
        </div>

        {/* Secondary Context & Order State */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-stone-400" />
              Delivery / Timeline
            </label>
            <input
              id="delivery-date-input"
              type="text"
              value={formData.deliveryDate || ''}
              onChange={(e) => onChange({ deliveryDate: e.target.value })}
              placeholder="e.g. Delivered 5 days ago"
              className="w-full text-xs text-stone-900 bg-stone-50/40 border border-stone-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-300 rounded-md p-2 outline-hidden"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <PackageCheck className="w-3 h-3 text-stone-400" />
              Shopify Fulfillment Status
            </label>
            <select
              id="fulfillment-status-select"
              value={formData.orderFulfilmentStatus || 'delivered'}
              onChange={(e) => onChange({ orderFulfilmentStatus: e.target.value as any })}
              className="w-full text-xs text-stone-900 bg-stone-50/40 border border-stone-300 focus:border-rose-500 rounded-md p-2 outline-hidden"
            >
              <option value="delivered">Delivered (Within 30 days)</option>
              <option value="fulfilled">Fulfilled / Shipped (In Transit)</option>
              <option value="partially_fulfilled">Partially Fulfilled</option>
              <option value="unfulfilled">Unfulfilled (Not Yet Shipped)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-stone-400" />
              Return / Exchange Funnel Stage
            </label>
            <select
              id="funnel-step-select"
              value={formData.currentStep || 'initial'}
              onChange={(e) => onChange({ currentStep: e.target.value as any })}
              className="w-full text-xs text-stone-900 bg-stone-50/40 border border-stone-300 focus:border-rose-500 rounded-md p-2 outline-hidden"
            >
              <option value="initial">Step 1: First Inquiry (Offer 30%)</option>
              <option value="declined_30">Step 2: Declined 30% (Offer 50%)</option>
              <option value="declined_50">Step 3: Declined 50% (Offer 70%)</option>
              <option value="declined_70">Step 4: Declined 70% (Return Address)</option>
            </select>
          </div>
        </div>

        {/* Live Math Preview Widget */}
        <RefundCalculatorWidget
          amount={formData.orderAmount || '39.95'}
          onAmountChange={(amt) => onChange({ orderAmount: amt })}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            id="reset-form-button"
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Form</span>
          </button>

          <button
            id="run-triage-button"
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !formData.customerQuery.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-800 hover:bg-rose-900 disabled:bg-stone-300 text-white font-medium text-sm rounded-lg transition-all shadow-sm hover:shadow active:scale-98 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Analyzing Ticket & Formulating Drafts...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-rose-200" />
                <span>Generate Co-Pilot Triage & Drafts</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
