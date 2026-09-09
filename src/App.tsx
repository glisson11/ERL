/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CaseInputForm } from './components/CaseInputForm';
import { TriageOutputView } from './components/TriageOutputView';
import { SopReferenceModal } from './components/SopReferenceModal';
import { TriageRequest, TriageResult } from './types';
import { SOP_PRESETS } from './data/sopKnowledge';
import { generateDeterministicTriage } from './utils/triageEngine';
import { 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  CheckCircle, 
  History, 
  AlertCircle,
  Heart,
  ChevronDown
} from 'lucide-react';

const INITIAL_REQUEST: TriageRequest = {
  customerQuery: "Hi, I received my Riviera set yesterday and while I love the color, the top is far too tight around my chest. Can I send this back or get a bigger size? I have a family lunch this Sunday and was really hoping to wear it.",
  customerName: "Sarah",
  orderNumber: "#4821",
  orderAmount: "39.95",
  itemName: "Riviera Coordinated Set",
  deliveryDate: "5 days ago",
  trackingStatus: "Delivered",
  currentStep: "initial",
  orderFulfilmentStatus: "delivered"
};

export default function App() {
  const [formData, setFormData] = useState<TriageRequest>(INITIAL_REQUEST);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSopModalOpen, setIsSopModalOpen] = useState<boolean>(false);
  const [sopModalTab, setSopModalTab] = useState<'rules' | 'macros'>('rules');
  const [history, setHistory] = useState<TriageResult[]>([]);

  const handleOpenSopModal = (tab: 'rules' | 'macros' = 'rules') => {
    setSopModalTab(tab);
    setIsSopModalOpen(true);
  };

  // Initialize with deterministic triage on first load
  useEffect(() => {
    const initialTriage = generateDeterministicTriage(INITIAL_REQUEST);
    setResult(initialTriage);
    setHistory([initialTriage]);
  }, []);

  const handleFormChange = (updates: Partial<TriageRequest>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleReset = () => {
    setFormData({
      customerQuery: '',
      customerName: '',
      orderNumber: '',
      orderAmount: '39.95',
      itemName: '',
      deliveryDate: '',
      trackingStatus: '',
      currentStep: 'initial',
      orderFulfilmentStatus: 'delivered'
    });
    setError(null);
  };

  const handleRunTriage = async () => {
    if (!formData.customerQuery.trim()) {
      setError('Please paste or type the customer message first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      const triageResult: TriageResult = {
        triage: data.triage,
        draftA: data.draftA,
        draftB: data.draftB,
        helpScoutNote: data.helpScoutNote,
        fullRawText: data.fullRawText || '',
        timestamp: data.timestamp || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      };

      setResult(triageResult);
      setHistory((prev) => [triageResult, ...prev.slice(0, 5)]);

      // Smooth scroll to output on mobile
      setTimeout(() => {
        const outputElem = document.getElementById('triage-output-container');
        if (outputElem && window.innerWidth < 1024) {
          outputElem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      console.warn('Backend API request issue, generating immediate local verified triage:', err);
      // Seamlessly fall back to client-side deterministic verified SOP engine
      const localResult = generateDeterministicTriage(formData);
      setResult(localResult);
      setHistory((prev) => [localResult, ...prev.slice(0, 5)]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Top Header */}
      <Header onOpenSopModal={handleOpenSopModal} />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Intro Notification Banner */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 shrink-0 mt-0.5">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 font-serif">
                Emma's Customer Care Desk • Emma & Rose London
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
                Triage incoming customer tickets, calculate exact GBP refunds (30% / 50% / 70% keep-it & exchange reorder formulas), and generate both the official SOP template and our warm, mother-daughter boutique reply.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              id="guidelines-quick-btn"
              onClick={() => setIsSopModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-300 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-stone-500" />
              <span>View SOP §19 Overrides</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Inquiry Input & Context Form (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <span>1. Ticket Details & Context</span>
              </h2>
              <span className="text-[11px] text-stone-400">UK Market / GBP (£)</span>
            </div>

            <CaseInputForm
              formData={formData}
              onChange={handleFormChange}
              onSubmit={handleRunTriage}
              isLoading={isLoading}
              onReset={handleReset}
            />

            {/* Quick Policy Reminder Card */}
            <div className="bg-stone-50/80 rounded-xl border border-stone-200 p-3.5 text-xs text-stone-600 space-y-2">
              <div className="font-semibold text-stone-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Golden Rules & Overrides Quick Checklist</span>
              </div>
              <ul className="space-y-1 text-[11px] text-stone-600 pl-1">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <strong>30-day window:</strong> Always enforce from delivery date (never 15).
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <strong>Restocking fee:</strong> Never charge or mention £20 fee.
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <strong>Sale items:</strong> Eligible for refund under this SOP.
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <strong>Exchange formula:</strong> Original - 70% refund = 30% net cost to keep both.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Structured Output View with Dividers (7 Cols) */}
          <div id="triage-output-container" className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <span>2. Generated Output & Drafts</span>
              </h2>
              {result && (
                <span className="text-[11px] text-stone-500">
                  Last updated at {result.timestamp}
                </span>
              )}
            </div>

            {result ? (
              <TriageOutputView result={result} />
            ) : (
              <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-400 space-y-3">
                <Sparkles className="w-8 h-8 mx-auto text-stone-300" />
                <p className="text-sm font-medium text-stone-600">
                  No ticket triage generated yet.
                </p>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Paste a customer inquiry on the left or choose a preset scenario to generate triage, drafts, and documentation notes.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Emma & Rose London Customer Care AI Co-Pilot • SOP Version 1.0</span>
          <span>Contact: info@emmaroselondon.com • Sam (Base Works) / Nijs (NRK Business)</span>
        </div>
      </footer>

      {/* SOP Reference Modal */}
      <SopReferenceModal
        isOpen={isSopModalOpen}
        defaultTab={sopModalTab}
        onClose={() => setIsSopModalOpen(false)}
      />
    </div>
  );
}
