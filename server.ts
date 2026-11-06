import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    model: 'gemini-3.8-flash'
  });
});

// Explicit direct download route with attachment header
app.get('/download-zip', (_req, res) => {
  const zipPath = path.resolve(process.cwd(), 'public/project-update.zip');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="project-update.zip"');
  res.download(zipPath, 'project-update.zip');
});

// Gemini Chat Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt, context, chatHistory } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.haseebgeminiapi || process.env.HASEEB_GEMINI_API;
    if (!apiKey) {
      return res.status(200).json({
        text: `⚠️ **Gemini API Key Setup Zaroori Hai**\n\nGoogle Gemini API key server environment par detect nahi hui.\n\n**Kaise connect karein:**\n1. [Google AI Studio](https://aistudio.google.com/app/apikey) se apni free Gemini API Key generate karein.\n2. Netlify dashboard mein **Site configuration > Environment variables** mein ja kar \`GEMINI_API_KEY\` name aur apni key paste kar ke Save karein.\n\nJaise hi key save hogi, live AI Analyst Google Gemini ke sath 100% active ho jayega!`,
        source: 'missing_key_notice'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Build operational context
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
- Bleeder Campaigns (Exceeding Target ACOS): ${context.bleederCampaignsCount || 0}
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
        console.warn(`Model ${model} failed, trying next:`, err.message);
      }
    }

    if (!outputText && lastError) {
      throw lastError;
    }

    return res.json({ text: outputText || 'No response generated from Gemini.', source: usedModel });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: error?.message || 'Error communicating with Gemini API',
      text: `❌ **Gemini API Error:** ${error?.message || 'Unknown error'}\n\nCheck karein ke aapki \`GEMINI_API_KEY\` active aur valid hai.`
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
