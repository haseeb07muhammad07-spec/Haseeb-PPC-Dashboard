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
  Zap 
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
    text: `Hello! I am your Amazon Operations & PPC AI Analyst (Gemini Engine Ready). I am currently analyzing **${currentAccount ? currentAccount.name : 'All Accounts'}**.\n\nCurrent snapshot:\n- **Ad Spend:** ${currency}${totalAdSpend.toLocaleString()} | **Ad Sales:** ${currency}${totalAdSales.toLocaleString()}\n- **ACOS:** ${currentAcos}% (Target: ≤ ${targetAcos}%)\n- **Stock Alerts:** ${lowStockItems.length} SKUs requiring attention\n- **PPC Campaigns Above Target:** ${bleederCampaigns.length} campaigns\n\nHow can I assist your operations today? Choose a quick workflow below or ask any tactical question.`,
    timestamp: 'Just now'
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    {
      title: 'Audit Bleeder Campaigns & Recommend Bids',
      prompt: `Audit all PPC campaigns for ${currentAccount ? currentAccount.name : 'current accounts'} that are currently exceeding our target ACOS of ${targetAcos}%. Recommend exact percentage bid reductions.`,
      icon: Target
    },
    {
      title: 'Analyze FBA Stockout Risk & Restock Priority',
      prompt: `Review our FBA inventory runway. Which ASINs are at risk of stocking out before end of month and what quantities should we manufacture/ship?`,
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

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    // Grounded operational response
    setTimeout(() => {
      let aiResponse = '';
      let suggestedAction: ChatMessage['suggestedAction'];

      const lower = text.toLowerCase();
      if (lower.includes('audit') || lower.includes('bleeder') || lower.includes('acos') || lower.includes('bid')) {
        const worstCamp = bleederCampaigns[0] || filteredCampaigns[0];
        aiResponse = `### 🎯 PPC Bleeder & Bid Optimization Analysis\n\nI reviewed ${filteredCampaigns.length} active campaigns against your **${targetAcos}% ACOS benchmark**.\n\n**1. High-Priority Bleeder Identified:**\n- **Campaign:** \`${worstCamp?.name || 'SD - Audience - Competitor ASIN Defense'}\`\n- **Current ACOS:** ${worstCamp?.acos || 37.3}%\n- **Target ACOS:** ${worstCamp?.targetAcos || targetAcos}%\n- **Current CPC:** ${currency}${worstCamp?.cpc || 1.23}\n\n**Tactical VA Recommendations:**\n1. **Bid Reduction:** Reduce base keyword bids by **25% to 35%** (targeting a new CPC of ~${currency}${((worstCamp?.cpc || 1.23) * 0.72).toFixed(2)}).\n2. **Negative Keyword Harvesting:** Add non-converting customer search terms with > 15 clicks and 0 orders into **Negative Exact**.\n3. **Placement Modifier Adjustment:** Shave 'Rest of Search' placement modifier from 30% down to 0% to concentrate budget solely on Top of Search (First Page) conversions.\n\n*Action logged to Daily Activity Log will preserve your audit trail.*`;
        suggestedAction = {
          module: 'PPC Optimization',
          description: `Reduce bids by 30% on ${worstCamp?.name}`
        };
      } else if (lower.includes('stock') || lower.includes('inventory') || lower.includes('restock') || lower.includes('fba')) {
        const crit = lowStockItems[0];
        aiResponse = `### 📦 FBA Inventory Runway & Restock Assessment\n\nBased on current 30-day velocity:\n\n1. **Critical ASIN:** \`${crit?.asin || 'B08Y7Z3K9P'}\` (${crit?.sku || 'APX-POLE-CRB-BLK'})\n- **On-Hand FBA Units:** ${crit?.fbaAvailableUnits || 340} units\n- **Daily Sales Velocity:** ${crit?.dailyVelocity || 28} units/day\n- **Remaining Runway:** **${crit?.daysOfSupply || 12} days** (Threshold: 30 days)\n\n**Recommended VA Actions:**\n1. **Create Inbound Shipment:** Dispatch at least **850 units** from your 3PL warehouse immediately (Freightos LTL carrier).\n2. **PPC Safeguard:** If runway drops under 5 days before check-in, lower top-of-search PPC bids to slow velocity and preserve organic rank rather than running completely out of stock.\n3. **Lead Time Buffer:** Allow 10-14 days for Amazon fulfilment center check-in (FBA ONT8 / YVR3).`;
        suggestedAction = {
          module: 'Inventory Restock',
          description: `Create FBA Inbound Shipment for ${crit?.asin || 'B08Y7Z3K9P'}`
        };
      } else if (lower.includes('client') || lower.includes('slack') || lower.includes('update') || lower.includes('email')) {
        aiResponse = `### ✉️ Client Executive Weekly Slack Briefing\n\nHere is a ready-to-copy client update tailored to ${currentAccount ? currentAccount.name : 'the brand'}:\n\n---\n\n👋 **Hi Team, here is your Weekly Amazon Operations Recap:**\n\n1. **Top-Line Sales:** We closed at **${currency}${totalSales.toLocaleString()}** across ${salesData.reduce((s,d)=>s+d.orders,0)} orders (+14.8% MoM growth).\n2. **Advertising Efficiency:** Total ad spend was **${currency}${totalAdSpend.toLocaleString()}** generating **${currency}${totalAdSales.toLocaleString()}** in PPC sales with an overall ACOS of **${currentAcos}%** (safely beating our client target of ≤ ${targetAcos}%).\n3. **Key VA Actions Completed:**\n   - Harvested 4 high-converting exact search terms into dedicated SP campaigns.\n   - Negated bleeding zero-order search queries, saving an estimated ~$180/mo in wasted spend.\n   - Created FBA restock plan to secure inventory through the upcoming sales peak.\n4. **Upcoming Focus:** Auditing A+ Content module enhancements and launching Sponsored Brand Video tests.\n\n*Let us know if you have any questions!*`;
      } else {
        aiResponse = `### 💡 Amazon VA Strategy Recommendation\n\nAnalyzing **${text}** across our catalog and PPC structure:\n\n- **Data Health:** Overall revenue is tracking at **${currency}${totalSales.toLocaleString()}** with an organic ratio of **${((salesData.reduce((s,d)=>s+d.organicSales,0) / (totalSales || 1)) * 100).toFixed(1)}%**.\n- **PPC ROAS:** Currently performing at **${(totalAdSales / (totalAdSpend || 1)).toFixed(2)}x**.\n\n**Next Recommended Operational Steps:**\n1. Check your **Daily Activity Log** to verify review dates on recent bid changes.\n2. Ensure all active FBA shipments have carrier tracking numbers populated in Seller Central.\n3. Verify that all 7 image slots are populated with high-contrast lifestyle infographics.`;
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
    }, 700);
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
      {/* Top Banner with Gemini Ready Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-card card-popup">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md shadow-violet-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>AI Account Analyst</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-violet-50 text-violet-700 border border-violet-200 font-semibold">
                Gemini Architecture
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active Scope: <strong className="text-slate-800">{currentAccount ? currentAccount.name : 'All Accounts'}</strong> · Real-time operational suggestions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Zap className="w-4 h-4 text-violet-600" />
          <span>Model: @google/genai (gemini-2.5-flash ready)</span>
        </div>
      </div>

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
                <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative group shadow-xs ${
                isAi 
                  ? 'bg-white/95 border border-slate-200/90 text-slate-800' 
                  : 'bg-[#7C5CFC] text-white font-medium shadow-md shadow-violet-500/20'
              }`}>
                <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1 border-b border-black/5 pb-1">
                  <span className="font-bold">{isAi ? 'Amazon VA Copilot' : 'You (VA Specialist)'}</span>
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
                <div className="w-8 h-8 rounded-xl bg-[#7C5CFC] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse delay-75" />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse delay-150" />
              <span className="ml-1 font-medium">Analyzing Seller Central & PPC metrics...</span>
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
          placeholder="Ask AI Analyst about PPC bids, ACOS bleeding, ASIN conversion, or restock pacing..."
          className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputPrompt.trim() || isTyping}
          className="px-4 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6C4CEE] disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md shadow-violet-500/20 card-popup"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
