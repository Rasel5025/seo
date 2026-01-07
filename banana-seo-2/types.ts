export interface User {
  id: string;
  email: string;
  name: string;
}

export interface KeywordResult {
  keyword: string;
  volume: string; // Estimated range (AI generated)
  difficulty: number; // 0-100
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  competition: 'Low' | 'Medium' | 'High';
}

export interface KeywordProject {
  id: string;
  name: string;
  domain: string;
  keywords: KeywordResult[];
  createdAt: number;
}

export interface ContentAnalysis {
  score: number;
  readability: string;
  wordCount: number;
  suggestions: string[];
  missingKeywords: string[];
  headingStructure: 'Good' | 'Fair' | 'Poor';
}

export interface SmartSEOAnalysis {
  seoScore: number;
  optimizedContent: string;
  meta: {
    title: string;
    description: string;
    slug: string;
  };
  schemaMarkup: string; // JSON-LD string
  internalLinks: Array<{ anchor: string; context: string }>;
  insights: string[];
  criticalIssues: string[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  RESEARCH = 'RESEARCH',
  ANALYZER = 'ANALYZER',
  SMART_SEO = 'SMART_SEO',
  PROJECTS = 'PROJECTS',
  STRATEGY = 'STRATEGY'
}