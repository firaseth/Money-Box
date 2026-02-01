
export interface BrandAsset {
  name: string;
  description: string;
  colors: { name: string; hex: string; class: string }[];
}

export interface SocialTemplate {
  platform: 'Instagram' | 'Twitter' | 'LinkedIn';
  title: string;
  content: string;
  imageAlt?: string;
}

export interface EmailSequence {
  day: number;
  subject: string;
  body: string;
  cta: string;
}

export interface AdCopy {
  channel: string;
  headline: string;
  description: string;
  url: string;
}

export interface ChecklistItem {
  task: string;
  completed: boolean;
}

export interface SupportFAQ {
  question: string;
  answer: string;
}


export interface SecuritySettings {
  isLocked: boolean;
  pin: string | null;
  privacyMode: boolean;
}

export interface Notification {
  id: string;
  type: 'alert' | 'bill' | 'security';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  frequency: 'monthly' | 'weekly' | 'annually';
}

// Budget Types
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
  billId?: string; // Link to a bill if it's a bill payment
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}
