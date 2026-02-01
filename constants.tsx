
import React from 'react';
import {
  Palette,
  Share2,
  Mail,
  Video,
  BarChart3,
  Target,
  Megaphone,
  CheckSquare,
  LifeBuoy,
  Layout,
  Sparkles,
  PenTool,
  Building2,
  Users,
  Wallet,
  Briefcase
} from 'lucide-react';

export const NAVIGATION = [
  { id: 'personal-budget', name: 'Personal Budget', icon: Wallet },
  { id: 'firm-budget', name: 'Firm Budget', icon: Building2 },
  { id: 'bills', name: 'Monthly Bills', icon: CheckSquare },
  { id: 'reports', name: 'Budget Reports', icon: BarChart3 },
  { id: 'brand', name: 'Brand Assets', icon: Layout },
  { id: 'logo-gen', name: 'AI Logo Studio', icon: Sparkles },
  { id: 'social', name: 'Social Media', icon: Share2 },
  { id: 'email', name: 'Email Sequences', icon: Mail },
  { id: 'video', name: 'Video Content', icon: Video },
  { id: 'ads', name: 'Paid Advertising', icon: Megaphone },
  { id: 'launch', name: 'Launch Strategy', icon: Target },
  { id: 'support', name: 'Support Hub', icon: LifeBuoy },
];

export const BRAND_COLORS = [
  { name: 'Indigo-600', hex: '#4F46E5', class: 'bg-[#4F46E5]' },
  { name: 'Purple-600', hex: '#9333EA', class: 'bg-[#9333EA]' },
  { name: 'Blue-600', hex: '#2563EB', class: 'bg-[#2563EB]' },
  { name: 'Green-600', hex: '#059669', class: 'bg-[#059669]' },
  { name: 'Red-600', hex: '#DC2626', class: 'bg-[#DC2626]' },
  { name: 'Yellow-500', hex: '#EAB308', class: 'bg-[#EAB308]' },
  { name: 'Gray-900', hex: '#111827', class: 'bg-[#111827]' },
];

export const EMAIL_SEQUENCES = [
  {
    day: 1,
    subject: "Welcome to MoneyBox! 🎉 Personal & Firm Control Starts Now",
    body: "Hi [Name],\n\nWelcome to the MoneyBox family! Whether you're managing your household budget or your firm's operating expenses, you've just taken a massive step toward clarity.\n\nYour first week mission:\n✓ Set up your first 'Box' (Personal or Business)\n✓ Categorize your last 10 transactions\n✓ Invite a collaborator (for firms)\n\nPro tip: Tag expenses as 'Reimbursable' or 'Business' to keep your worlds perfectly separated.",
    cta: "Start Your First Box"
  },
  {
    day: 2,
    subject: "📊 BoxScore: For You and Your Business",
    body: "Hi [Name],\n\nBoxScore isn't just for savings; it's a health check for your firm too.\n\nFor Individuals:\n• Savings rate & debt control.\n\nFor Firms:\n• Burn rate, runway, and expense efficiency.\n\nKeep your score above 80 to ensure long-term stability.",
    cta: "Check Your BoxScore"
  }
];

export const SOCIAL_TEMPLATES = {
  Instagram: [
    {
      title: "Feature Highlight: One App, Two Worlds",
      content: "📊 Personal Budget vs. Business Cash Flow?\n\nStop switching between five apps. MoneyBox handles your individual savings and your firm's expenses in one clean interface.\n\n✓ Individual: Goal tracking & daily budgeting.\n✓ Firm: Expense reports & cash flow forecasting.\n\nGet the full picture. Download MoneyBox! 📦\n\n#MoneyBox #FinTech #BusinessOwner #PersonalFinance #SmallBiz"
    },
    {
      title: "Quick Tip: The Firm's Safety Net",
      content: "💡 FIRM FINANCE TIP\n\nAlways maintain a 3-month operating reserve. Use the 'Emergency Box' feature to automatically sweep a percentage of every invoice into your safety net.\n\nTrack it all in MoneyBox 📦\nDownload free → Link in bio"
    }
  ],
  Twitter: [
    {
      title: "Launch Announcement",
      content: "Managing a firm shouldn't feel like a second job. 📊\n\nMoneyBox is now live! Powerful expense tracking and cash flow forecasting for individuals AND small firms. \n\nOne login. Complete financial control.\n\n[Link] #FinTech #Startup #SaaS"
    }
  ],
  LinkedIn: [
    {
      title: "The Future of Professional Finance",
      content: "Financial literacy is just as important for a firm as it is for an individual. 📊\n\nI'm proud to introduce MoneyBox - a dual-purpose platform designed to bridge the gap between personal budgeting and corporate expense management.\n\nKey features for firms:\n• Multi-user expense tracking\n• 6-month cash flow forecasting\n• Automated tax category sorting\n\nRevolutionizing how we view money management for the modern professional. [link]\n\n#MoneyBox #CorporateFinance #Innovation #SmallBusiness"
    }
  ]
};
