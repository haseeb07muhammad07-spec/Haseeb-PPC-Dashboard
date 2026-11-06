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
  KeyRound
} from 'lucide-react';
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
    text: `Hello! I am your live **Amazon Operations & PPC AI Analyst**, connected with **Google Gemini 3.8 Flash**.\n\nI am currently analyzing **${currentAccount ? currentAccount.name : 'All Accounts'}**.\n\n📊 **Live Account Snapshot:**\n- **Ad Spend:** ${currency}${totalAdSpend.toLocaleString()} | **Ad Sales:** ${currency}${totalAdSales.toLocaleString()}\n- **ACOS:** ${currentAcos}% (Target: ≤ ${targetAcos}%)\n- **Stock Alerts:** ${lowStockItems.length} SKUs requiring attention\n- **PPC Bleeders Above Target:** ${bleederCampaigns.length} campaigns\n\nAap mujh se PPC bids, negative keywords, FBA stockout risks, ya client Slack updates ke baray mein koi bhi tactical question pooch saktay hain!`,
    timestamp: 'Just now'
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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

    try {
      let res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, context: contextPayload })
      });

      let contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        // Fallback for Netlify serverless function direct path
        res = await fetch('/.netlify/functions/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text, context: contextPayload })
        });
        contentType = res.headers.get('content-type') || '';
      }

      if (!contentType.includes('application/json')) {
        throw new Error('Netlify functions not yet compiled on host. Make sure public/_redirects is committed.');
      }

      const data = await res.json();
      const aiResponse = data.text || 'Gemini engine could not generate a response.';

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
    } catch (err: any) {
      console.error('Gemini API communication error:', err);
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **Server Connection Notice:**\n\nCould not reach \`/api/gemini/chat\`.\n\n*Netlify Users:* Make sure you added \`GEMINI_API_KEY\` in your Netlify site settings (Site configuration > Environment variables) and re-deployed.\n\n*Error details:* ${err.message || 'Network error'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyGuide(!showKeyGuide)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-violet-600" />
            <span>API Key Setup Guide</span>
          </button>
        </div>
      </div>

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
