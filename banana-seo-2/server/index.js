import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow any localhost origin for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }

    // Default to strict specific origin if not localhost
    // For now, in this dev setup, we are permissive with localhost
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Models
const MODEL_FAST = 'gemini-2.0-flash-001';
const MODEL_SMART = 'gemini-2.5-pro';

// ===== ENDPOINT 1: Keyword Research =====
app.post('/api/ai/keyword-research', async (req, res) => {
  try {
    const { seed, country } = req.body;

    if (!seed || !country) {
      return res.status(400).json({ error: 'Seed keyword and country are required' });
    }

    console.log(`[KEYWORD-RESEARCH] Generating keywords for: "${seed}" in ${country}`);

    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          keyword: { type: Type.STRING },
          volume: { type: Type.STRING, description: "Estimated monthly search volume (e.g., '1k-10k')" },
          difficulty: { type: Type.INTEGER, description: "SEO Difficulty 0-100. Be realistic." },
          intent: { type: Type.STRING, enum: ['Informational', 'Commercial', 'Transactional', 'Navigational'] },
          competition: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
        },
        required: ['keyword', 'volume', 'difficulty', 'intent', 'competition']
      }
    };

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `You are a Senior SEO Strategist acting for a high-end agency.
      Analyze the seed keyword: "${seed}" for the market: ${country}.
      
      Your Goal: Identify high-ROI opportunities, not just generic volume.
      
      Instructions:
      1. Generate 12-15 keyword opportunities.
      2. MIX: 30% Head terms (High Vol), 50% Long-tail (High Intent), 20% "Hidden Gem" (Low difficulty, decent volume).
      3. Classify intent accurately. "Commercial" and "Transactional" are priority for ROI.
      4. Estimate difficulty based on current SERP competitiveness for this niche (0-100).
      
      Output strict JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    const keywords = JSON.parse(text);
    console.log(`[KEYWORD-RESEARCH] Generated ${keywords.length} keywords`);
    res.json(keywords);

  } catch (error) {
    console.error('[KEYWORD-RESEARCH] Error:', error);
    res.status(500).json({
      error: 'Failed to generate keywords',
      message: error.message
    });
  }
});

// ===== ENDPOINT 2: Content Analysis =====
app.post('/api/ai/content-analysis', async (req, res) => {
  try {
    const { text, base64, mimeType, type, audience, goal } = req.body;

    if (!text && !base64) {
      return res.status(400).json({ error: 'Text or file data is required' });
    }

    console.log(`[CONTENT-ANALYSIS] Analyzing content: type=${type}, audience=${audience}, goal=${goal}`);

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        seoScore: { type: Type.INTEGER, description: "Score 0-100 based on original content" },
        optimizedContent: { type: Type.STRING, description: "The full rewritten content, formatted in Markdown." },
        meta: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            slug: { type: Type.STRING }
          },
          required: ['title', 'description', 'slug']
        },
        schemaMarkup: { type: Type.STRING, description: "JSON-LD script for the content type." },
        internalLinks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              anchor: { type: Type.STRING },
              context: { type: Type.STRING, description: "Where to insert this link and why" }
            },
            required: ['anchor', 'context']
          }
        },
        insights: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Why these changes were made." },
        criticalIssues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Major SEO errors found in original." }
      },
      required: ['seoScore', 'optimizedContent', 'meta', 'schemaMarkup', 'internalLinks', 'insights', 'criticalIssues']
    };

    const systemPrompt = `You are an elite SEO Content Strategist.
    Your task is to analyze the user's content and fully OPTIMIZE it for search engines while improving readability for humans.
    
    Context:
    - Content Type: ${type || 'general'}
    - Target Audience: ${audience || 'general'}
    - Primary Goal: ${goal || 'optimize'}
    
    Analysis Instructions:
    1. Evaluate the content's depth, authority (E-E-A-T), and keyword integration.
    2. Identify gaps in topic coverage compared to top-ranking competitors.
    3. Check for Entity Salience (Google NLP) - ensure main entities are clear.
    
    Optimization Actions:
    1. Rewrite the content to match the voice but improve clarity, structure, and keyword flow.
    2. Use Markdown headers (H1, H2, H3) to create a scannable hierarchy.
    3. Integrate semantic keywords (LSI) naturally.
    4. Ensure the first paragraph matches the User Intent (Search Intent) perfectly.
    
    Technical Assets:
    - Generate a click-worthy Meta Title (under 60 chars).
    - Generate a compelling Meta Description (under 160 chars) with a call to action.
    - Create valid JSON-LD Schema appropriate for the '${type || 'Article'}' (e.g., Article, Product, FAQPage).
    
    Return result in strict JSON.`;

    const parts = [{ text: systemPrompt }];

    if (base64 && mimeType) {
      parts.push({
        inlineData: {
          data: base64,
          mimeType: mimeType
        }
      });
      parts.push({ text: "Here is the document to analyze and optimize." });
    } else if (text) {
      parts.push({ text: `Original Content:\n${text}` });
    }

    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const responseText = response.text;
    if (!responseText) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    const analysis = JSON.parse(responseText);
    console.log(`[CONTENT-ANALYSIS] Analysis complete: SEO Score = ${analysis.seoScore}`);
    res.json(analysis);

  } catch (error) {
    console.error('[CONTENT-ANALYSIS] Error:', error);
    res.status(500).json({
      error: 'Failed to analyze content',
      message: error.message
    });
  }
});

// ===== ENDPOINT 3: Strategy Planner =====
app.post('/api/ai/strategy', async (req, res) => {
  try {
    const { domain, businessType, goals } = req.body;

    if (!domain || !businessType || !goals) {
      return res.status(400).json({ error: 'Domain, business type, and goals are required' });
    }

    console.log(`[STRATEGY] Generating strategy for: ${domain} (${businessType})`);

    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: `Act as a Senior SEO Consultant creating a bespoke 3-month strategy.
      
      Client Profile:
      - Domain: ${domain}
      - Business: ${businessType}
      - Primary Goal: ${goals}
      
      Requirements:
      1. Break down strategy into Month 1 (Foundation & Technical), Month 2 (Content & Clusters), Month 3 (Authority & Outreach).
      2. Provide specific, actionable tactics, not generic advice.
      3. IMPORTANT: For each major tactic, explain WHY it was chosen for a ${businessType} business.
      4. Define specific KPIs to measure success for this business type.
      
      Output Format:
      Return ONLY raw HTML (no markdown blocks, no <html> tags). 
      Use Tailwind CSS classes for styling:
      - Headers: 'text-2xl font-bold text-banana-500 mt-8 mb-4'
      - Subheaders: 'text-xl font-semibold text-white mt-6 mb-3'
      - Cards/Sections: 'bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl mb-4'
      - Lists: 'list-disc pl-5 space-y-2 text-zinc-300'
      - Body text: 'text-zinc-400 leading-relaxed mb-4'
      - Highlights: 'text-banana-400 font-medium'`,
    });

    const strategy = response.text || "<p>Could not generate strategy.</p>";
    console.log(`[STRATEGY] Strategy generated successfully (${strategy.length} chars)`);
    res.json({ strategy });

  } catch (error) {
    console.error('[STRATEGY] Error:', error);
    res.status(500).json({
      error: 'Failed to generate strategy',
      message: error.message
    });
  }
});

// ===== Health Check Endpoint =====
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🍌 Banana SEO Backend API running on http://localhost:${PORT}`);
  console.log(`📊 Endpoints:`);
  console.log(`   POST /api/ai/keyword-research`);
  console.log(`   POST /api/ai/content-analysis`);
  console.log(`   POST /api/ai/strategy`);
  console.log(`   GET  /health`);
  console.log(`🔑 API Key: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}\n`);
});
