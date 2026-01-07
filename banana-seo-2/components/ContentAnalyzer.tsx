import React, { useState } from 'react';
import { analyzeContent } from '../services/geminiService';
import { ContentAnalysis } from '../types';
import { Wand2, Loader2, AlertCircle, XCircle } from 'lucide-react';

export const ContentAnalyzer: React.FC = () => {
  const [content, setContent] = useState('');
  const [keyword, setKeyword] = useState('');
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!content || !keyword) return;
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await analyzeContent(content, keyword);
      setAnalysis(result);
    } catch (e) {
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 border-green-500';
    if (score >= 50) return 'text-banana-500 border-banana-500';
    return 'text-red-500 border-red-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[80vh] animate-fade-in pb-10">
      {/* Input Section */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Quick Content Analyzer</h2>
          <p className="text-zinc-400 text-sm">Paste content for immediate score and feedback.</p>
        </div>
        
        <div className="space-y-2">
           <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Target Keyword</label>
           <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Primary keyword..."
              className="input-premium w-full rounded-lg p-3 text-sm"
           />
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Content Body</label>
          <textarea 
            className="flex-1 w-full input-premium rounded-lg p-4 resize-none font-mono text-sm leading-relaxed"
            placeholder="Paste your article or draft here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={loading || !content || !keyword}
          className="w-full btn-primary py-3.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Wand2 size={20} /> Analyze Content</>}
        </button>
      </div>

      {/* Results Section */}
      <div className="glass-panel rounded-xl p-8 flex flex-col overflow-y-auto border-zinc-800/60">
        {!analysis ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4 opacity-40">
            <Wand2 size={48} />
            <p className="font-medium">Analysis results will appear here</p>
          </div>
        ) : (
          <div className="space-y-8 animate-slide-up">
            {/* Score Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-8">
              <div>
                <h3 className="text-lg font-bold text-zinc-200">SEO Score</h3>
                <p className="text-sm text-zinc-500">Real-time analysis</p>
              </div>
              <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-2xl ${getScoreColor(analysis.score)}`}>
                <span className="text-3xl font-bold">{analysis.score}</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-5 rounded-xl border border-zinc-800/50">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Readability</p>
                <p className="text-lg font-bold text-white mt-1">{analysis.readability}</p>
              </div>
              <div className="bg-black/20 p-5 rounded-xl border border-zinc-800/50">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Word Count</p>
                <p className="text-lg font-bold text-white mt-1">{analysis.wordCount}</p>
              </div>
              <div className="bg-black/20 p-5 rounded-xl border border-zinc-800/50 col-span-2">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Structure</p>
                <p className={`text-lg font-bold mt-1 ${analysis.headingStructure === 'Good' ? 'text-green-500' : 'text-banana-500'}`}>
                  {analysis.headingStructure}
                </p>
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                <AlertCircle size={16} className="text-banana-500" /> Improvements
              </h4>
              <ul className="space-y-3">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 flex gap-3 items-start">
                    <span className="min-w-[6px] h-[6px] rounded-full bg-banana-500 mt-1.5"></span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Keywords */}
            <div>
              <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                <XCircle size={16} className="text-red-400" /> Missing Semantics
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.map((k, i) => (
                  <span key={i} className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-medium rounded-full border border-red-500/20">
                    {k}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};