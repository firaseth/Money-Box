
import React, { useState, useEffect, useMemo } from 'react';
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
  Search
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Transaction, TransactionType } from './types';

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

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('personal-budget');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [logoTheme, setLogoTheme] = useState<'light' | 'dark' | 'brand'>('light');
  
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
    localStorage.setItem('personal_tx', JSON.stringify(personalTransactions));
  }, [personalTransactions]);

  useEffect(() => {
    localStorage.setItem('firm_tx', JSON.stringify(firmTransactions));
  }, [firmTransactions]);

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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const fullPrompt = `MoneyBox Brand Logo concept for individuals and firms: ${activePrompt}. Use a color palette of deep indigo (#4F46E5) and vibrant purple (#9333EA). Professional fintech style, high fidelity, 4k. Themes: growth, security, stability.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedLogo(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error("Logo generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderBudgetView = (isFirm: boolean) => {
    const txs = isFirm ? firmTransactions : personalTransactions;
    const { income, expenses, balance } = getStats(txs);
    const title = isFirm ? "Firm Budget Control" : "Personal Budget personality";

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-500">Manage all your {isFirm ? 'business operations' : 'personal finances'} in one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Income</span>
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 font-mono">${income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Expenses</span>
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 font-mono">${expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-100 text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-indigo-100 uppercase tracking-wider">Net Balance</span>
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold font-mono">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Transaction Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" /> Add Transaction
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                  <input 
                    type="text" 
                    value={txForm.description}
                    onChange={(e) => setTxForm({...txForm, description: e.target.value})}
                    placeholder="e.g. Salary, Rent, Office Supplies"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount</label>
                    <input 
                      type="number" 
                      value={txForm.amount}
                      onChange={(e) => setTxForm({...txForm, amount: e.target.value})}
                      placeholder="0.00"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Type</label>
                    <select 
                      value={txForm.type}
                      onChange={(e) => setTxForm({...txForm, type: e.target.value as TransactionType})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <input 
                    type="text" 
                    value={txForm.category}
                    onChange={(e) => setTxForm({...txForm, category: e.target.value})}
                    placeholder="General"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Date</label>
                  <input 
                    type="date" 
                    value={txForm.date}
                    onChange={(e) => setTxForm({...txForm, date: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={() => handleAddTransaction(isFirm)}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Add to Box
                </button>
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900">Recent Transactions</h3>
              <div className="flex items-center gap-2 text-gray-400">
                <Search className="w-4 h-4" />
                <Filter className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {txs.length === 0 ? (
                <div className="p-12 text-center text-gray-400 space-y-4">
                  <Box className="w-12 h-12 mx-auto opacity-20" />
                  <p>No transactions yet. Start your first box!</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {txs.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">{t.date}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{t.description}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">{t.category}</span>
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold text-right font-mono ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => removeTransaction(t.id, isFirm)}
                            className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      case 'brand':
        return (
          <div className="space-y-16 animate-in fade-in duration-500">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Brand Identity</h2>
                  <p className="text-gray-500">Dual-purpose design: Empowering individual savings and firm-wide efficiency.</p>
                </div>
                <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                  {(['light', 'dark', 'brand'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setLogoTheme(t)}
                      className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                        logoTheme === t ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Primary Logo Preview */}
                <div className="lg:col-span-2 space-y-8">
                  <div className={`aspect-[21/9] rounded-3xl flex items-center justify-center relative overflow-hidden transition-all duration-500 shadow-xl ${
                    logoTheme === 'light' ? 'bg-white border border-gray-100' :
                    logoTheme === 'dark' ? 'bg-gray-900' :
                    'bg-gradient-to-br from-indigo-600 to-purple-600'
                  }`}>
                    <div className={`flex items-center gap-6 ${
                      logoTheme === 'brand' || logoTheme === 'dark' ? 'text-white' : 'text-indigo-600'
                    }`}>
                      <LogoIcon className="w-24 h-24 drop-shadow-2xl" />
                      <span className="text-6xl font-bold tracking-tighter">MoneyBox</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Firm Context</h3>
                      <div className="flex items-center justify-around p-8 bg-gray-50 rounded-xl">
                        <div className="flex flex-col items-center gap-2">
                           <Building2 className="w-8 h-8 text-indigo-600" />
                           <span className="text-[10px] font-bold text-gray-400 uppercase">Enterprise</span>
                        </div>
                        <div className="w-[1px] h-12 bg-gray-200"></div>
                        <div className="flex flex-col items-center gap-2">
                           <Briefcase className="w-8 h-8 text-purple-600" />
                           <span className="text-[10px] font-bold text-gray-400 uppercase">SMB / Freelance</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Core Palette</h3>
                      <div className="flex gap-2 p-4 bg-gray-50 rounded-xl">
                        {BRAND_COLORS.slice(0, 3).map(c => (
                          <div key={c.hex} className={`h-12 flex-1 rounded-lg ${c.class} shadow-sm border border-black/5`}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messaging Specs */}
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Typography</h3>
                    <div className="space-y-6">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block mb-2 uppercase">Headings / Bold</span>
                        <p className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">Professional clarity for every dollar.</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block mb-2 uppercase">Body / Medium</span>
                        <p className="text-gray-600 leading-relaxed text-sm">Control operating expenses and personal goals in a single, high-fidelity command center.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dual Purpose Concept Gallery */}
            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Logo Concept Gallery: Individual & Firm</h3>
                <p className="text-gray-500">Strategic visual directions that bridge personal goals with professional enterprise.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {[
                  { name: "The Unified Box", icon: Box, desc: "A singular 3D container split into two shades, representing the unity of personal and firm accounts.", color: "text-indigo-600" },
                  { name: "Enterprise Shield", icon: Shield, desc: "A robust box silhouette with a geometric bolt, emphasizing the high-security needs of firms.", color: "text-purple-600" },
                  { name: "Profit Prism", icon: TrendingUp, desc: "A glassmorphic box showing ascending data blocks, representing the growth of both savings and revenue.", color: "text-blue-600" },
                  { name: "Strategic Goal", icon: Target, desc: "A concentric box design focusing on 'the bottom line' - perfect for corporate targets.", color: "text-emerald-600" },
                  { name: "Hybrid Monogram", icon: Building2, desc: "A modern 'M' whose legs form both a house (Individual) and a skyscraper (Firm).", color: "text-amber-600" }
                ].map((concept, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-default">
                    <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${concept.color}`}>
                      <concept.icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{concept.name}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{concept.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'logo-gen':
        return (
          <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3" /> Powered by Gemini
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">AI Logo Studio</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Generate high-fidelity concepts that visually unify personal budgeting and firm management.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-8">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    Visual Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all resize-none text-gray-700 font-medium"
                    placeholder="Describe the dual-purpose concept..."
                  />
                </div>

                <div className="space-y-4">
                   <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Industry Presets</h4>
                   <div className="grid grid-cols-2 gap-3">
                     {[
                       { name: 'Dual Purpose Hybrid', prompt: 'Logo combining a house and a skyscraper into a geometric box, professional blue and indigo' },
                       { name: 'Enterprise Box', prompt: 'Minimalist corporate 3D box, high-tech finance aesthetic, sleek metallic finish, purple glow' },
                       { name: 'Growth Ledger', prompt: 'Abstract bar chart inside a semi-transparent box, representing firm profit and individual growth' },
                       { name: "Modern 'M' Monogram", prompt: 'Letter M formed by a path that creates a box in negative space, professional fintech style' }
                     ].map(style => (
                       <button
                         key={style.name}
                         onClick={() => {
                           setPrompt(style.prompt);
                           generateLogo(style.prompt);
                         }}
                         className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all text-left flex items-center justify-between"
                       >
                         {style.name}
                         <ChevronRight className="w-3 h-3" />
                       </button>
                     ))}
                   </div>
                </div>

                <button
                  onClick={() => generateLogo()}
                  disabled={isGenerating}
                  className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <RefreshCcw className="w-6 h-6 animate-spin" />
                  ) : (
                    <><Sparkles className="w-6 h-6" /> Generate Concept</>
                  )}
                </button>
              </div>

              <div className="relative group">
                <div className="aspect-square bg-white rounded-3xl shadow-2xl border border-gray-100 flex items-center justify-center overflow-hidden relative">
                  {generatedLogo ? (
                    <img src={generatedLogo} alt="Generated Logo" className="w-full h-full object-cover animate-in zoom-in-95 duration-500" />
                  ) : (
                    <div className="text-center p-12 space-y-4 opacity-20">
                      <LogoIcon className="w-32 h-32 mx-auto grayscale" />
                      <p className="font-bold text-lg">Visualizing individual & firm harmony...</p>
                    </div>
                  )}
                  
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-indigo-600 font-bold animate-pulse">Designing the future of finance...</p>
                      </div>
                    </div>
                  )}
                </div>

                {generatedLogo && !isGenerating && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                    <button className="px-6 py-3 bg-white shadow-xl rounded-full flex items-center gap-2 text-sm font-bold hover:bg-gray-50 transition-all border border-gray-100">
                      <Download className="w-4 h-4" /> Export Asset
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-12">
            <h2 className="text-3xl font-bold text-gray-900">Social Media Templates</h2>
            <div className="grid grid-cols-1 gap-8">
              {Object.entries(SOCIAL_TEMPLATES).map(([platform, posts]) => (
                <div key={platform}>
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                      platform === 'Instagram' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' :
                      platform === 'Twitter' ? 'bg-black' : 'bg-blue-600'
                    }`}>
                      <ExternalLink className="w-4 h-4" />
                    </span>
                    {platform} Post Templates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post, idx) => (
                      <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 flex-1">
                          <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">{post.title}</h4>
                          <pre className="whitespace-pre-wrap font-sans text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                            {post.content}
                          </pre>
                        </div>
                        <button
                          onClick={() => handleCopy(post.content, `${platform}-${idx}`)}
                          className="w-full py-4 bg-gray-900 text-white font-semibold flex items-center justify-center gap-2 hover:bg-black transition-colors"
                        >
                          {copiedId === `${platform}-${idx}` ? (
                            <><Check className="w-4 h-4" /> Copied!</>
                          ) : (
                            <><Copy className="w-4 h-4" /> Copy Caption</>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Dual-Track Onboarding Sequence</h2>
              <p className="text-gray-600">Engagement strategies for both individual savers and firm administrators.</p>
            </div>
            <div className="space-y-6">
              {EMAIL_SEQUENCES.map((email) => (
                <div key={email.day} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-1 px-6 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Day {email.day}</span>
                    <button 
                      onClick={() => handleCopy(`Subject: ${email.subject}\n\n${email.body}`, `email-${email.day}`)}
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                      {copiedId === `email-${email.day}` ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                  <div className="p-8">
                    <h3 className="text-lg font-bold mb-4">Subject: <span className="font-normal text-gray-600">{email.subject}</span></h3>
                    <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line mb-8">
                      {email.body}
                    </div>
                    <div className="flex items-center justify-center py-4 bg-indigo-600 text-white font-bold rounded-xl cursor-not-allowed">
                      {email.cta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div className="p-12 text-center text-gray-500">Feature under construction. Please check back later!</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-auto md:h-screen overflow-y-auto z-50">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <LogoIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight">MoneyBox</h1>
          </div>
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Unified Expense Tracker</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAVIGATION.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="font-semibold text-sm">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-12 bg-gray-50 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default App;
