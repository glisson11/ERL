import { PresetCase, SopMacro } from '../types';

export const SOP_MACROS: SopMacro[] = [
  {
    id: 'C1',
    code: 'C1',
    name: 'Cancellation, order not yet shipped',
    section: '§7 & §17',
    scenario: 'Customer wants to cancel an order that is still unfulfilled in Shopify.',
    templateRaw: `Hi [Name],

Of course — I've cancelled order #[X] and refunded the full £[amount] to your original payment method just now. Depending on your bank it usually shows up within 3–5 working days.

Nothing else is needed from your side. If you'd ever like to order again, just let me know and I'll help you get the sizing right.

Warm wishes,
Emma · Emma & Rose London`,
    tags: ['cancellation']
  },
  {
    id: 'C2',
    code: 'C2',
    name: 'Cancellation, partially shipped',
    section: '§7 & §17',
    scenario: 'Part of the order has already dispatched, but other items are unfulfilled.',
    templateRaw: `Hi [Name],

I've cancelled the part of order #[X] that hadn't left our warehouse yet and refunded £[amount] to your original payment method — that should reach you within 3–5 working days.

The [item] had already been dispatched, so I can't stop that one. Here's the tracking: [link]. If you'd still rather not keep it once it arrives, just reply to this email and I'll sort it out for you.

Warm wishes,
Emma · Emma & Rose London`,
    tags: ['cancellation']
  },
  {
    id: 'C3',
    code: 'C3',
    name: 'Cancellation, already shipped',
    section: '§7 & §17',
    scenario: 'Customer requests cancellation after package has already left the warehouse.',
    templateRaw: `Hi [Name],

I'm sorry — order #[X] was dispatched on [date], so I'm no longer able to stop it. Here's your tracking: [link].

You have two options. You can refuse the parcel when it's delivered, and it'll come back to us and I'll refund you in full. Or accept it, and if it's not right once you've seen it, reply to this email and I'll take care of it straight away.

Sorry for the timing on this one.

Warm wishes,
Emma · Emma & Rose London`,
    tags: ['cancellation']
  },
  {
    id: 'W1',
    code: 'W1',
    name: 'Where is my order (WISMO)',
    section: '§8 & §17',
    scenario: 'Customer asking for shipment tracking status, delivery timeline, or parcel delay updates.',
    templateRaw: `Hi [Name],

Thanks for checking in. I've just looked at order #[X] — it's currently [status] and the latest update was [date, location].

You can follow it here: [tracking link]. Based on where it is now, I'd expect it with you around [realistic window].

If it hasn't moved by [date], reply to this email and I'll chase it up personally.

Warm wishes,
Emma · Emma & Rose London`,
    tags: ['wismo']
  },
  {
    id: 'F1',
    code: 'F1',
    name: 'Faulty, damaged or wrong item',
    section: '§11 & §17',
    scenario: 'Physical defect (tear, stain, broken zip, hole) or incorrect garment received.',
    templateRaw: `Hi [Name],

I'm really sorry — that's not what should have arrived, and thank you for sending the photos.

I can sort this two ways, whichever suits you better:

A full refund of £[amount] back to your original payment method, or a replacement sent out to you at no cost.

Either way, please don't worry about sending anything back to us — keep the item.

Just let me know which you'd prefer and I'll do it today.

Warm wishes,
Emma · Emma & Rose London`,
    tags: ['faulty']
  },
  {
    id: 'R1',
    code: 'R1',
    name: 'Return request, first reply (30% Keep-It)',
    section: '§12 Step 1 & §17',
    scenario: 'First return inquiry for fit, style, changed mind, or general dissatisfaction.',
    templateRaw: `Hi [Name],

Thanks for letting me know, and I'm sorry the [item] wasn't right for you. You can absolutely return it — but before you go to the trouble, let me give you both options so you can pick what suits you.

Option 1 — keep it and take a refund. I can refund you 30% (£[amount]) today. Nothing to pack, nothing to post, and the money is back with you in a few days. You can pass the piece on to someone or keep it as a spare.

Option 2 — send it back for a full refund. I'll send you the return address. I should be honest with you: our returns go to our supplier's warehouse in China, the postage is at your own cost, and it usually takes a few weeks to get there.

Both are completely fine by me — just tell me which you'd prefer and I'll get it moving.

Warm wishes,
Emma · Emma & Rose London`,
    tags: ['return']
  },
  {
    id: 'R2',
    code: 'R2',
    name: 'Second offer (50% Refund Exception)',
    section: '§12 Step 2 & §17',
    scenario: 'Customer rejected 30% keep-it offer and still asks to return.',
    templateRaw: `Hi [Name],

Thanks for coming back to me. I've had another look at your order and asked internally whether I can do better for you.

I can offer you 50% back — £[amount] — and you keep the [item]. That's above what we'd normally do, but given the situation I'd rather you got something good out of this than spent money on international postage.

If you'd still prefer to return it, that's absolutely your call and I'll send the address straight over. Just say the word.

Warm wishes,
Emma · Emma & Rose London`,
    tags: ['return']
  },
  {
    id: 'R3',
    code: 'R3',
    name: 'Final offer (70% Refund Final Offer)',
    section: '§12 Step 3 & §17',
    scenario: 'Customer rejected 50% offer and persists on returning.',
    templateRaw: `Hi [Name],

I understand. Let me make you one last offer, and then I'll do whatever you decide.

I can refund you 70% — £[amount] — and you keep the [item]. That's the most I'm able to offer without a return.

If you'd rather send it back for the full amount, just reply "return" and I'll send you the address and details right away. No hard feelings either way.

Warm wishes,
Emma · Emma & Rose London`,
    tags: ['return']
  },
  {
    id: 'R4',
    code: 'R4',
    name: 'Return address (Confirmed with Sam/Nijs)',
    section: '§12 Step 4 & §17',
    scenario: 'Customer declined 70% or explicitly replies "return". Provide address and instructions.',
    templateRaw: `Hi [Name],

No problem at all — here are the details for your return:

[RETURN ADDRESS — confirm current address with Sam/Nijs before sending]

A few things worth knowing:
- Please use a tracked service and send me the tracking number
- Return postage is at your own cost
- As soon as you send me proof of postage, I'll start your refund — you won't have to wait for the parcel to arrive

Thanks for your patience with this, and sorry again that it wasn't right.

Warm wishes,
Emma · Emma & Rose London`,
    tags: ['return']
  },
  {
    id: 'E1',
    code: 'E1',
    name: 'Exchange, reorder method',
    section: '§13 & §17',
    scenario: 'Customer wants a different size or colour. Customer reorders, gets 70% refund on original.',
    templateRaw: `Hi [Name],

Good news — the [size/colour] of the [item] is in stock.

Here's the simplest way to get it to you, and I want to be completely clear about how it works so there are no surprises:

1. You place a new order on the site for the [size/colour]: [product link]
2. As soon as it comes through, I refund 70% of your original order — £[amount]
3. You keep the original item, nothing to send back

So in real numbers: your new order is £[X], I refund £[Y], which leaves you about £[Z] out of pocket — and you'll have both pieces.

If you'd rather not place a second order, that's completely fine. I can still refund you 30% and you keep what you have, or you can return it for a full refund. Just tell me which works best.

Warm wishes,
Emma · Emma & Rose London`,
    tags: ['exchange', 'return']
  },
  {
    id: 'CB1',
    code: 'CB1',
    name: 'Chargeback mentioned (Send fast, then escalate)',
    section: '§14, §15 & §17',
    scenario: 'Customer threatens chargeback, bank dispute, Trading Standards, or bad reviews. Halt funnels.',
    templateRaw: `Hi [Name],

I'm sorry this has got to this point — that's on us, not on you.

I'm taking this over personally now. Give me until tomorrow morning (within 24 hours) and I'll come back to you with this fully sorted.

You don't need to do anything in the meantime, and thank you for giving me the chance to put it right.

Warm wishes,
Emma · Emma & Rose London`,
    tags: ['chargeback-risk', 'escalated']
  }
];

export const SOP_PRESETS: PresetCase[] = [
  {
    id: 'sarah-exchange',
    name: 'Sarah (Exchange / Tight Sizing)',
    title: 'Riviera Coordinated Set (£39.95) - Sizing Too Small',
    category: '§13 Exchanges (Step 1)',
    customerName: 'Sarah',
    orderNumber: '#4821',
    orderAmount: '39.95',
    itemName: 'Riviera Coordinated Set',
    deliveryDate: '5 days ago',
    customerQuery: "Hi, I received my Riviera set yesterday and while I love the color, the top is far too tight around my chest. Can I send this back or get a bigger size? I have a family lunch this Sunday and was really hoping to wear it."
  },
  {
    id: 'linda-return',
    name: 'Linda (Return / Style Dissatisfaction)',
    title: 'Florence Floral Midi Dress (£48.00) - Does Not Suit',
    category: '§12 Returns (Step 1)',
    customerName: 'Linda',
    orderNumber: '#5102',
    orderAmount: '48.00',
    itemName: 'Florence Floral Midi Dress',
    deliveryDate: '8 days ago',
    customerQuery: "Hello, I received the Florence floral dress last week. Unfortunately the cut doesn't suit my shape at all and the colour is slightly paler than I pictured on the screen. How do I send this back for a full refund please?"
  },
  {
    id: 'margaret-wismo',
    name: 'Margaret (WISMO / Stuck in Transit)',
    title: 'Order #3984 (£62.50) - Tracking Stuck 8+ Days',
    category: '§8 WISMO (7+ Days Inactive)',
    customerName: 'Margaret',
    orderNumber: '#3984',
    orderAmount: '62.50',
    itemName: 'Linen Blend Tunic & Trousers',
    deliveryDate: 'Not yet delivered',
    trackingStatus: 'In transit - No update since 8 days ago (Heathrow Hub)',
    customerQuery: "Good morning Emma, I placed my order almost two weeks ago for my daughter's birthday party next Wednesday. The tracking has not moved from the sorting centre for over a week now. Where is my order? Can you please check?"
  },
  {
    id: 'claire-damaged',
    name: 'Claire (Faulty / Physical Damage)',
    title: 'Silk Touch Wrap Dress (£54.00) - Torn Seam & Broken Zip',
    category: '§11 Faulty / Damaged Item',
    customerName: 'Claire',
    orderNumber: '#4910',
    orderAmount: '54.00',
    itemName: 'Silk Touch Wrap Dress',
    deliveryDate: '2 days ago',
    customerQuery: "Dear Emma, I was so excited to unpack my dress today but when I unzipped it, the zipper teeth completely caught and tore the fabric along the side seam. The zipper is broken and there is a tear. I have attached 3 photos showing the torn seam and broken teeth. Please advise what to do."
  },
  {
    id: 'brenda-chargeback',
    name: 'Brenda (Chargeback Threat / Bank Escalation)',
    title: 'Order #4429 (£75.00) - Threatening Bank Dispute',
    category: '§14 & §15 Chargeback Risk (Urgent Escalation)',
    customerName: 'Brenda',
    orderNumber: '#4429',
    orderAmount: '75.00',
    itemName: 'Cashmere Feel Poncho & Wide Leg Pants',
    deliveryDate: '12 days ago',
    customerQuery: "I emailed you 3 days ago asking for a return label and have not received a reply. This is unacceptable. If I do not get my money back in full today I am going directly to my bank to initiate a chargeback dispute and reporting your shop to Citizens Advice and Trading Standards!"
  },
  {
    id: 'hannah-cancel',
    name: 'Hannah (Cancellation / Unfulfilled)',
    title: 'Order #5230 (£42.00) - Unfulfilled Immediate Cancellation',
    category: '§7 Cancellations (Unfulfilled)',
    customerName: 'Hannah',
    orderNumber: '#5230',
    orderAmount: '42.00',
    itemName: 'Cornflower Blue Broderie Blouse',
    deliveryDate: 'Ordered 1 day ago (Unfulfilled)',
    customerQuery: "Hi there, I placed order #5230 yesterday evening for the Cornflower blouse, but I have just realised my sister bought me the exact same one as a gift! Could you please cancel my order before it ships and refund me? Many thanks."
  }
];

export const SOP_RULES_DOCUMENTATION = [
  {
    section: '§1 & §2 Brand Identity & Customer Profile',
    summary: 'UK-based online fashion boutique founded by mother-daughter duo. UK women 35+ buying for occasions. Anxious about sizing/delivery. Tone: Warm, calm, specific, human. Never defensive. Sign off: "Warm wishes,\nEmma\nEmma & Rose London team".'
  },
  {
    section: '§7 Cancellations',
    summary: 'Unfulfilled: Cancel & refund full amount immediately (C1). No funnel. Partially fulfilled: Cancel & refund unfulfilled items, explain rest is en route (C2). Shipped: Cannot cancel, provide tracking, can refuse delivery or return upon arrival (C3).'
  },
  {
    section: '§8 WISMO (Where Is My Order)',
    summary: 'Look up Shopify + ParcelPanel tracking. Provide current status, tracking link, realistic delivery window. Tracking stuck 7+ days: Apologize, chase up, give concrete follow-up date (max 3 days). Undelivered after 30 days: Treat as non-delivery.'
  },
  {
    section: '§9 Address Changes',
    summary: 'Before fulfillment: Update in Shopify, confirm by email, note it. After fulfillment: Cannot change. Advise contacting carrier to redirect. If returned to sender, refund in full. Never promise before updating Shopify.'
  },
  {
    section: '§10 Marked Delivered But Not Received',
    summary: 'Check GPS/signature. Ask to check safe place, neighbours, household; give 48 hours. If still missing after 48h: Refund in full or free replacement, customer\'s choice. Never demand police report or blame customer.'
  },
  {
    section: '§11 Damaged or Completely Wrong Item',
    summary: 'Applies ONLY to physical damage (tears, stains, broken zips, holes) or wrong item. Ask for photos. Once confirmed: Full refund OR free replacement — she keeps the item, no return postage. Quality/feel complaints are §12, NOT §11.'
  },
  {
    section: '§12 Returns & Refunds (The 4-Step Keep-It Flow)',
    summary: 'Applies to changed mind, fit, style, quality/fabric dissatisfaction. Step 1: Offer Option A (30% refund to keep) vs Option B (Return to China at customer cost). Step 2: 50% refund exception. Step 3: 70% refund final offer. Step 4: Return address (confirm with Sam/Nijs). Tracked return, full refund within 14 days of postage proof.'
  },
  {
    section: '§13 Exchanges (The Reorder Method)',
    summary: 'First offer 30% keep-it refund. If exchange needed, use Reorder Method: Confirm stock -> customer orders new item at normal price -> refund 70% of original order -> customer keeps original. Math: Original £X -> new £X -> refund £Y (70%) -> net £Z (30%).'
  },
  {
    section: '§14 & §15 Chargeback Threats & Escalation',
    summary: 'If "chargeback", "bank", "dispute", "Trading Standards", or bad review mentioned: STOP funnel immediately. Send de-escalation email (CB1) promising personal resolution within 24h. Escalate same day to Sam (Base Works) or Nijs (NRK Business).'
  },
  {
    section: '§16 Documentation Standards',
    summary: 'Help Scout note on every ticket: Issue, Order #, Amount, Delivered date, Action proposed/processed, Customer response status, and only relevant tags.'
  },
  {
    section: '§19 Policy Overrides (CRITICAL)',
    summary: '1. 30 days return window from delivery (never 15 days, do not link to refund page). 2. NEVER mention or deduct the £20/€20 restocking fee. 3. Sale items ARE eligible for refunds. 4. Never mention customs, VAT, or Asia shipping.'
  }
];
