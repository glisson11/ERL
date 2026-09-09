export interface TriageRequest {
  customerQuery: string;
  customerName?: string;
  orderNumber?: string;
  orderAmount?: string;
  itemName?: string;
  deliveryDate?: string;
  trackingStatus?: string;
  trackingLink?: string;
  currentStep?: 'initial' | 'declined_30' | 'declined_50' | 'declined_70';
  orderFulfilmentStatus?: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'delivered';
}

export interface InternalCaseTriage {
  customerIssue: string;
  sopCategory: string;
  suggestedMacro: string;
  recommendedAction: string;
  calculatedRefundMaths: string;
  policyOverridesApplied: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'escalation';
}

export interface SopMacro {
  id: string;
  code: string;
  name: string;
  section: string;
  scenario: string;
  templateRaw: string;
  tags: string[];
}

export interface EmailDraft {
  templateCode?: string;
  title: string;
  content: string;
}

export interface HelpScoutNote {
  issue: string;
  order: string;
  action: string;
  customerResponse: string;
  tags: string[];
  rawNote: string;
}

export interface TriageResult {
  triage: InternalCaseTriage;
  draftA: EmailDraft;
  draftB: EmailDraft;
  helpScoutNote: HelpScoutNote;
  fullRawText: string;
  timestamp: string;
}

export interface PresetCase {
  id: string;
  name: string;
  title: string;
  category: string;
  customerName: string;
  orderNumber: string;
  orderAmount: string;
  itemName: string;
  deliveryDate: string;
  trackingStatus?: string;
  customerQuery: string;
}
