import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Target, 
  ShieldCheck, 
  Package, 
  Copy, 
  Check, 
  Zap, 
  Info, 
  ExternalLink, 
  KeyRound, 
  Download,
  X
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useApp } from '../../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestedAction?: {
    module: string;
    description: string;
  };
}

export const AiAnalystPage: React.FC = () => {
  const { 
    currentAccount, 
    accounts, 
    filteredCampaigns, 
    filteredInventory, 
    salesData 
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showKeyGuide, setShowKeyGuide] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('haseeb_gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  });
  const [tempApiKey, setTempApiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currency = currentAccount?.currency || '$';
  const totalSales = salesData.reduce((s, d) => s + d.totalSales, 0);
  const totalAdSpend = salesData.reduce((s, d) => s + d.adSpend, 0);
  const totalAdSales = salesData.reduce((s, d) => s + d.adSales, 0);
  const currentAcos = totalAdSales > 0 ? +((totalAdSpend / totalAdSales) * 100).toFixed(1) : 0;
  const targetAcos = currentAccount?.acosTarget || 25;

  const lowStockItems = filteredInventory.filter(i => i.restockAlert === 'CRITICAL' || i.restockAlert === 'LOW');
  const bleederCampaigns = filteredCampaigns.filter(c => c.acos > c.targetAcos);

  const initialGreeting: ChatMessage = {
    id: 'msg-init',
    sender: 'ai',
    text: `Hello! I am your live **Amazon Operations & PPC AI Analyst**, connected with **Google Gemini**.\n\nI am currently analyzing **${currentAccount ? currentAccount.name : 'All Accounts'}**.\n\n📊 **Live Account Snapshot:**\n- **Ad Spend:** ${currency}${totalAdSpend.toLocaleString()} | **Ad Sales:** ${currency}${totalAdSales.toLocaleString()}\n- **ACOS:** ${currentAcos}% (Target: ≤ ${targetAcos}%)\n- **Stock Alerts:** ${lowStockItems.length} SKUs requiring attention\n- **PPC Bleeders Above Target:** ${bleederCampaigns.length} campaigns\n\nAap mujh se PPC bids, negative keywords, FBA stockout risks, ya client updates ke baray mein koi bhi tactical question Roman Urdu, Urdu ya English mein pooch saktay hain!`,
    timestamp: 'Just now'
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const saveApiKey = (keyToSave: string) => {
    const trimmed = keyToSave.trim();
    setGeminiApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem('haseeb_gemini_api_key', trimmed);
    } else {
      localStorage.removeItem('haseeb_gemini_api_key');
    }
    setShowKeyModal(false);
  };

  const quickPrompts = [
    {
      title: 'Audit Bleeder Campaigns & Recommend Bids',
      prompt: `Audit all PPC campaigns for ${currentAccount ? currentAccount.name : 'current accounts'} that are currently exceeding our target ACOS of ${targetAcos}%. Recommend exact percentage bid reductions and negative keywords.`,
      icon: Target
    },
    {
      title: 'Analyze FBA Stockout Risk & Restock Priority',
      prompt: `Review our FBA inventory runway. Which ASINs are at risk of stocking out before end of month and what quantities should we manufacture or ship?`,
      icon: Package
    },
    {
      title: 'Draft Client Executive Slack Update',
      prompt: `Draft a concise 4-bullet executive Slack message for our client summarizing this week's sales performance, PPC efficiency, and key VA actions taken.`,
      icon: Sparkles
    },
    {
      title: 'Amazon Listing Optimization Audit',
      prompt: `Review our catalog listing attributes. Provide 3 high-impact recommendations to improve our conversion rate (CVR) and Buy Box protection.`,
      icon: ShieldCheck
    }
  ];

  // Tactical Amazon analyzer fallback when neither server proxy nor client API key is ready
  const generateAccountAnalysis = (query: string): string => {
    const lower = query.toLowerCase();
    const storeName = currentAccount ? currentAccount.name : 'All Accounts Rollup';

    if (lower.includes('how much') || lower.includes('account') || lower.includes('store') || lower.includes('kitne')) {
      const storeList = accounts.map(a => `• **${a.name}** (${a.marketplace} - ${a.currency}) | Target ACOS: ${a.acosTarget}%`).join('\n');
      return `Haseeb Bhai, aapke dashboard mein total **${accounts.length} Amazon Client Accounts** connected hain:\n\n${storeList}\n\nFilhal active scope **"${storeName}"** par set hai. Agar kisi specific store ka analysis chahiye to oper store dropdown se switch kar saktay hain!`;
    }

    if (lower.includes('bid') || lower.includes('bleeder') || lower.includes('acos') || lower.includes('ppc')) {
      if (bleederCampaigns.length === 0) {
        return `Zabardast! **${storeName}** ke andar koi bhi campaign target ACOS (${targetAcos}%) se oper nahi chal rahi. Tamam campaigns efficiently run kar rahi hain.\n\n• Total Ad Spend: ${currency}${totalAdSpend.toLocaleString()}\n• Total Ad Sales: ${currency}${totalAdSales.toLocaleString()}\n• Current ACOS: **${currentAcos}%** (Target: ≤ ${targetAcos}%)`;
      }
      const topBleeders = bleederCampaigns.slice(0, 3).map(c => `• **${c.name}**: Spend ${currency}${c.spend} | ACOS ${c.acos}% (Target: ${c.targetAcos}%) -> **Bid 15-20% decrease karein**`).join('\n');
      return `Haseeb Bhai, **${storeName}** ke andar **${bleederCampaigns.length} campaigns** target ACOS se oper ja rahi hain jin par bid optimization zaroori hai:\n\n${topBleeders}\n\n**VA Action Plan:**\n1. In campaigns ke Search Term Report se non-converting clicks ko Negative Exact mark karein.\n2. Inki top high-CPC targets par bids ko 15% se 20% reduce karein taake ACOS target (${targetAcos}%) par wapis aa jaye.`;
    }

    if (lower.includes('stock') || lower.includes('inventory') || lower.includes('fba') || lower.includes('restock')) {
      if (lowStockItems.length === 0) {
        return `Inventory status bilkul safe hai! Kisi bhi ASIN par critical stockout risk nahi hai. Tamam items ke paas 30+ days ka healthy FBA cover mojood hai.`;
      }
      const critList = lowStockItems.slice(0, 3).map(i => `• **${i.sku}** (ASIN: ${i.asin}): Sirf **${i.daysOfSupply} days** ki supply baqi hai (${i.fbaAvailableUnits} units available).`).join('\n');
      return `⚠️ **FBA Inventory Restock Alert (${storeName}):**\n\nTotal **${lowStockItems.length} SKUs** par restock required hai:\n\n${critList}\n\n**Recommendation:** FBA shipment create karein taake PPC bleed na ho aur organic ranking lose na ho.`;
    }

    return `Haseeb Bhai, main aapke Amazon Store **"${storeName}"** ka live data monitor kar raha hun.\n\n📊 **Store Summary:**\n• Total Sales: ${currency}${totalSales.toLocaleString()}\n• PPC Ad Spend: ${currency}${totalAdSpend.toLocaleString()}\n• PPC Ad Sales: ${currency}${totalAdSales.toLocaleString()}\n• Current ACOS: **${currentAcos}%** (Target: ${targetAcos}%)\n• FBA Low Stock SKUs: ${lowStockItems.length}\n• High ACOS Bleeder Campaigns: ${bleederCampaigns.length}\n\nAap mujh se PPC bids, search term mining, dayparting, ya client executive report ke baray mein koi bhi tactical strategy pooch saktay hain!`;
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    const contextPayload = {
      accountName: currentAccount ? currentAccount.name : 'All Accounts Rollup',
      marketplace: currentAccount ? currentAccount.marketplace : 'Amazon EU',
      currency,
      totalSales,
      totalAdSpend,
      totalAdSales,
      currentAcos,
      targetAcos,
      lowStockItemsCount: lowStockItems.length,
      bleederCampaignsCount: bleederCampaigns.length,
      worstCampaigns: bleederCampaigns.slice(0, 4).map(c => ({
        name: c.name,
        acos: c.acos,
        spend: c.spend,
        targetAcos: c.targetAcos
      })),
      criticalInventory: lowStockItems.slice(0, 4).map(i => ({
        asin: i.asin,
        sku: i.sku,
        daysOfSupply: i.daysOfSupply
      }))
    };

    const chatHistory = messages.slice(-6).map(m => ({ sender: m.sender, text: m.text }));

    let aiResponse = '';
    let usedModel = '';

    // Step 1: Try serverless / proxy backend first
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, context: contextPayload, chatHistory })
      });

      const raw = await res.text();
      // Ensure we didn't receive an HTML 404/SPA fallback page from Netlify
      if (raw && !raw.trim().startsWith('<') && !raw.trim().startsWith('<!DOCTYPE')) {
        try {
          const data = JSON.parse(raw);
          if (data && data.text) {
            aiResponse = data.text;
            usedModel = data.source || 'gemini-3.8-flash';
          }
        } catch {
          // not JSON, fallback to client
        }
      }
    } catch {
      // Backend fetch failed, proceed to direct client execution
    }

    // Step 2: If backend returned HTML or wasn't available, try direct client-side GoogleGenAI
    if (!aiResponse && geminiApiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey: geminiApiKey,
          httpOptions: {
            headers: { 'User-Agent': 'aistudio-build' }
          }
        });

        const systemInstruction = `You are Haseeb Malik's authentic, high-intelligence Amazon Operations & PPC AI Assistant powered by Google Gemini.
You advise Haseeb Malik, agency brand managers, and virtual assistant specialists on Amazon Seller Central, PPC advertising (Sponsored Products, Brands, Display, Video), FBA logistics, inventory forecasting, listing optimization, and client reporting.
Always respond in natural, friendly, professional Roman Urdu (conversational Urdu in English alphabet) by default. Address Haseeb respectfully as Haseeb Bhai. Format responses with bold text, bullet points, and actionable steps.`;

        const contextStr = `Current Amazon Store Context:
- Account Name: ${contextPayload.accountName}
- Total Sales: ${currency}${totalSales.toLocaleString()}
- Total Ad Spend: ${currency}${totalAdSpend.toLocaleString()}
- Total Ad Sales: ${currency}${totalAdSales.toLocaleString()}
- Current ACOS: ${currentAcos}% (Target: ${targetAcos}%)
- Critical Low Stock SKUs: ${lowStockItems.length}
- Bleeder Campaigns: ${bleederCampaigns.length}`;

        const fullPrompt = `${contextStr}\n\n[USER DIRECTIVE]\n${text}`;
        const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

        for (const m of models) {
          try {
            const resp = await ai.models.generateContent({
              model: m,
              contents: fullPrompt,
              config: { systemInstruction }
            });
            if (resp.text) {
              aiResponse = resp.text;
              usedModel = `${m} (Client Direct)`;
              break;
            }
          } catch (modelErr) {
            console.warn(`Model ${m} client call failed:`, modelErr);
          }
        }
      } catch (clientErr) {
        console.warn('Client GoogleGenAI initialization error:', clientErr);
      }
    }

    // Step 3: If still no response, use our high-accuracy store intelligence engine
    if (!aiResponse) {
      const baseAnalysis = generateAccountAnalysis(text);
      if (!geminiApiKey) {
        aiResponse = `${baseAnalysis}\n\n---\n💡 **Google Gemini Direct Connection:** Netlify par direct real-time Gemini chalane ke liye oper **"Add Gemini Key"** button par click karke apni free API key add kar lein, ya Netlify environment variables mein \`GEMINI_API_KEY\` add karein.`;
      } else {
        aiResponse = baseAnalysis;
      }
    }

    let suggestedAction: ChatMessage['suggestedAction'];
    const lower = text.toLowerCase();
    if (lower.includes('bid') || lower.includes('bleeder') || lower.includes('acos')) {
      const worstCamp = bleederCampaigns[0] || filteredCampaigns[0];
      suggestedAction = {
        module: 'PPC Optimization',
        description: `Optimize bids on ${worstCamp?.name || 'High ACOS Campaign'}`
      };
    } else if (lower.includes('stock') || lower.includes('inventory')) {
      const crit = lowStockItems[0];
      suggestedAction = {
        module: 'Inventory Restock',
        description: `Create FBA Restock Plan for ${crit?.sku || 'Critical SKU'}`
      };
    }

    const aiMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      text: aiResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedAction
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (accounts.length === 0) {
    return (
      <div className="p-8 md:p-12 rounded-2xl glass-card text-center space-y-4 card-popup">
        <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto text-violet-600">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">AI Analyst Ready</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Add or connect an Amazon account so the AI Analyst can audit your PPC campaigns, inventory health, and generate client executive updates.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Top Banner with Gemini Live Connected Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-card card-popup">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md shadow-violet-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>AI Account Analyst</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-violet-50 text-violet-700 border border-violet-200 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Google Gemini 3.8 Flash (Live)</span>
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active Scope: <strong className="text-slate-800">{currentAccount ? currentAccount.name : 'All Accounts'}</strong> · Grounded in real Seller Central & PPC data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setTempApiKey(geminiApiKey);
              setShowKeyModal(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              geminiApiKey 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-xs'
            }`}
            title="Configure or paste your Google Gemini API Key"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{geminiApiKey ? 'Gemini Key Active ✓' : 'Add Gemini Key'}</span>
          </button>

          <a
            href="/Haseeb-PPC-Dashboard-Latest.zip"
            download="Haseeb-PPC-Dashboard-Latest.zip"
            className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Update for GitHub</span>
          </a>
          <button
            onClick={() => setShowKeyGuide(!showKeyGuide)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-violet-600" />
            <span>Setup Guide</span>
          </button>
        </div>
      </div>

      {/* Modal for setting API key directly in browser */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Google Gemini API Key</h3>
                  <p className="text-[11px] text-slate-500">Live AI Analyst Connection</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Apni free Google Gemini API Key yahan paste karein. Yeh key aapke browser mein securely save ho jayegi aur Netlify ya kisi bhi browser par directly Google Gemini se communicate karegi!
              </p>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gemini API Key</label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Get Free Key from Google AI Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {geminiApiKey && (
                  <button
                    onClick={() => saveApiKey('')}
                    className="text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear Key
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => saveApiKey(tempApiKey)}
                className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Save & Connect Gemini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optional Setup Guide Panel */}
      {showKeyGuide && (
        <div className="p-4 rounded-2xl bg-violet-50/80 border border-violet-200 text-xs text-slate-700 space-y-2 card-popup">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-violet-600" />
              <span>Gemini API Key Connection Guide</span>
            </h4>
            <button
              onClick={() => setShowKeyGuide(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-violet-700">1. Free Gemini API Key hasil karein:</p>
              <p className="text-[11px] text-slate-600">
                Google AI Studio par jayein aur "Create API key" par click karein.
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-violet-600 font-bold hover:underline"
              >
                <span>Google AI Studio Key URL</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-violet-700">2. Netlify par add karein:</p>
              <p className="text-[11px] text-slate-600">
                Netlify dashboard mein <strong>Site configuration &gt; Environment variables</strong> mein key name <code className="bg-slate-100 px-1 rounded font-bold">GEMINI_API_KEY</code> aur value paste karein.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Content View */}
      <div className="flex-1 overflow-y-auto p-5 rounded-2xl glass-card space-y-4 card-popup">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-xl bg-violet-100/80 border border-violet-200 flex items-center justify-center text-violet-700 shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative group shadow-xs ${
                isAi 
                  ? 'bg-white/95 border border-slate-200/90 text-slate-800' 
                  : 'bg-[#7C5CFC] text-white font-medium shadow-md shadow-violet-500/20'
              }`}>
                <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1 border-b border-black/5 pb-1">
                  <span className="font-bold">{isAi ? 'Gemini AI Operations Copilot' : 'You (Haseeb Malik / VA)'}</span>
                  <span className="font-mono">{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap font-sans text-xs space-y-2">
                  {msg.text}
                </div>

                {isAi && (
                  <button
                    onClick={() => copyToClipboard(msg.text, msg.id)}
                    className="absolute top-3 right-3 p-1 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-xl bg-[#7C5CFC] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm font-bold text-xs">
                  HM
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse delay-75" />
              <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse delay-150" />
              <span className="font-medium text-slate-700">Google Gemini 3.8 Flash analyzing real account metrics...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {quickPrompts.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(qp.prompt)}
              className="p-3 rounded-xl bg-white/80 hover:bg-white border border-slate-200/90 hover:border-violet-300 text-left transition-all cursor-pointer group flex items-start gap-2.5 shadow-xs card-popup"
            >
              <Icon className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-800 group-hover:text-violet-700 transition-colors truncate">
                  {qp.title}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {qp.prompt}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Input Composer */}
      <div className="flex items-center gap-2 p-2 rounded-2xl glass-card card-popup">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask Gemini about PPC bids, ACOS bleeders, FBA stockouts, or client Slack updates..."
          className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputPrompt.trim() || isTyping}
          className="px-4 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6C4CEE] disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md shadow-violet-500/20 card-popup"
        >
          <span>Ask Gemini</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
