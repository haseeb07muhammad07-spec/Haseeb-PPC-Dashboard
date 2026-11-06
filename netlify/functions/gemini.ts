import { GoogleGenAI } from '@google/genai';

export const handler = async (event: any) => {
  // Only allow POST
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { prompt, context, chatHistory } = JSON.parse(event.body || '{}');
    if (!prompt || typeof prompt !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.haseebgeminiapi || process.env.HASEEB_GEMINI_API;
    if (!apiKey) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `⚠️ **Gemini API Key Setup Zaroori Hai**\n\nGoogle Gemini API key Netlify environment par detect nahi hui.\n\n**Kaise connect karein:**\n1. [Google AI Studio](https://aistudio.google.com/app/apikey) se apni free Gemini API Key generate karein.\n2. Netlify dashboard mein **Site configuration > Environment variables** mein ja kar \`GEMINI_API_KEY\` add karein aur Deploy trigger karein.\n\nUske baad live AI Analyst Google Gemini ke sath 100% active ho jayega!`,
          source: 'missing_key_notice'
        })
      };
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    let contextStr = '';
    if (context) {
      contextStr = `Current Amazon Account Context:
- Active Account / Brand: ${context.accountName || 'All Accounts Rollup'}
- Marketplace: ${context.marketplace || 'Amazon EU'}
- Currency: ${context.currency || '$'}
- Total Sales: ${context.currency || '$'}${Number(context.totalSales || 0).toLocaleString()}
- Total PPC Ad Spend: ${context.currency || '$'}${Number(context.totalAdSpend || 0).toLocaleString()}
- Total PPC Ad Sales: ${context.currency || '$'}${Number(context.totalAdSales || 0).toLocaleString()}
- Current ACOS: ${context.currentAcos || 0}%
- Target ACOS: ${context.targetAcos || 25}%
- Low Stock / Critical FBA Items: ${context.lowStockItemsCount || 0}
- Bleeder Campaigns: ${context.bleederCampaignsCount || 0}
`;
      if (context.worstCampaigns && context.worstCampaigns.length > 0) {
        contextStr += `- Top Bleeder Campaigns Detail:\n${context.worstCampaigns.map((c: any) => `  * ${c.name} | Spend: ${context.currency}${c.spend} | ACOS: ${c.acos}% (Target: ${c.targetAcos}%)`).join('\n')}\n`;
      }
      if (context.criticalInventory && context.criticalInventory.length > 0) {
        contextStr += `- Critical Inventory ASINs:\n${context.criticalInventory.map((i: any) => `  * ASIN: ${i.asin} (SKU: ${i.sku}) | Days of Supply: ${i.daysOfSupply} days remaining`).join('\n')}\n`;
      }
    }

    let historyStr = '';
    if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
      historyStr = chatHistory.slice(-6).map((m: any) => `${m.sender === 'user' ? 'User' : 'Gemini'}: ${m.text}`).join('\n\n');
    }

    const systemInstruction = `You are Haseeb Malik's authentic, high-intelligence Amazon Operations & PPC AI Assistant powered by Google Gemini.
You advise Haseeb Malik, agency brand managers, and virtual assistant specialists on Amazon Seller Central, PPC advertising (Sponsored Products, Brands, Display, Video), FBA logistics, inventory forecasting, listing optimization, and client reporting.

CRITICAL LANGUAGE & COMMUNICATION INSTRUCTION (MUST FOLLOW):
- The user (Haseeb Malik) may write to you in ANY language: Urdu script (اردو), Roman Urdu, English, or any mixed language.
- You must understand their input perfectly regardless of language.
- ALWAYS respond in natural, friendly, professional Roman Urdu (conversational Urdu written in English alphabets) by default, unless the user specifically asks you to write in pure Urdu script (اردو) or English.
- Address Haseeb respectfully and keep the tone warm, expert, and practical.

AUTHENTIC GEMINI CAPABILITIES:
- You have full conversational intelligence. You can answer general questions, chat warmly, perform math, write scripts, explain strategies, and analyze store performance.
- When answering questions about Amazon accounts, refer directly to the live account data provided in context.
- Format all responses with clean markdown: bold text, bullet points, and code blocks where helpful.`;

    const fullPrompt = `${contextStr ? `[CURRENT REAL-TIME STORE DATA]\n${contextStr}\n` : ''}${historyStr ? `[PREVIOUS CONVERSATION]\n${historyStr}\n` : ''}[USER QUESTION / DIRECTIVE]\n${prompt}`;

    let outputText = '';
    let usedModel = 'gemini-3.8-flash';

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: fullPrompt,
          config: { systemInstruction }
        });
        if (response.text) {
          outputText = response.text;
          usedModel = model;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed in Netlify function:`, err.message);
      }
    }

    if (!outputText && lastError) {
      throw lastError;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ text: outputText || 'No response generated from Gemini.', source: usedModel })
    };
  } catch (error: any) {
    console.error('Netlify Gemini Function Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error?.message || 'Error communicating with Gemini API',
        text: `❌ **Gemini API Error:** ${error?.message || 'Unknown error'}\n\nCheck karein ke aapki \`GEMINI_API_KEY\` active aur valid hai.`
      })
    };
  }
};
