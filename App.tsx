import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  NAVIGATION,
  BRAND_COLORS,
  EMAIL_SEQUENCES,
  SOCIAL_TEMPLATES
} from './constants';
import {
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Download,
  RefreshCcw,
  Sparkles,
  Info,
  Layers,
  Box,
  Shield,
  TrendingUp,
  Target,
  Zap,
  Building2,
  Briefcase,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  Wallet,
  Layout,
  Mail,
  Video,
  Megaphone,
  LifeBuoy,
  Sun,
  Moon,
  Monitor,
  Lock,
  Eye,
  EyeOff,
  Bell,
  AlertCircle,
  Calendar,
  Receipt,
  FileText,
  Clock,
  Unlock,
  BarChart3
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Transaction, TransactionType, SecuritySettings, Bill, Notification } from './types';
import { cn } from './utils';

type Theme = 'light' | 'dark' | 'cyber';

// --- Components ---

const LogoIcon = ({ className = "w-12 h-12", variant = "default" }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M50 10L15 30V70L50 90L85 70V30L50 10Z" className="fill-current opacity-20" />
      <path d="M50 10L15 30L50 50L85 30L50 10Z" className="fill-current" />
      <path d="M15 30V70L50 90V50L15 30Z" className="fill-current opacity-80" />
      <path d="M50 50V90L85 70V30L50 50Z" className="fill-current opacity-60" />
      <rect x="40" y="35" width="20" height="20" rx="4" fill="white" className="mix-blend-overlay" />
    </svg>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, colorClass, privacyMode = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel p-6 rounded-2xl border shadow-xl transition-all"
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-current/10", colorClass)}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <p className={cn(
      "text-3xl font-black font-mono tracking-tight transition-all duration-500",
      privacyMode ? "blur-md select-none opacity-50" : "blur-0"
    )}>
      {value}
    </p>
    {trend && (
      <div className="mt-4 flex items-center gap-2">
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600")}>+12.5%</span>
        <span className="text-xs text-slate-400 font-medium">vs last month</span>
      </div>
    )}
  </motion.div>
);

const LockScreen = ({ enteredPin, setEnteredPin, onUnlock, pinError }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-6"
  >
    <div className="max-w-md w-full glass-panel p-10 rounded-[3rem] border border-white/10 text-center space-y-8 shadow-2xl">
      <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/50">
        <Lock className="w-10 h-10 text-white" />
      </div>
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Box Locked</h2>
        <p className="text-slate-400 font-medium mt-2">Enter your security PIN to access the vault.</p>
      </div>
      <div className="space-y-4">
        <input
          type="password"
          value={enteredPin}
          onChange={(e) => setEnteredPin(e.target.value)}
          placeholder="••••"
          maxLength={4}
          className={cn(
            "w-full text-center text-4xl font-black tracking-[1em] py-6 bg-slate-800/50 border rounded-3xl focus:ring-4 focus:ring-indigo-500/20 transition-all text-white",
            pinError ? "border-rose-500 animate-shake" : "border-white/10"
          )}
        />
        {pinError && <p className="text-rose-500 text-xs font-black uppercase tracking-widest">Invalid Security Key</p>}
        <button
          onClick={onUnlock}
          className="btn-primary w-full py-5 rounded-3xl font-black uppercase tracking-widest"
        >
          Unlock Vault
        </button>
      </div>
    </div>
  </motion.div>
);

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('personal-budget');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [logoTheme, setLogoTheme] = useState<'light' | 'dark' | 'brand'>('light');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app_theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  // Budget State
  const [personalTransactions, setPersonalTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('personal_tx');
    return saved ? JSON.parse(saved) : [];
  });
  const [firmTransactions, setFirmTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('firm_tx');
    return saved ? JSON.parse(saved) : [];
  });

  // Form State
  const [txForm, setTxForm] = useState<{
    description: string;
    amount: string;
    category: string;
    type: TransactionType;
    date: string;
  }>({
    description: '',
    amount: '',
    category: 'General',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    localStorage.setItem('firm_tx', JSON.stringify(firmTransactions));
  }, [firmTransactions]);

  // Security & Settings State
  const [security, setSecurity] = useState<SecuritySettings>(() => {
    const saved = localStorage.getItem('app_security');
    return saved ? JSON.parse(saved) : { isLocked: false, pin: null, privacyMode: false };
  });

  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Bills & Notifications State
  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('app_bills');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('app_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('app_security', JSON.stringify(security));
  }, [security]);

  useEffect(() => {
    localStorage.setItem('app_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('app_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Alert Logic
  useEffect(() => {
    const personalStats = getStats(personalTransactions);
    const firmStats = getStats(firmTransactions);

    const checkBudgetAlert = (balance: number, income: number, type: string) => {
      if (income > 0 && balance < -0.2 * income) {
        const title = `${type} Budget Alert`;
        const message = `Your ${type.toLowerCase()} budget balance is down by more than 20% of your total income. Please review your expenses.`;

        // Add notification if not already present recently
        if (!notifications.some(n => n.title === title && new Date(n.date).toDateString() === new Date().toDateString())) {
          const newNotif: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'alert',
            title,
            message,
            date: new Date().toISOString(),
            isRead: false
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
      }
    };

    checkBudgetAlert(personalStats.balance, personalStats.income, 'Personal');
    checkBudgetAlert(firmStats.balance, firmStats.income, 'Firm');
  }, [personalTransactions, firmTransactions]);

  // Bill Notification Logic
  useEffect(() => {
    const today = new Date();
    bills.forEach(bill => {
      const dueDate = new Date(bill.dueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 3 && diffDays >= 0 && !bill.isPaid) {
        const title = `Bill Due Soon: ${bill.description}`;
        if (!notifications.some(n => n.title === title && new Date(n.date).toDateString() === new Date().toDateString())) {
          setNotifications(prev => [{
            id: Math.random().toString(36).substr(2, 9),
            type: 'bill',
            title,
            message: `Your bill for ${bill.description} ($${bill.amount}) is due in ${diffDays} days.`,
            date: new Date().toISOString(),
            isRead: false
          }, ...prev]);
        }
      }
    });
  }, [bills]);

  const handleUnlock = () => {
    if (security.pin === enteredPin) {
      setSecurity({ ...security, isLocked: false });
      setEnteredPin('');
      setPinError(false);
    } else {
      setPinError(true);
      setEnteredPin('');
    }
  };

  const handleSetPin = (newPin: string) => {
    setSecurity({ ...security, pin: newPin, isLocked: false });
  };

  const togglePrivacyMode = () => {
    setSecurity({ ...security, privacyMode: !security.privacyMode });
  };

  const [billForm, setBillForm] = useState({
    description: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Subscription',
    frequency: 'monthly' as 'monthly' | 'weekly' | 'annually'
  });

  const handleAddBill = () => {
    if (!billForm.description || !billForm.amount) return;
    const newBill: Bill = {
      id: Math.random().toString(36).substr(2, 9),
      description: billForm.description,
      amount: parseFloat(billForm.amount),
      dueDate: billForm.dueDate,
      category: billForm.category,
      isPaid: false,
      frequency: billForm.frequency
    };
    setBills([newBill, ...bills]);
    setBillForm({
      description: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      category: 'Subscription',
      frequency: 'monthly'
    });
  };

  const markBillPaid = (id: string) => {
    setBills(bills.map(b => {
      if (b.id === id) {
        // Add as transaction
        const newTx: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          description: `Bill Payment: ${b.description}`,
          amount: b.amount,
          category: b.category,
          type: 'expense',
          date: new Date().toISOString().split('T')[0],
          billId: b.id
        };
        setPersonalTransactions([newTx, ...personalTransactions]);
        return { ...b, isPaid: true };
      }
      return b;
    }));
  };

  const handleAddTransaction = (isFirm: boolean) => {
    if (!txForm.description || !txForm.amount) return;

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description: txForm.description,
      amount: parseFloat(txForm.amount),
      category: txForm.category,
      type: txForm.type,
      date: txForm.date
    };

    if (isFirm) {
      setFirmTransactions([newTx, ...firmTransactions]);
    } else {
      setPersonalTransactions([newTx, ...personalTransactions]);
    }

    setTxForm({
      description: '',
      amount: '',
      category: 'General',
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const removeTransaction = (id: string, isFirm: boolean) => {
    if (isFirm) {
      setFirmTransactions(firmTransactions.filter(t => t.id !== id));
    } else {
      setPersonalTransactions(personalTransactions.filter(t => t.id !== id));
    }
  };

  const getStats = (txs: Transaction[]) => {
    const income = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = txs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  };

  // AI Logo Generator State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Minimalist logo combining a personal wallet and a corporate skyscraper into a single box icon, professional, indigo gradient');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateLogo = async (overridePrompt?: string) => {
    setIsGenerating(true);
    const activePrompt = overridePrompt || prompt;
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY";
      const ai = new GoogleGenAI(apiKey);
      const fullPrompt = `MoneyBox Brand Logo concept: ${activePrompt}. Use deep indigo (#4F46E5) and purple (#9333EA). Professional fintech, high fidelity, 4k. Themes: growth, security.`;

      const response = await ai.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(fullPrompt);
      // Note: Real image generation would use Imagen, this is a placeholder response for the demo
      console.log("AI Response:", response.response.text());

      // Simulating image generation for demo purposes if no real image model is available
      setTimeout(() => {
        setGeneratedLogo("https://images.unsplash.com/photo-1614850523296-e8c041de4398?auto=format&fit=crop&q=80&w=800");
        setIsGenerating(false);
      }, 2000);

    } catch (error) {
      console.error("Logo generation failed:", error);
      setIsGenerating(false);
    }
  };

  const renderBudgetView = (isFirm: boolean) => {
    const txs = isFirm ? firmTransactions : personalTransactions;
    const { income, expenses, balance } = getStats(txs);
    const title = isFirm ? "Firm Operating Control" : "Personal Treasure Chest";

    return (
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{title}</h2>
            <p className="text-slate-500 mt-2 font-medium">Manage your {isFirm ? 'business empire' : 'financial future'} with precision.</p>
          </motion.div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 glass-card rounded-xl text-sm font-bold text-slate-700 hover:bg-white transition-all">
              <Download className="w-4 h-4" /> Export Ledger
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Inflow"
            value={`$${income.toLocaleString()}`}
            icon={ArrowUpRight}
            colorClass="bg-emerald-50 text-emerald-600"
            trend={true}
            privacyMode={security.privacyMode}
          />
          <StatCard
            title="Total Outflow"
            value={`$${expenses.toLocaleString()}`}
            icon={ArrowDownRight}
            colorClass="bg-rose-50 text-rose-600"
            trend={true}
            privacyMode={security.privacyMode}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl shadow-2xl shadow-indigo-200/50 text-white relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <span className="text-xs font-bold text-indigo-100 uppercase tracking-widest block mb-4">Net Box Performance</span>
              <p className={cn(
                "text-4xl font-black font-mono tracking-tighter transition-all duration-500",
                security.privacyMode ? "blur-md select-none opacity-50" : "blur-0"
              )}>
                ${balance.toLocaleString()}
              </p>
              <div className="mt-6 flex items-center gap-2 text-indigo-100 text-sm font-bold">
                <Shield className="w-4 h-4" /> Secure & Optimized
              </div>
            </div>
          </motion.div>
        </div>
        {/* ... Rest of budget view ... */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="glass-panel p-8 rounded-3xl border border-white/40 sticky top-28 shadow-2xl shadow-slate-200/50">
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tighter">
                <Plus className="w-6 h-6 text-indigo-600 p-1 bg-indigo-50 rounded-lg" /> Add Transaction
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                  <input
                    type="text"
                    value={txForm.description}
                    onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                    placeholder="e.g. Project Revenue"
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Amount</label>
                    <input
                      type="number"
                      value={txForm.amount}
                      onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                      placeholder="0.00"
                      className="input-field font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Type</label>
                    <select
                      value={txForm.type}
                      onChange={(e) => setTxForm({ ...txForm, type: e.target.value as TransactionType })}
                      className="input-field appearance-none cursor-pointer"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                  <input
                    type="text"
                    value={txForm.category}
                    onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                    className="input-field"
                    placeholder="Operations"
                  />
                </div>
                <button
                  onClick={() => handleAddTransaction(isFirm)}
                  className="btn-primary w-full py-4 uppercase tracking-widest font-black text-sm"
                >
                  <Zap className="w-5 h-5 fill-current" /> Push to Box
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="font-black text-lg text-slate-900 tracking-tighter uppercase">Recent Ledger</h3>
              <div className="flex items-center gap-4 text-slate-400">
                <button className="p-2 hover:text-indigo-600 transition-colors"><Search className="w-5 h-5" /></button>
                <button className="p-2 hover:text-indigo-600 transition-colors"><Filter className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden border border-white/40 shadow-2xl shadow-slate-200/50">
              {txs.length === 0 ? (
                <div className="p-20 text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto outline outline-8 outline-slate-100/50">
                    <Box className="w-10 h-10 text-slate-300" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 uppercase tracking-tight text-xl">The Box is Empty</p>
                    <p className="text-slate-400 font-medium text-sm mt-1">Start recording your path to wealth.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Category</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                        <th className="px-8 py-5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {txs.map((t) => (
                        <motion.tr
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          key={t.id}
                          className="hover:bg-slate-50/80 transition-all group"
                        >
                          <td className="px-8 py-6">
                            <p className="text-xs font-mono text-slate-400 mb-1">{t.date}</p>
                            <span className="px-2.5 py-1 bg-white border border-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                              {t.category}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-md font-bold text-slate-900">{t.description}</p>
                          </td>
                          <td className={cn(
                            "px-8 py-6 text-xl font-black text-right font-mono tracking-tighter",
                            t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                          )}>
                            {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button
                              onClick={() => removeTransaction(t.id, isFirm)}
                              className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'personal-budget':
        return renderBudgetView(false);
      case 'firm-budget':
        return renderBudgetView(true);
      case 'bills':
        return (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Monthly Obligations</h2>
                <p className="text-slate-500 mt-2 font-medium max-w-lg">Track and manage recurring payments and subscriptions.</p>
              </div>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                <button className="px-6 py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Upcoming</button>
                <button className="px-6 py-2 text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all">History</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4 box-border">
                <div className="glass-panel p-8 rounded-3xl border border-white/40 shadow-2xl space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <Receipt className="w-6 h-6 text-indigo-600" /> New Bill
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                      <input
                        type="text"
                        value={billForm.description}
                        onChange={(e) => setBillForm({ ...billForm, description: e.target.value })}
                        placeholder="e.g. AWS Cloud Services"
                        className="input-field"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</label>
                        <input
                          type="number"
                          value={billForm.amount}
                          onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                          placeholder="0.00"
                          className="input-field"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</label>
                        <input
                          type="date"
                          value={billForm.dueDate}
                          onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddBill}
                      className="btn-primary w-full py-4 uppercase tracking-[0.2em] font-black"
                    >
                      Record Obligation
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <div className="glass-panel rounded-3xl overflow-hidden border border-white/40 shadow-2xl">
                  {bills.length === 0 ? (
                    <div className="p-20 text-center space-y-4">
                      <Clock className="w-12 h-12 text-slate-200 mx-auto" />
                      <p className="font-black text-slate-400 uppercase tracking-widest">No pending bills</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {bills.map(bill => (
                        <div key={bill.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-all">
                          <div className="flex items-center gap-6">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                              bill.isPaid ? "bg-emerald-50 text-emerald-500" : "bg-indigo-50 text-indigo-500"
                            )}>
                              <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 uppercase tracking-tight">{bill.description}</h4>
                              <p className="text-xs text-slate-400 font-bold mt-1">Due {bill.dueDate} • {bill.category}</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-8">
                            <div>
                              <p className="text-xl font-black font-mono tracking-tighter">${bill.amount.toLocaleString()}</p>
                              <p className={cn("text-[10px] font-black uppercase mt-1", bill.isPaid ? "text-emerald-500" : "text-rose-500")}>
                                {bill.isPaid ? 'Settled' : 'Pending'}
                              </p>
                            </div>
                            {!bill.isPaid && (
                              <button
                                onClick={() => markBillPaid(bill.id)}
                                className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black shadow-xl"
                              >
                                Pay Now
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'reports':
        const getReportData = () => {
          const txs = [...personalTransactions, ...firmTransactions];
          const { income, expenses, balance } = getStats(txs);
          return { income, expenses, balance };
        };
        const report = getReportData();
        return (
          <div className="space-y-12">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Strategic Analysis</h2>
                <p className="text-slate-500 mt-2 font-medium">Holistic view of your financial performance across all sectors.</p>
              </div>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                {['Weekly', 'Monthly', 'Annual'].map(p => (
                  <button key={p} className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    p === 'Monthly' ? "bg-white text-indigo-600 shadow-xl" : "text-slate-400 hover:text-slate-600"
                  )}>{p}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-panel p-10 rounded-[3rem] border border-white/40 shadow-2xl">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-indigo-100 shadow-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aggregate Income</h4>
                <p className={cn(
                  "text-4xl font-black font-mono tracking-tighter text-slate-900 transition-all duration-500",
                  security.privacyMode ? "blur-md select-none opacity-50" : "blur-0"
                )}>
                  ${report.income.toLocaleString()}
                </p>
              </div>
              <div className="glass-panel p-10 rounded-[3rem] border border-white/40 shadow-2xl">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6 shadow-rose-100 shadow-lg">
                  <TrendingUp className="w-6 h-6 rotate-180" />
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Burn Rate</h4>
                <p className={cn(
                  "text-4xl font-black font-mono tracking-tighter text-slate-900 transition-all duration-500",
                  security.privacyMode ? "blur-md select-none opacity-50" : "blur-0"
                )}>
                  ${report.expenses.toLocaleString()}
                </p>
              </div>
              <div className="glass-panel p-10 rounded-[3rem] border border-white/40 shadow-2xl bg-slate-900">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Net Growth</h4>
                <p className={cn(
                  "text-4xl font-black font-mono tracking-tighter text-white transition-all duration-500",
                  security.privacyMode ? "blur-md select-none opacity-50" : "blur-0"
                )}>
                  ${report.balance.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="glass-panel p-12 rounded-[3.5rem] border border-white/40 shadow-2xl min-h-[400px] flex items-center justify-center text-center">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto outline outline-8 outline-indigo-50/50">
                  <BarChart3 className="w-10 h-10 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Visualization Matrix Loading</h3>
                  <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">Integrating full visual analytics and transaction heatmaps for high-fidelity decision making.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'brand':
        return (
          <div className="space-y-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Brand OS</h2>
                <p className="text-slate-500 mt-2 font-medium max-w-lg">Unified design language for a high-performance financial command center.</p>
              </div>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                {(['light', 'dark', 'brand'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setLogoTheme(t)}
                    className={cn(
                      "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      logoTheme === t ? 'bg-white text-indigo-600 shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-10">
                <motion.div
                  layoutId="logo-preview"
                  className={cn(
                    "aspect-[21/9] rounded-[2.5rem] flex items-center justify-center relative overflow-hidden transition-all duration-700 shadow-2xl",
                    logoTheme === 'light' ? 'bg-white ring-1 ring-slate-100' :
                      logoTheme === 'dark' ? 'bg-slate-900' :
                        'bg-gradient-to-br from-indigo-600 to-purple-600'
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-8 px-12",
                    logoTheme === 'brand' || logoTheme === 'dark' ? 'text-white' : 'text-slate-900'
                  )}>
                    <LogoIcon className="w-32 h-32 drop-shadow-2xl animate-float" />
                    <span className="text-7xl font-black tracking-tighter">MoneyBox</span>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-panel p-8 rounded-3xl border border-white/40 shadow-xl shadow-slate-100">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Corporate Context</h3>
                    <div className="flex items-center justify-around p-4">
                      <div className="text-center group">
                        <Building2 className="w-12 h-12 text-indigo-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise</span>
                      </div>
                      <div className="w-[1px] h-16 bg-slate-100"></div>
                      <div className="text-center group">
                        <Briefcase className="w-12 h-12 text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SM Business</span>
                      </div>
                    </div>
                  </div>
                  <div className="glass-panel p-8 rounded-3xl border border-white/40 shadow-xl shadow-slate-100">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Digital Swatches</h3>
                    <div className="flex gap-4">
                      {BRAND_COLORS.slice(0, 4).map(c => (
                        <div key={c.hex} className={cn("h-16 flex-1 rounded-2xl shadow-inner border border-black/5", c.class)}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-10">
                <div className="glass-panel p-10 rounded-[2.5rem] border border-white/40 shadow-2xl shadow-indigo-100/50 flex flex-col justify-end min-h-[400px]">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Typography Standards</h3>
                  <div className="space-y-8">
                    <div>
                      <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest block mb-4">Display / Extra Bold</span>
                      <p className="text-5xl font-black tracking-tighter text-slate-900 leading-[0.9]">Absolute Clarity.</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-4">Body / Geometric</span>
                      <p className="text-slate-500 font-medium leading-relaxed text-sm">Engineered for readability across complex financial datasets and high-stakes decision making.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'logo-gen':
        return (
          <div className="max-w-6xl mx-auto space-y-20">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                <Sparkles className="w-3.5 h-3.5 fill-current" /> Neural Identity Engine
              </div>
              <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight uppercase">AI Logo Studio</h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">Generate industrial-grade visual identities using the latest generative models.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-1 space-y-8 lg:pt-12">
                <div className="flex flex-col gap-6 items-center">
                  <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 font-black italic">01</div>
                  <div className="w-[1px] h-12 bg-slate-100"></div>
                  <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 font-black italic">02</div>
                  <div className="w-[1px] h-12 bg-slate-100"></div>
                </div>
              </div>

              <div className="lg:col-span-5 glass-panel p-10 rounded-[3rem] border border-white/60 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                    Architectural Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-48 p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-indigo-50 focus:border-indigo-500 transition-all resize-none text-slate-800 font-bold text-lg leading-relaxed placeholder:text-slate-300 shadow-inner"
                    placeholder="Describe the aesthetic vision..."
                  />
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Style Presets</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { name: 'Dual Purpose Hybrid', prompt: 'Logo combining a house and a skyscraper into a geometric box, professional blue and indigo' },
                      { name: 'Enterprise Box', prompt: 'Minimalist corporate 3D box, high-tech finance aesthetic, sleek metallic finish, purple glow' },
                      { name: "Modern 'M' Monogram", prompt: 'Letter M formed by a path that creates a box in negative space, professional fintech style' }
                    ].map(style => (
                      <button
                        key={style.name}
                        onClick={() => {
                          setPrompt(style.prompt);
                          generateLogo(style.prompt);
                        }}
                        className="px-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all text-left flex items-center justify-between shadow-sm group"
                      >
                        {style.name}
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => generateLogo()}
                  disabled={isGenerating}
                  className="w-full py-6 bg-slate-900 text-white font-black rounded-[2rem] flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-sm"
                >
                  {isGenerating ? (
                    <RefreshCcw className="w-6 h-6 animate-spin" />
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Compile Assets</>
                  )}
                </button>
              </div>

              <div className="lg:col-span-5 relative">
                <motion.div
                  animate={isGenerating ? { scale: 0.98 } : { scale: 1 }}
                  className="aspect-square bg-white rounded-[3rem] shadow-[0_80px_100px_-30px_rgba(0,0,0,0.1)] border border-white/60 flex items-center justify-center overflow-hidden relative group"
                >
                  {generatedLogo ? (
                    <img src={generatedLogo} alt="Generated Logo" className="w-full h-full object-cover animate-fade-in transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="text-center p-16 space-y-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <LogoIcon className="w-40 h-40 mx-auto grayscale" />
                      <p className="font-black text-2xl uppercase tracking-tighter">Latent Space Preview</p>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6 shadow-2xl"></div>
                        <p className="text-white font-black uppercase tracking-[0.3em] text-xs animate-pulse">Quantizing Beauty...</p>
                      </div>
                    </div>
                  )}
                </motion.div>

                {generatedLogo && !isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-4"
                  >
                    <button className="px-10 py-5 bg-white shadow-2xl shadow-indigo-200 rounded-3xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-100">
                      <Download className="w-4 h-4 text-indigo-600" /> Save Concept
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-16">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Viral Engine</h2>
              <p className="text-slate-500 font-medium">Engineered captions for cross-platform market penetration.</p>
            </div>
            <div className="grid grid-cols-1 gap-12">
              {Object.entries(SOCIAL_TEMPLATES).map(([platform, posts], pIdx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: pIdx * 0.1 }}
                  key={platform}
                >
                  <h3 className="text-xs font-black mb-8 flex items-center gap-4 uppercase tracking-[0.2em] text-slate-400">
                    <span className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl",
                      platform === 'Instagram' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-pink-200' :
                        platform === 'Twitter' ? 'bg-black shadow-slate-200' : 'bg-blue-600 shadow-blue-200'
                    )}>
                      <ExternalLink className="w-5 h-5" />
                    </span>
                    {platform} Deployment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {posts.map((post, idx) => (
                      <div key={idx} className="glass-panel rounded-[2rem] border border-white/40 shadow-xl shadow-slate-100 overflow-hidden flex flex-col group">
                        <div className="p-10 flex-1">
                          <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 block border-b border-slate-50 pb-4">{post.title}</h4>
                          <div className="relative">
                            <pre className="whitespace-pre-wrap font-sans text-slate-700 text-sm leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100 shadow-inner group-hover:bg-white transition-colors">
                              {post.content}
                            </pre>
                            <div className="absolute top-4 right-4 text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Sparkles className="w-8 h-8" />
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopy(post.content, `${platform}-${idx}`)}
                          className="w-full py-6 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all active:bg-indigo-600"
                        >
                          {copiedId === `${platform}-${idx}` ? (
                            <><Check className="w-4 h-4 text-emerald-400" /> Success</>
                          ) : (
                            <><Copy className="w-4 h-4" /> Copy Protocol</>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="max-w-4xl mx-auto space-y-20">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Funnel Architect</h2>
              <p className="text-slate-500 font-medium">Conversion-optimized onboarding for individual and professional segments.</p>
            </div>
            <div className="space-y-10">
              {EMAIL_SEQUENCES.map((email, idx) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={email.day}
                  className="glass-panel rounded-[2.5rem] border border-white/60 shadow-2xl shadow-indigo-50 overflow-hidden"
                >
                  <div className="p-1.5 px-10 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.4em]">Checkpoint Day 0{email.day}</span>
                    <button
                      onClick={() => handleCopy(`Subject: ${email.subject}\n\n${email.body}`, `email-${email.day}`)}
                      className="p-3 hover:bg-white rounded-xl transition-all shadow-sm"
                    >
                      {copiedId === `email-${email.day}` ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5 text-slate-400 hover:text-indigo-600" />}
                    </button>
                  </div>
                  <div className="p-12">
                    <h3 className="text-2xl font-black mb-8 text-slate-900 leading-tight">Subject: <span className="font-medium text-slate-500 italic block mt-2 text-xl">{email.subject}</span></h3>
                    <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed bg-slate-50/30 p-8 rounded-3xl border border-slate-100 shadow-inner mb-10 whitespace-pre-line">
                      {email.body}
                    </div>
                    <div className="flex items-center justify-center p-6 bg-slate-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl cursor-not-allowed opacity-50 shadow-xl text-xs">
                      {email.cta}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-12">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Cinematic Protocol</h2>
                <p className="text-slate-500 font-medium">Auto-generated scripts and storyboards for high-engagement video content.</p>
              </div>
              <button className="btn-primary"><Video className="w-5 h-5" /> New Sequence</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "The Efficiency Reel", type: "Short Form", duration: "15s", icon: Zap },
                { title: "Corporate Trust Documentary", type: "Long Form", duration: "2m", icon: Shield }
              ].map((v, i) => (
                <div key={i} className="glass-panel p-8 rounded-[2.5rem] group cursor-pointer hover:shadow-2xl transition-all border border-white/40">
                  <div className="aspect-video bg-slate-900 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{v.type} • {v.duration}</p>
                      <h4 className="font-black text-slate-900">{v.title}</h4>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'ads':
        return (
          <div className="space-y-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Ad Engine</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[
                { channel: "Google Search", headline: "Control Your Firm's Future", desc: "The dual-purpose ledger for modern professionals.", color: "bg-blue-500" },
                { channel: "Meta Ads", headline: "One Box. Total Control.", desc: "Watch your personal and professional wealth grow in harmony.", color: "bg-indigo-600" },
                { channel: "LinkedIn", headline: "The OS for Small Firms", desc: "Automate expense reports and focus on what matters.", color: "bg-sky-700" }
              ].map((ad, i) => (
                <div key={i} className="glass-panel p-8 rounded-[2.5rem] flex flex-col justify-between min-h-[300px] border border-white/40 shadow-xl shadow-slate-100">
                  <div>
                    <span className={cn("px-4 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest", ad.color)}>
                      {ad.channel}
                    </span>
                    <h4 className="text-xl font-black text-slate-900 mt-6 leading-tight">{ad.headline}</h4>
                    <p className="text-slate-500 font-medium mt-4 text-sm">{ad.desc}</p>
                  </div>
                  <button className="w-full py-4 mt-8 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:bg-white transition-all">Preview Creative</button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'launch':
        return (
          <div className="space-y-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Launch Protocol</h2>
            <div className="glass-panel p-12 rounded-[3.5rem] border border-white/40 shadow-2xl shadow-slate-200/50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { step: "Phase 1", title: "Synthesis", status: "Completed", icon: Layers },
                  { step: "Phase 2", title: "Internal Test", status: "Active", icon: Target },
                  { step: "Phase 3", title: "Market Push", status: "Locked", icon: Megaphone },
                  { step: "Phase 4", title: "Global Scale", status: "Locked", icon: Building2 }
                ].map((p, i) => (
                  <div key={i} className="relative">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg",
                      p.status === 'Completed' ? "bg-emerald-500 text-white" :
                        p.status === 'Active' ? "bg-indigo-600 text-white animate-pulse" :
                          "bg-slate-100 text-slate-300"
                    )}>
                      <p.icon className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{p.step}</p>
                    <h4 className="font-black text-slate-900">{p.title}</h4>
                    <p className={cn(
                      "text-[10px] font-black uppercase mt-2",
                      p.status === 'Completed' ? "text-emerald-500" :
                        p.status === 'Active' ? "text-indigo-600" : "text-slate-300"
                    )}>{p.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Command Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="glass-panel p-12 rounded-[3rem] border border-white/40 shadow-xl">
                <h3 className="text-xl font-black mb-6 uppercase tracking-tight">Direct Uplink</h3>
                <div className="space-y-4">
                  <p className="text-slate-500 font-medium">Standard Response Time: &lt; 2 hours</p>
                  <button className="btn-primary w-full py-5"><Mail className="w-5 h-5" /> Open Ticket</button>
                </div>
              </div>
              <div className="glass-panel p-12 rounded-[3rem] border border-white/40 shadow-xl">
                <h3 className="text-xl font-black mb-6 uppercase tracking-tight">Knowledge Core</h3>
                <div className="space-y-4">
                  {["Asset Management Guide", "Firm Migration Protocol", "Security Whitepaper"].map((q, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-white transition-all">
                      <span className="text-sm font-bold text-slate-700">{q}</span>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-32 text-center space-y-8 glass-panel rounded-[3rem] border border-white/40">
            <Box className="w-24 h-24 mx-auto text-slate-200 animate-pulse" />
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Protocol Expansion</h2>
              <p className="text-slate-400 font-medium mt-2">Additional modules currently being synthesized.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {security.isLocked && security.pin && (
        <LockScreen
          enteredPin={enteredPin}
          setEnteredPin={setEnteredPin}
          onUnlock={handleUnlock}
          pinError={pinError}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-100 dark:border-slate-800 flex flex-col sticky top-0 h-auto md:h-screen z-50 overflow-y-auto transition-colors duration-500">
        <div className="p-10 border-b border-slate-50 dark:border-slate-800">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-3"
          >
            <LogoIcon className="w-10 h-10 text-indigo-600 drop-shadow-lg" />
            <h1 className="text-2xl font-black tracking-tighter uppercase">MoneyBox</h1>
          </motion.div>
          <div className="h-1 w-12 bg-indigo-600 rounded-full mb-3"></div>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">Hyperflow Control</p>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {NAVIGATION.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 relative group",
                  isActive
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-300 scale-[1.02]"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-indigo-400" : "text-slate-400")} />
                <span className="font-bold text-sm tracking-tight">{item.name}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="p-8 border-t border-slate-50 dark:border-slate-800 space-y-6">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
            {[
              { id: 'light', icon: Sun },
              { id: 'dark', icon: Moon },
              { id: 'cyber', icon: Zap }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as Theme)}
                className={cn(
                  "flex-1 flex items-center justify-center py-2 rounded-lg transition-all",
                  theme === t.id ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-md" : "text-slate-400"
                )}
              >
                <t.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {!security.pin ? (
            <button
              onClick={() => {
                const pin = prompt("Set a 4-digit PIN for security:");
                if (pin && pin.length === 4) handleSetPin(pin);
              }}
              className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" /> Setup Security
            </button>
          ) : (
            <button
              onClick={() => setSecurity({ ...security, isLocked: true })}
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
            >
              <Lock className="w-4 h-4" /> Lock Box
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-h-screen overflow-y-auto hide-scrollbar bg-slate-50/50">
        <header className="h-28 flex items-center justify-between px-12 border-b border-slate-100 sticky top-0 z-40 bg-white/80 backdrop-blur-3xl">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em]">
              {NAVIGATION.find(n => n.id === activeSection)?.name}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <button
                onClick={togglePrivacyMode}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  security.privacyMode ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {security.privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <div className="w-[1px] h-4 bg-slate-100"></div>
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={cn(
                    "p-2 transition-all",
                    notifications.some(n => !n.isRead) ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Bell className="w-4 h-4" />
                  {notifications.some(n => !n.isRead) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute top-full right-0 mt-4 w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden p-6 z-[60]"
                    >
                      <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest">In-App Alerts</h4>
                        <button
                          onClick={() => setNotifications(notifications.map(n => ({ ...n, isRead: true })))}
                          className="text-[8px] font-black text-indigo-600 uppercase tracking-widest"
                        >Clear All</button>
                      </div>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-center py-10 text-slate-400 text-xs font-medium">No new notifications</p>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={cn(
                              "p-4 rounded-2xl border transition-all",
                              n.isRead ? "bg-slate-50/50 border-slate-50" : "bg-indigo-50/30 border-indigo-100"
                            )}>
                              <div className="flex gap-4">
                                <div className={cn(
                                  "p-2 rounded-xl h-fit",
                                  n.type === 'alert' ? "bg-rose-100 text-rose-600" : "bg-indigo-100 text-indigo-600"
                                )}>
                                  {n.type === 'alert' ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                </div>
                                <div>
                                  <p className="font-black text-[10px] text-slate-900 uppercase tracking-tight">{n.title}</p>
                                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{n.message}</p>
                                  <p className="text-[8px] text-slate-400 mt-2 font-black uppercase">{new Date(n.date).toLocaleTimeString()}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-xl shadow-slate-200">MB</div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-12 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2026 MoneyBox Labs</p>
            <div className="flex gap-6">
              <Shield className="w-4 h-4" />
              <Lock className="w-4 h-4" />
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;
