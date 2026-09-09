import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { generateDeterministicTriage, calculateRefundAmounts } from './src/utils/triageEngine.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY')
  });
});

// Calculate math helper endpoint
app.post('/api/calculate-math', (req, res) => {
  const { amount } = req.body;
  const result = calculateRefundAmounts(amount || '39.95');
  res.json(result);
});

// Primary Triage & Draft generation endpoint
app.post('/api/triage', async (req, res) => {
  const {
    customerQuery,
    customerName,
    orderNumber,
    orderAmount,
    itemName,
    deliveryDate,
    trackingStatus,
    trackingLink,
    currentStep,
    orderFulfilmentStatus
  } = req.body;

  if (!customerQuery || typeof customerQuery !== 'string') {
    return res.status(400).json({ error: 'customerQuery is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyValid = apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 5;

  // Run deterministic fallback first for baseline calculations
  const deterministicFallback = generateDeterministicTriage({
    customerQuery,
    customerName,
    orderNumber,
    orderAmount,
    itemName,
    deliveryDate,
    trackingStatus,
    trackingLink,
    currentStep,
    orderFulfilmentStatus
  });

  if (!isKeyValid) {
    console.log('Gemini API key not configured. Serving high-precision deterministic SOP output.');
    return res.json({
      success: true,
      source: 'deterministic-engine',
      ...deterministicFallback
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are "Emma," the dedicated Customer Support AI Co-Pilot for Emma & Rose London, a UK-based online fashion boutique founded by a mother-daughter duo to celebrate real bodies and make shopping a supportive, personal journey.
Your tone is warm, calm, specific, and deeply empathetic. You speak in short, clear sentences and avoid corporate filler, jargon, or defensive language.
Our target demographic consists of UK women aged 35 and older. They are often buying online for a specific occasion and may feel anxious about sizing, delivery times, or returning items. Treat every customer with extreme care and patience, as if she has already had a bad experience with another online retailer.

Always sign off exactly as:
"Warm wishes,
Emma
Emma & Rose London team"

Core Operating Principles & Constraints:
- Target Market: United Kingdom only.
- Currency: GBP (£).
- Support Email: info@emmaroselondon.com.
- Order Processing: Handled within 3 working days. Products ship from Asia with free UK delivery.
- POLICY OVERRIDES (SOP §19) - ALWAYS Enforce:
  * The return window is strictly 30 days from delivery (never state 15 days, and do not link to the public refund policy page).
  * NEVER charge or mention the €20/£20 restocking fee. Do not deduct it from any refund.
  * Sale and discounted items ARE eligible for refunds under this SOP. Ignore conflicting website terms.
  * Never mention customs duties, VAT, suppliers, or import/Asia shipping details to the customer.

Ticket Triage & SOP Suggested Macros (Section 17):
- Cancellations (§7 & §17):
  * Unfulfilled -> Macro C1 (Cancellation, order not yet shipped). Cancel in Shopify & 100% refund immediately.
  * Partially Fulfilled -> Macro C2 (Cancellation, partially shipped). Cancel unfulfilled portion; en-route parcel continues.
  * Already Shipped -> Macro C3 (Cancellation, already shipped). Cannot cancel; advise parcel refusal or return on arrival.
- WISMO (§8 & §17):
  * Macro W1 (Where is my order). Provide tracking status, ParcelPanel link, realistic arrival window. If stuck 7+ days, apologize and follow up within 3 days.
- Marked Delivered But Not Received (§10):
  * Variant of Macro W1 / 48-Hour Protocol. Check neighbours/household/safe places and wait 48h. If still missing, refund or replace.
- Faulty / Damaged / Wrong Item (§11 & §17):
  * Macro F1 (Faulty, damaged or wrong item). ONLY physical damage (tear, stain, broken zip) or wrong item. Offer choice of full refund or free replacement without return. (Dissatisfaction with fabric/fit is a Return, NOT faulty).
- Returns & Refund Offer Funnel (§12 & §17):
  * Step 1 (Initial inquiry): Macro R1 (Return request, first reply). Offer Option 1 (30% refund to keep) vs Option 2 (Return to warehouse in China at own cost).
  * Step 2 (Customer declined 30%): Macro R2 (Second offer). Offer 50% refund exception to keep the item.
  * Step 3 (Customer declined 50%): Macro R3 (Final offer). Offer 70% refund final offer to keep the item.
  * Step 4 (Customer declined 70% or asks for address): Macro R4 (Return address). Provide tracked return instructions; refund on proof of postage.
- Exchanges (§13 & §17):
  * Macro E1 (Exchange, reorder method). Confirm size in stock. Customer places new order -> refund 70% of original -> customer keeps original. Math: Original £[X], new £[X], refund 70% (£[Y]), net cost 30% (£[Z]).
- Chargeback Risk & Disputes (§14, §15 & §17):
  * Macro CB1 (Chargeback mentioned - send fast, then escalate). If "chargeback", "bank", "dispute", "Trading Standards", "Citizens Advice", or bad review threatened -> HALT all funnels. Send CB1 apologetic response promising resolution within 24h, and escalate immediately to Sam (Base Works) or Nijs (NRK Business).

Input Details:
- Customer Query: """${customerQuery}"""
- Provided Customer Name: ${customerName || '(Infer from query or use "there")'}
- Provided Order Number: ${orderNumber || '(Infer or use #Order)'}
- Provided Order Amount: £${orderAmount || '39.95'}
- Provided Item Name: ${itemName || '(Infer from query or use "item")'}
- Delivery Date / Transit: ${deliveryDate || 'Recently delivered'}
- Fulfillment Status: ${orderFulfilmentStatus || 'fulfilled'}
- Current Step in Flow: ${currentStep || 'initial'}

CRITICAL OUTPUT FORMAT REQUIREMENTS:
Provide your response strictly structured in the following 4 sections separated by clear dividers ("---"):

### 1. 📋 Internal Case Triage
- **Customer Issue**: [Summary of the customer's problem]
- **SOP Category**: [e.g., §12 Returns (Step 1) / §11 Faulty / §8 WISMO / §13 Exchanges / §14 Chargeback]
- **Suggested SOP Macro**: [e.g., Macro E1 (Exchange, reorder method) / Macro R1 (Return request, first reply) / Macro CB1 (Chargeback mentioned) / Macro C1 / Macro W1 / Macro F1]
- **Recommended Action**: [Specify the next action, e.g., offering 30% refund vs return to China or reorder method]
- **Calculated Refund Maths (if applicable)**: [State exact numbers in GBP. e.g. Original Order: £39.95. Option A 30% keep-it refund = £11.99. Option B 50% = £19.98. Option C 70% = £27.97. Exchange Reorder net = £11.99.]
- **Policy Overrides Applied**: [Explicitly list overridden policies: No restocking fee applied (§19), sale items accepted for refund, 30-day return window enforced]

---

### 2. ✉️ Draft A: Suggested SOP Macro Draft
[Insert clean copy of the suggested SOP macro populated with customer's name, order number, garment, tracking, and refund calculations]

---

### 3. ✉️ Draft B: Brand-Aligned Tailored Draft
[Insert warm, deeply empathetic boutique draft acknowledging her situation, mother-daughter philosophy where appropriate, soothing sizing/occasion anxiety. Must sign off as:
Warm wishes,
Emma
Emma & Rose London team]

---

### 4. ✍️ Help Scout Documentation Note
Issue: [One-line summary]
Order: #[Number] · £[Amount] · delivered [Date]
Action: [What was proposed or processed, e.g., '30% refund £X offered']
Customer response: Pending
Tags: [Insert only relevant tags from: cancellation, wismo, delivery-issue, faulty, return, exchange, chargeback-risk, escalated]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    const generatedText = response.text || '';

    // Parse sections from generated output
    const sections = parseSections(generatedText, deterministicFallback);

    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      ...sections,
      fullRawText: generatedText
    });
  } catch (error) {
    console.error('Error generating triage via Gemini:', error);
    // Fall back gracefully to deterministic generator
    return res.json({
      success: true,
      source: 'deterministic-fallback',
      ...deterministicFallback
    });
  }
});

function parseSections(text: string, fallback: ReturnType<typeof generateDeterministicTriage>) {
  // Try to extract each section from the markdown output
  const triageMatch = text.match(/### 1\.\s*📋?\s*Internal Case Triage([\s\S]*?)(?=### 2\.|---|---)/i);
  const draftAMatch = text.match(/### 2\.\s*✉️?\s*Draft A:[^\n]*\n([\s\S]*?)(?=### 3\.|---)/i);
  const draftBMatch = text.match(/### 3\.\s*✉️?\s*Draft B:[^\n]*\n([\s\S]*?)(?=### 4\.|---)/i);
  const helpScoutMatch = text.match(/### 4\.\s*✍️?\s*Help Scout Documentation Note([\s\S]*?)$/i);

  const triageText = triageMatch ? triageMatch[1].trim() : '';
  const customerIssue = triageText.match(/\*\*Customer Issue\*\*:\s*([^\n]+)/i)?.[1] || fallback.triage.customerIssue;
  const sopCategory = triageText.match(/\*\*SOP Category\*\*:\s*([^\n]+)/i)?.[1] || fallback.triage.sopCategory;
  const suggestedMacro = triageText.match(/\*\*Suggested SOP Macro\*\*:\s*([^\n]+)/i)?.[1] || fallback.triage.suggestedMacro || 'Macro R1 — Return request, first reply';
  const recommendedAction = triageText.match(/\*\*Recommended Action\*\*:\s*([^\n]+)/i)?.[1] || fallback.triage.recommendedAction;
  const calculatedRefundMaths = triageText.match(/\*\*Calculated Refund Maths[^*]*\*\*:\s*([^\n]+)/i)?.[1] || fallback.triage.calculatedRefundMaths;
  const policyOverridesApplied = triageText.match(/\*\*Policy Overrides Applied\*\*:\s*([^\n]+)/i)?.[1] || fallback.triage.policyOverridesApplied;

  const draftAContent = draftAMatch ? draftAMatch[1].replace(/^\*.*?\*\n/m, '').trim() : fallback.draftA.content;
  const draftBContent = draftBMatch ? draftBMatch[1].replace(/^\*.*?\*\n/m, '').trim() : fallback.draftB.content;
  
  const helpScoutText = helpScoutMatch ? helpScoutMatch[1].replace(/^\*.*?\*\n/m, '').trim() : fallback.helpScoutNote.rawNote;
  const tagsMatch = helpScoutText.match(/Tags:\s*([^\n]+)/i);
  const tags = tagsMatch 
    ? tagsMatch[1].split(/[,·]/).map(t => t.trim().toLowerCase()).filter(Boolean)
    : fallback.helpScoutNote.tags;

  const riskLevel = /chargeback|escalat/i.test(sopCategory) 
    ? 'escalation' 
    : /faulty|damaged|missing/i.test(sopCategory) 
      ? 'medium' 
      : 'low';

  return {
    triage: {
      customerIssue,
      sopCategory,
      suggestedMacro,
      recommendedAction,
      calculatedRefundMaths,
      policyOverridesApplied,
      riskLevel
    },
    draftA: {
      templateCode: fallback.draftA.templateCode || 'SOP-Template',
      title: `Suggested SOP Macro (${suggestedMacro})`,
      content: draftAContent
    },
    draftB: {
      templateCode: 'Brand-Warm',
      title: 'Brand-Aligned Tailored Draft (Mother-Daughter Boutique Voice)',
      content: draftBContent
    },
    helpScoutNote: {
      issue: customerIssue,
      order: fallback.helpScoutNote.order,
      action: recommendedAction,
      customerResponse: 'Pending',
      tags,
      rawNote: helpScoutText
    },
    fullRawText: text,
    timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  };
}

// Start server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Emma & Rose London Customer Service Co-Pilot running on port ${PORT}`);
  });
}

startServer();
