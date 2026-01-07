import { KeywordResult, SmartSEOAnalysis, ContentAnalysis } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini AI Client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

const MODEL_FAST = 'gemini-2.0-flash-001';
const MODEL_SMART = 'gemini-2.5-pro';

/**
 * Generates keyword ideas via Client-side Gemini API
 */
export const generateKeywords = async (seed: string, country: string): Promise<KeywordResult[]> => {
  try {
    if (!apiKey) throw new Error("API Key missing. Check .env file.");

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
      contents: `You are a Senior SEO Strategist.
      Analyze the seed keyword: "${seed}" for the market: ${country}.
      Generate 12-15 high-ROI keyword opportunities.
      Output strict JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);

  } catch (error) {
    console.error("Keyword Gen Error:", error);
    throw new Error("Failed to generate keywords. " + (error as Error).message);
  }
};

/**
 * Smart Content SEO: Deep analysis via Client-side Gemini API
 */
export const optimizeSmartContent = async (
  inputData: { text?: string; base64?: string; mimeType?: string },
  context: { type: string; audience: string; goal: string }
): Promise<SmartSEOAnalysis> => {
  try {
    if (!apiKey) throw new Error("API Key missing. Check .env file.");

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

    const systemPrompt = `Analyze content: Type=${context.type}, Audience=${context.audience}, Goal=${context.goal}. 
    Optimize for SEO and readability. Return strict JSON.`;

    const parts = [{ text: systemPrompt }];

    if (inputData.base64 && inputData.mimeType) {
      parts.push({
        inlineData: {
          data: inputData.base64,
          mimeType: inputData.mimeType
        }
      });
    } else if (inputData.text) {
      parts.push({ text: `Original Content:\n${inputData.text}` });
    }

    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);

  } catch (error) {
    console.error("Smart SEO Error:", error);
    throw new Error("Failed to optimize content. " + (error as Error).message);
  }
};

/**
 * Generate Strategy via Client-side Gemini API
 */
export const generateStrategy = async (domain: string, businessType: string, goals: string): Promise<string> => {
  try {
    if (!apiKey) throw new Error("API Key missing. Check .env file.");

    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: `Create a 3-month SEO strategy for ${domain} (${businessType}). Goal: ${goals}.
      Output strictly raw HTML with Tailwind CSS classes.`,
    });

    return response.text || "<p>Could not generate strategy.</p>";
  } catch (error) {
    console.error("Strategy Gen Error:", error);
    throw new Error("Failed to generate strategy.");
  }
};

/**
 * Analyzes content for basic SEO optimization via Client-side Gemini API.
 * Maps to optimizSmartContent for now to keep compatibility.
 */
export const analyzeContent = async (content: string, targetKeyword: string): Promise<ContentAnalysis> => {
  try {
    const context = {
      type: 'General Content',
      audience: 'General Audience',
      goal: `Optimize for keyword: ${targetKeyword}`
    };

    const smartResult = await optimizeSmartContent({ text: content }, context);

    // Map SmartSEOAnalysis to ContentAnalysis structure
    return {
      score: smartResult.seoScore,
      readability: "Auto-Calculated",
      wordCount: content.split(/\s+/).length,
      suggestions: smartResult.criticalIssues.map(issue => `Fix: ${issue}`),
      missingKeywords: [],
      headingStructure: 'Good'
    };

  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Failed to analyze content.");
  }
};