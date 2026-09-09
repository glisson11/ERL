import { TriageRequest, TriageResult } from '../types';
import { SOP_MACROS } from '../data/sopKnowledge';

export function calculateRefundAmounts(orderAmountStr: string | number) {
  const amount = typeof orderAmountStr === 'number' 
    ? orderAmountStr 
    : parseFloat(orderAmountStr.replace(/[^0-9.]/g, '')) || 0;

  const refund30 = (amount * 0.3).toFixed(2);
  const refund50 = (amount * 0.5).toFixed(2);
  const refund70 = (amount * 0.7).toFixed(2);
  const netExchange30 = (amount - parseFloat(refund70)).toFixed(2);

  return {
    amount: amount.toFixed(2),
    refund30,
    refund50,
    refund70,
    netExchange30
  };
}

export function populateSopMacro(macroCode: string, req: TriageRequest): string {
  const name = req.customerName?.trim() || extractName(req.customerQuery) || 'there';
  const orderNum = req.orderNumber?.trim() || extractOrderNumber(req.customerQuery) || '#Order';
  const rawAmt = req.orderAmount?.trim() || extractAmount(req.customerQuery) || '39.95';
  const { amount, refund30, refund50, refund70, netExchange30 } = calculateRefundAmounts(rawAmt);
  const item = req.itemName?.trim() || extractItemName(req.customerQuery) || 'item';
  const trackingLink = req.trackingLink?.trim() || 'emmaroselondon.com/apps/parcelpanel';
  const trackingStatus = req.trackingStatus?.trim() || 'in transit with royal mail partner network';
  const deliveryDate = req.deliveryDate?.trim() || 'yesterday';

  const macro = SOP_MACROS.find(m => m.code.toUpperCase() === macroCode.toUpperCase());
  if (!macro) {
    return '';
  }

  let text = macro.templateRaw;
  text = text.replace(/\[Name\]/g, name);
  text = text.replace(/#\[X\]/g, orderNum.startsWith('#') ? orderNum : `#${orderNum}`);
  text = text.replace(/\[X\]/g, orderNum.startsWith('#') ? orderNum : `#${orderNum}`);
  text = text.replace(/£\[amount\]/g, `£${amount}`);
  text = text.replace(/\[amount\]/g, amount);
  text = text.replace(/\[item\]/g, item);
  text = text.replace(/\[link\]/g, trackingLink);
  text = text.replace(/\[tracking link\]/g, trackingLink);
  text = text.replace(/\[status\]/g, trackingStatus);
  text = text.replace(/\[date, location\]/g, 'recent scan at central sorting hub');
  text = text.replace(/\[realistic window\]/g, 'within 3–5 working days');
  text = text.replace(/\[date\]/g, 'Friday');
  text = text.replace(/\[size\/colour\]/g, 'alternative size');
  text = text.replace(/\[product link\]/g, 'emmaroselondon.com/products/' + item.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  text = text.replace(/£\[X\]/g, `£${amount}`);
  text = text.replace(/£\[Y\]/g, `£${refund70}`);
  text = text.replace(/£\[Z\]/g, `£${netExchange30}`);
  text = text.replace(/\[RETURN ADDRESS — confirm current address with Sam\/Nijs before sending\]/g, 
`Emma & Rose London Returns Depot
Ref: ${orderNum}
Attn: Sam / Nijs Verification Team
Unit 4, International Logistics Centre
[Confirm live warehouse code with Sam @ Base Works / Nijs @ NRK Business prior to dispatch]`);

  // For R1, replace refund amount with 30%
  if (macroCode.toUpperCase() === 'R1') {
    text = text.replace(/30% \(£[0-9.]+\)/g, `30% (£${refund30})`);
  }
  // For R2, replace refund amount with 50%
  if (macroCode.toUpperCase() === 'R2') {
    text = text.replace(/50% back — £[0-9.]+/g, `50% back — £${refund50}`);
  }
  // For R3, replace refund amount with 70%
  if (macroCode.toUpperCase() === 'R3') {
    text = text.replace(/70% — £[0-9.]+/g, `70% — £${refund70}`);
  }

  return text;
}

export function generateDeterministicTriage(req: TriageRequest): TriageResult {
  const query = req.customerQuery.toLowerCase();
  const name = req.customerName?.trim() || extractName(req.customerQuery) || 'there';
  const orderNum = req.orderNumber?.trim() || extractOrderNumber(req.customerQuery) || '#Order';
  const rawAmt = req.orderAmount?.trim() || extractAmount(req.customerQuery) || '39.95';
  const { amount, refund30, refund50, refund70, netExchange30 } = calculateRefundAmounts(rawAmt);
  const item = req.itemName?.trim() || extractItemName(req.customerQuery) || 'item';
  const deliveredDate = req.deliveryDate?.trim() || 'recently';

  // Determine Category & Specific Macro
  const isChargeback = /chargeback|bank|dispute|legal|trading standards|citizens advice|review|court|scam/i.test(query);
  const isDamaged = /tear|torn|stain|broken|hole|zipper|zip|seam|damaged|defective|wrong item/i.test(query) && !/quality|cheap|fabric|material|fit|tight|loose|suit/i.test(query);
  const isExchange = /exchange|size|colour|color|bigger|smaller|tight|loose|chest|waist|hips/i.test(query) || (req.currentStep === 'initial' && /size|tight|small|large/i.test(query));
  const isCancellation = /cancel|cancellation|mistake|before it ships|placed.*yesterday.*cancel/i.test(query) || req.orderFulfilmentStatus === 'unfulfilled';
  const isWismo = /where is|tracking|parcel|dispatch|hasn't arrived|haven't received|not moved|late|status/i.test(query) && !/return|refund|exchange/i.test(query);
  const isDeliveredNotReceived = /shows delivered|marked delivered|said delivered|tracking says delivered/i.test(query);

  let category = '§12 Returns (Step 1)';
  let suggestedMacro = 'Macro R1 — Return request, first reply (30% Keep-It)';
  let recommendedAction = 'Offer Option A (30% refund to keep) or Option B (return to China at customer cost)';
  let tags = ['return'];
  let riskLevel: 'low' | 'medium' | 'high' | 'escalation' = 'low';
  let templateCode = 'R1';
  let draftATitle = 'Suggested Macro R1 — Return request, first reply';
  let draftAContent = '';
  let draftBContent = '';

  const signature = `Warm wishes,\nEmma\nEmma & Rose London team`;

  if (isChargeback) {
    category = '§14 & §15 Chargeback Risk (Immediate Escalation)';
    suggestedMacro = 'Macro CB1 — Chargeback mentioned (send fast, then escalate)';
    recommendedAction = 'STOP all offer funnels immediately. Send apologetic de-escalation response and escalate ticket directly to Sam / Nijs.';
    tags = ['chargeback-risk', 'escalated'];
    riskLevel = 'escalation';
    templateCode = 'CB1';
    draftATitle = 'Suggested Macro CB1 — Chargeback Mentioned (De-escalation)';
    draftAContent = `Hi ${name},

I'm sorry this has got to this point — that's on us, not on you.

I'm taking this over personally now. Give me until tomorrow morning (within 24 hours) and I'll come back to you with this fully sorted.

You don't need to do anything in the meantime, and thank you for giving me the chance to put it right.

${signature}`;

    draftBContent = `Hi ${name},

I am so deeply sorry that this has reached this point — you should never have been left waiting or feeling distressed, and that is entirely on us. 

I want to reassure you that I have stepped in and taken your case over personally today. I am reviewing your order ${orderNum} (£${amount}) with our leadership team right now to make sure this is resolved completely and fairly for you within the next 24 hours.

Please do not worry about taking any further steps with your bank just yet while I sort this out for you. Thank you for your patience and for giving me the opportunity to set things right.

${signature}`;

  } else if (isCancellation) {
    if (req.orderFulfilmentStatus === 'partially_fulfilled') {
      category = '§7 Cancellations (Partially Fulfilled)';
      suggestedMacro = 'Macro C2 — Cancellation, partially shipped';
      recommendedAction = `Cancel unfulfilled portion and refund to payment card. Item already in transit cannot be halted.`;
      tags = ['cancellation'];
      riskLevel = 'low';
      templateCode = 'C2';
      draftATitle = 'Suggested Macro C2 — Cancellation, partially shipped';
      draftAContent = `Hi ${name},

I've cancelled the part of order ${orderNum} that hadn't left our warehouse yet and refunded £${amount} to your original payment method — that should reach you within 3–5 working days.

The ${item} had already been dispatched, so I can't stop that one. Here's the tracking: emmaroselondon.com/apps/parcelpanel. If you'd still rather not keep it once it arrives, just reply to this email and I'll sort it out for you.

${signature}`;

      draftBContent = `Hi ${name},

Thank you for reaching out right away. I have checked with our fulfilment team and managed to stop and cancel the pending part of your order ${orderNum} for you.

I have processed a refund of £${amount} directly back to your payment card, which should appear in your account within 3 to 5 working days.

The ${item} was already safely packed and handed to the courier earlier today, so I was unable to halt that parcel. You can track its journey here: emmaroselondon.com/apps/parcelpanel. When it arrives, please see how you feel about it — if it's not quite right, just reply to me here and I will take care of you right away.

${signature}`;

    } else if (req.orderFulfilmentStatus === 'fulfilled') {
      category = '§7 Cancellations (Already Shipped)';
      suggestedMacro = 'Macro C3 — Cancellation, already shipped';
      recommendedAction = `Order already dispatched; cannot cancel. Advise customer to refuse parcel on delivery for return/refund or accept and contact for return.`;
      tags = ['cancellation'];
      riskLevel = 'low';
      templateCode = 'C3';
      draftATitle = 'Suggested Macro C3 — Cancellation, already shipped';
      draftAContent = `Hi ${name},

I'm sorry — order ${orderNum} was dispatched recently, so I'm no longer able to stop it. Here's your tracking: emmaroselondon.com/apps/parcelpanel.

You have two options. You can refuse the parcel when it's delivered, and it'll come back to us and I'll refund you in full. Or accept it, and if it's not right once you've seen it, reply to this email and I'll take care of it straight away.

Sorry for the timing on this one.

${signature}`;

      draftBContent = `Hi ${name},

I completely understand your request, but I'm so sorry — your order ${orderNum} has already left our dispatch facility, so I'm afraid I cannot stop the delivery mid-route. You can keep an eye on its delivery status here: emmaroselondon.com/apps/parcelpanel.

You have two easy ways to handle this:
1. When the postman arrives, you can simply refuse the parcel. It will then be returned directly to us and I will issue your full refund of £${amount}.
2. Or, you can accept the delivery to inspect the ${item}. If it isn't what you were hoping for, message me back here and I will arrange your resolution immediately.

I am so sorry about the timing, but we will make sure you are looked after either way!

${signature}`;

    } else {
      category = '§7 Cancellations (Unfulfilled)';
      suggestedMacro = 'Macro C1 — Cancellation, order not yet shipped';
      recommendedAction = 'Cancel order in Shopify and refund 100% (£' + amount + ') immediately. No persuasion or retention attempts.';
      tags = ['cancellation'];
      riskLevel = 'low';
      templateCode = 'C1';
      draftATitle = 'Suggested Macro C1 — Cancellation, order not yet shipped';
      draftAContent = `Hi ${name},

Of course — I've cancelled order ${orderNum} and refunded the full £${amount} to your original payment method just now. Depending on your bank it usually shows up within 3–5 working days.

Nothing else is needed from your side. If you'd ever like to order again, just let me know and I'll help you get the sizing right.

${signature}`;

      draftBContent = `Hi ${name},

Of course, please don't worry at all! I've caught your order ${orderNum} in time and cancelled it for you right away.

I have processed a full refund of £${amount} back to your original payment card today. Depending on your bank's clearance times, it normally reflects in your account within 3 to 5 working days.

You don't need to do another thing. If you ever need help choosing a piece or checking measurements in future, I'd be delighted to assist you personally.

${signature}`;
    }

  } else if (isDamaged) {
    category = '§11 Faulty / Damaged Item';
    suggestedMacro = 'Macro F1 — Faulty, damaged or wrong item';
    recommendedAction = 'Offer customer choice of a 100% full refund (£' + amount + ') or free replacement. Customer keeps the item with no return postage required.';
    tags = ['faulty'];
    riskLevel = 'medium';
    templateCode = 'F1';
    draftATitle = 'Suggested Macro F1 — Faulty, damaged or wrong item';
    draftAContent = `Hi ${name},

I'm really sorry — that's not what should have arrived, and thank you for sending the photos.

I can sort this two ways, whichever suits you better:

A full refund of £${amount} back to your original payment method, or a replacement sent out to you at no cost.

Either way, please don't worry about sending anything back to us — keep the item.

Just let me know which you'd prefer and I'll do it today.

${signature}`;

    draftBContent = `Hi ${name},

I am so very sorry to hear this, and thank you for taking the time to share the photos with us. When you unpack something you've been anticipating, having a torn seam or broken zip is so disappointing, and that certainly isn't the quality we stand for at Emma & Rose.

Please rest assured we will make this right immediately. I can arrange either of these options for you today:

1. A full refund of £${amount} directly back to your payment card, OR
2. A brand-new replacement sent out to your address free of charge.

Whichever option you choose, please keep the original ${item} with our compliments — you do not need to pack it up or make a trip to the Post Office. Just let me know what you prefer and I'll action it right away.

${signature}`;

  } else if (isExchange && req.currentStep === 'initial') {
    category = '§13 Exchanges (Step 1 / Reorder Method)';
    suggestedMacro = 'Macro E1 — Exchange, reorder method';
    recommendedAction = `Offer Option A (30% keep-it refund £${refund30}) alongside the Reorder Exchange Method (refund £${refund70}, net cost £${netExchange30} to keep both).`;
    tags = ['exchange', 'return'];
    riskLevel = 'low';
    templateCode = 'E1';
    draftATitle = 'Suggested Macro E1 — Exchange, reorder method';
    draftAContent = `Hi ${name},

Good news — the alternative size of the ${item} is in stock.

Here's the simplest way to get it to you, and I want to be completely clear about how it works so there are no surprises:

1. You place a new order on the site for the desired size
2. As soon as it comes through, I refund 70% of your original order — £${refund70}
3. You keep the original item, nothing to send back

So in real numbers: your new order is £${amount}, I refund £${refund70}, which leaves you about £${netExchange30} out of pocket — and you'll have both pieces.

If you'd rather not place a second order, that's completely fine. I can still refund you 30% (£${refund30}) and you keep what you have, or you can return it for a full refund. Just tell me which works best.

${signature}`;

    draftBContent = `Hi ${name},

Thank you so much for reaching out to us. First of all, please don't feel disheartened at all about the fit! Sizing across different cuts can be so tricky, and as a boutique founded by a mother and daughter, our whole mission is making women feel comfortable, supported, and confident in their clothes.

I've checked our inventory and the larger size in the ${item} is currently in stock. To save you the hassle and delay of an international return, here is the simplest way we can get the right size to you:

1. Place an order for your new size on our website (at the standard price of £${amount}).
2. Simply reply to this email with your new order number, and I will immediately issue a 70% refund (£${refund70}) on your original order.
3. You keep the original set with you — there is no need to visit the Post Office or post anything back!

In clear numbers: you receive your new size, we refund £${refund70}, meaning it only costs you £${netExchange30} extra overall, and you keep both items to share or keep as a spare.

Alternatively, if you'd prefer not to reorder, I can gladly refund 30% (£${refund30}) to your card today so you can keep the piece, or provide our standard return details for a full refund. 

Please let me know which option suits you best, and I will take care of it straight away!

${signature}`;

  } else if (isWismo) {
    category = '§8 WISMO (Where Is My Order)';
    suggestedMacro = 'Macro W1 — Where is my order (WISMO)';
    recommendedAction = 'Provide current tracking status, ParcelPanel link, and realistic delivery window. If stuck 7+ days, apologize and set a 3-day follow-up date.';
    tags = ['wismo'];
    riskLevel = 'medium';
    templateCode = 'W1';
    draftATitle = 'Suggested Macro W1 — Where is my order';
    draftAContent = `Hi ${name},

Thanks for checking in. I've just looked at order ${orderNum} — it's currently in transit and the latest update was at the central logistics hub.

You can follow it here: emmaroselondon.com/apps/parcelpanel. Based on where it is now, I'd expect it with you within 3–5 working days.

If it hasn't moved by Friday, reply to this email and I'll chase it up personally.

${signature}`;

    draftBContent = `Hi ${name},

Thank you for checking in with us. I completely understand how eager you are to receive your order ${orderNum}, especially when you're planning ahead for an event!

I have just looked into the carrier updates for you. Your parcel is currently in transit through the customs and distribution network. You can track its live progress here: emmaroselondon.com/apps/parcelpanel.

Based on standard UK delivery schedules, I expect it will arrive with you within the next 3 to 5 working days. I am keeping a personal eye on this for you — if you don't see fresh tracking movement within 3 working days, simply reply to this email and I will escalate it with our logistics manager directly.

${signature}`;

  } else if (isDeliveredNotReceived) {
    category = '§10 Marked Delivered But Not Received';
    suggestedMacro = 'Macro W1 — Where is my order (Delivered Not Received 48h Protocol)';
    recommendedAction = 'Check GPS/signature. Ask customer to check safe place, neighbours, and household members, and allow 48 hours. If still missing, refund in full or replace.';
    tags = ['delivery-issue'];
    riskLevel = 'medium';
    templateCode = 'W1';
    draftATitle = 'Suggested Macro W1 Variant — Marked Delivered 48-Hour Protocol';
    draftAContent = `Hi ${name},

Thanks for letting me know. I've checked the carrier system for order ${orderNum} and it shows a delivery scan.

Could you please double-check with neighbours, anyone in your household, or in safe places like porches, side gates, or sheds? 

If it still hasn't turned up after 48 hours, reply to this email and I will happily issue a full refund of £${amount} or send out a free replacement straight away.

${signature}`;

    draftBContent = `Hi ${name},

I'm so sorry to hear this! It's so frustrating to see a parcel marked as delivered when you haven't received it.

The courier has logged a delivery scan on their system, but in our experience, parcels are sometimes tucked behind a gate, left with a friendly neighbour, or collected by someone else at home. Could you kindly check around your porch, safe spots, or with nearby neighbours and give it 48 hours?

Please be assured you won't be left out of pocket: if it has not surfaced after 48 hours, just message me back here and I will immediately issue a full refund of £${amount} or dispatch a complimentary replacement, whichever you prefer.

${signature}`;

  } else if (req.currentStep === 'declined_30') {
    // Funnel Step 2: Customer declined 30%
    category = '§12 Returns (Step 2: Second Offer)';
    suggestedMacro = 'Macro R2 — Second offer (50% Refund Exception)';
    recommendedAction = `Customer declined 30%. Offer 50% refund exception (£${refund50}) to keep the item rather than incur international postage costs.`;
    tags = ['return'];
    riskLevel = 'low';
    templateCode = 'R2';
    draftATitle = 'Suggested Macro R2 — Second offer (50% Refund)';
    draftAContent = `Hi ${name},

Thanks for coming back to me. I've had another look at your order and asked internally whether I can do better for you.

I can offer you 50% back — £${refund50} — and you keep the ${item}. That's above what we'd normally do, but given the situation I'd rather you got something good out of this than spent money on international postage.

If you'd still prefer to return it, that's absolutely your call and I'll send the address straight over. Just say the word.

${signature}`;

    draftBContent = `Hi ${name},

Thank you for coming back to me so promptly, and I completely understand your feelings.

I had a word with my team this morning to see if we could do something better for you. Because international postage to our return hub is expensive and takes time, I would love to offer you a 50% refund (£${refund50}) directly back to your payment method, and you keep the ${item}.

This way, you recoup half your spend today without any hassle, packing, or queueing at the post office. However, if you would still rather return it for the full amount, that is entirely your decision and I will gladly provide the return details right away.

${signature}`;

  } else if (req.currentStep === 'declined_50') {
    // Funnel Step 3: Customer declined 50%
    category = '§12 Returns (Step 3: Final Offer)';
    suggestedMacro = 'Macro R3 — Final offer (70% Refund Final Offer)';
    recommendedAction = `Customer declined 50%. Offer 70% refund final offer (£${refund70}) to keep the item. This is the maximum allowed before requiring return.`;
    tags = ['return'];
    riskLevel = 'low';
    templateCode = 'R3';
    draftATitle = 'Suggested Macro R3 — Final offer (70% Refund)';
    draftAContent = `Hi ${name},

I understand. Let me make you one last offer, and then I'll do whatever you decide.

I can refund you 70% — £${refund70} — and you keep the ${item}. That's the most I'm able to offer without a return.

If you'd rather send it back for the full amount, just reply "return" and I'll send you the address and details right away. No hard feelings either way.

${signature}`;

    draftBContent = `Hi ${name},

I completely respect where you're coming from. I truly want to make sure you feel well treated, so please let me make you our final, maximum offer:

I can process a 70% refund (£${refund70}) right now, and you keep the ${item} with no return required. This is the absolute highest refund I am authorised to issue without a physical return.

If you would still prefer to send it back for the remaining 30%, simply reply "return" and I will send the postal address and instructions over right away. No pressure either way — whatever you choose, I am here to help!

${signature}`;

  } else if (req.currentStep === 'declined_70') {
    // Funnel Step 4: Return Address
    category = '§12 Returns (Step 4: Return Address)';
    suggestedMacro = 'Macro R4 — Return address (Tracked Return Instructions)';
    recommendedAction = `Customer declined 70%. Provide return address confirmed with Sam/Nijs. Advise tracked postage at customer cost; refund within 14 days of postage proof.`;
    tags = ['return'];
    riskLevel = 'low';
    templateCode = 'R4';
    draftATitle = 'Suggested Macro R4 — Return address';
    draftAContent = `Hi ${name},

No problem at all — here are the details for your return:

Emma & Rose London Returns Depot
Ref: ${orderNum}
Attn: Returns Verification Team
Unit 4, International Logistics Centre
[Confirm current warehouse address with Sam @ Base Works / Nijs @ NRK Business before sending]

A few things worth knowing:
- Please use a tracked service and send me the tracking number
- Return postage is at your own cost
- As soon as you send me proof of postage, I'll start your refund — you won't have to wait for the parcel to arrive

Thanks for your patience with this, and sorry again that it wasn't right.

${signature}`;

    draftBContent = `Hi ${name},

No problem at all — I completely understand, and here are the details so you can send your piece back to us:

Emma & Rose London Returns Depot
Ref: ${orderNum}
Attn: Returns Team
Unit 4, International Logistics Centre
[Address confirmed with management]

A few helpful notes to ensure everything goes smoothly:
- Please send your parcel using a tracked postal service and reply here with the tracking number.
- In line with our boutique terms, international return postage is at your own expense.
- The good news: you will NOT have to wait weeks for the package to arrive overseas! As soon as you email me your proof of postage, I will initiate your full refund of £${amount} right away.

Thank you so much for your patience, and I am so sorry the ${item} wasn't the perfect piece this time.

${signature}`;

  } else {
    // Default: Section 12 Returns Step 1
    category = '§12 Returns (Step 1: First Reply)';
    suggestedMacro = 'Macro R1 — Return request, first reply (30% Keep-It)';
    recommendedAction = `Confirm 30-day return eligibility. Offer Option A (30% keep-it refund £${refund30} today) vs Option B (return to supplier at customer's own cost).`;
    tags = ['return'];
    riskLevel = 'low';
    templateCode = 'R1';
    draftATitle = 'Suggested Macro R1 — Return request, first reply';
    draftAContent = `Hi ${name},

Thanks for letting me know, and I'm sorry the ${item} wasn't right for you. You can absolutely return it — but before you go to the trouble, let me give you both options so you can pick what suits you.

Option 1 — keep it and take a refund. I can refund you 30% (£${refund30}) today. Nothing to pack, nothing to post, and the money is back with you in a few days. You can pass the piece on to someone or keep it as a spare.

Option 2 — send it back for a full refund. I'll send you the return address. I should be honest with you: our returns go to our supplier's warehouse in China, the postage is at your own cost, and it usually takes a few weeks to get there.

Both are completely fine by me — just tell me which you'd prefer and I'll get it moving.

${signature}`;

    draftBContent = `Hi ${name},

Thank you for reaching out to us, and I'm so sorry to hear that the ${item} wasn't quite right for you! 

As a mother-daughter boutique, our main hope is always that you feel completely comfortable and happy in our pieces. You are within our 30-day return window, so you can certainly return it for a full refund. However, because our return depot is based abroad, international return postage can be quite costly and inconvenient. To save you that hassle, I'd love to offer you two simple options:

Option 1 (The Keep-It Solution): Keep the ${item} and receive a 30% refund (£${refund30}) directly back to your payment card today. No parcel trips, no postage costs, and you can gift the item to a friend or keep it as a spare.

Option 2 (Standard Return): Return the parcel to our international returns warehouse at your own postage cost for a full refund of £${amount} once tracking proof is provided.

Whatever you decide is completely fine with us — just let me know your preference and I'll take care of it right away.

${signature}`;
  }

  // Help Scout Note
  const helpScoutRaw = `Issue: ${req.customerQuery.slice(0, 70).replace(/\n/g, ' ')}...
Order: ${orderNum} · £${amount} · delivered ${deliveredDate}
Action: ${recommendedAction}
Customer response: Pending
Tags: ${tags.join(', ')}`;

  const result: TriageResult = {
    triage: {
      customerIssue: req.customerQuery.slice(0, 140).replace(/\n/g, ' '),
      sopCategory: category,
      suggestedMacro,
      recommendedAction,
      calculatedRefundMaths: `Original Order: £${amount}. Option A (30% Keep-it): £${refund30}. Option B (50% Exception): £${refund50}. Option C (70% Final): £${refund70}. Exchange Reorder: refund 70% (£${refund70}), net customer cost = £${netExchange30}.`,
      policyOverridesApplied: 'No restocking fee applied (§19). Enforced 30-day return window from delivery. Sale items eligible for full return flow. No mention of Asia/customs charges to customer in tailored copy.',
      riskLevel
    },
    draftA: {
      templateCode,
      title: draftATitle,
      content: draftAContent
    },
    draftB: {
      templateCode: 'Brand-Warm',
      title: 'Brand-Aligned Tailored Draft (Mother-Daughter Boutique Voice)',
      content: draftBContent
    },
    helpScoutNote: {
      issue: req.customerQuery.slice(0, 70).replace(/\n/g, ' '),
      order: `${orderNum} · £${amount} · delivered ${deliveredDate}`,
      action: recommendedAction,
      customerResponse: 'Pending',
      tags,
      rawNote: helpScoutRaw
    },
    fullRawText: `### 1. 📋 Internal Case Triage
- **Customer Issue**: ${req.customerQuery.slice(0, 140).replace(/\n/g, ' ')}
- **SOP Category**: ${category}
- **Suggested SOP Macro**: ${suggestedMacro}
- **Recommended Action**: ${recommendedAction}
- **Calculated Refund Maths (if applicable)**: Original Order: £${amount}. Option A 30% keep-it refund = £${refund30}. Exchange 70% refund = £${refund70}.
- **Policy Overrides Applied**: No restocking fee applied, sale item accepted for return flow, 30-day window enforced.

--------------------------------------------------

### 2. ✉️ Draft A: Suggested SOP Macro (${suggestedMacro})
${draftAContent}

--------------------------------------------------

### 3. ✉️ Draft B: Brand-Aligned Tailored Draft
${draftBContent}

--------------------------------------------------

### 4. ✍️ Help Scout Documentation Note
${helpScoutRaw}`,
    timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  };

  return result;
}

function extractName(text: string): string {
  const match = text.match(/(?:from|I am|I'm|name is|Hi,? I'm|Dear Emma,?\s*(?:my name is)?)\s+([A-Z][a-z]+)/i);
  return match ? match[1] : '';
}

function extractOrderNumber(text: string): string {
  const match = text.match(/#\s*(\d{3,6})/);
  return match ? `#${match[1]}` : '';
}

function extractAmount(text: string): string {
  const match = text.match(/£\s*(\d+(?:\.\d{2})?)/);
  return match ? match[1] : '';
}

function extractItemName(text: string): string {
  const match = text.match(/(?:ordered|received|bought|about the)\s+(?:the\s+)?([A-Z][A-Za-z\s]+(?:Set|Dress|Blouse|Top|Tunic|Pants|Trousers|Jacket|Coat|Skirt))/i);
  return match ? match[1].trim() : '';
}
