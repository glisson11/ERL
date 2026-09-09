import React from 'react';
import { Calculator, Percent, ArrowRight, Sparkles } from 'lucide-react';
import { calculateRefundAmounts } from '../utils/triageEngine';

interface RefundCalculatorWidgetProps {
  amount: string;
  onAmountChange?: (amount: string) => void;
  isCompact?: boolean;
}

export const RefundCalculatorWidget: React.FC<RefundCalculatorWidgetProps> = ({
  amount,
  onAmountChange,
  isCompact = false
}) => {
  const calculations = calculateRefundAmounts(amount || '39.95');

  return (
    <div className="bg-stone-50/80 rounded-lg border border-stone-200 p-3 sm:p-4 text-stone-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-700">
          <Calculator className="w-3.5 h-3.5 text-rose-700" />
          <span>SOP Refund Maths Engine</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone-500">
          <span>Order Base:</span>
          <span className="font-semibold text-stone-900">£{calculations.amount}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {/* 30% */}
        <div className="bg-white p-2 sm:p-2.5 rounded border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-0.5">
            <span className="font-medium text-stone-700">Option A</span>
            <span className="font-bold text-rose-700">30%</span>
          </div>
          <div className="text-base sm:text-lg font-serif font-bold text-stone-900">
            £{calculations.refund30}
          </div>
          <div className="text-[10px] text-stone-400 truncate">Step 1 Keep-It</div>
        </div>

        {/* 50% */}
        <div className="bg-white p-2 sm:p-2.5 rounded border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-0.5">
            <span className="font-medium text-stone-700">Step 2</span>
            <span className="font-bold text-amber-700">50%</span>
          </div>
          <div className="text-base sm:text-lg font-serif font-bold text-stone-900">
            £{calculations.refund50}
          </div>
          <div className="text-[10px] text-stone-400 truncate">Exception Offer</div>
        </div>

        {/* 70% */}
        <div className="bg-white p-2 sm:p-2.5 rounded border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-0.5">
            <span className="font-medium text-stone-700">Step 3</span>
            <span className="font-bold text-emerald-700">70%</span>
          </div>
          <div className="text-base sm:text-lg font-serif font-bold text-stone-900">
            £{calculations.refund70}
          </div>
          <div className="text-[10px] text-stone-400 truncate">Final Keep-It</div>
        </div>
      </div>

      {/* §13 Reorder Exchange Method Math */}
      <div className="bg-white rounded border border-rose-100 p-2.5 text-xs">
        <div className="flex items-center justify-between text-stone-600 font-medium mb-1">
          <span className="flex items-center gap-1 text-rose-800">
            <Percent className="w-3 h-3" />
            §13 Exchange Reorder Formula:
          </span>
          <span className="text-[11px] text-stone-500">Customer keeps both</span>
        </div>
        <div className="flex items-center flex-wrap gap-1.5 text-stone-700 bg-rose-50/50 p-2 rounded text-[11px]">
          <span>New Order: <strong className="text-stone-900">£{calculations.amount}</strong></span>
          <ArrowRight className="w-3 h-3 text-stone-400 inline" />
          <span>70% Refund: <strong className="text-emerald-700">£{calculations.refund70}</strong></span>
          <ArrowRight className="w-3 h-3 text-stone-400 inline" />
          <span>Net Out-of-Pocket: <strong className="text-rose-900 font-bold">£{calculations.netExchange30}</strong> (30%)</span>
        </div>
      </div>
    </div>
  );
};
