import React, { useState, useRef } from 'react';
import * as mammoth from 'mammoth';
import { optimizeSmartContent } from '../services/geminiService';
import { SmartSEOAnalysis } from '../types';
import { 
  Upload, FileText, File, X, Sparkles, Loader2, 
  CheckCircle, ChevronRight, Hash, Link as LinkIcon, AlertTriangle, FileType
} from 'lucide-react';

export const SmartContentSEO: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'content' | 'technical' | 'insights'>('content');
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartSEOAnalysis | null>(null);
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  
  // Context State
  const [contentType, setContentType] = useState('Blog Post');
  const [audience, setAudience] = useState('General Public');
  const [goal, setGoal] = useState('Increase Traffic');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file && !rawText && inputType === 'text') return;
    
    setLoading(true);
    setResult(null);

    try {
      let inputData: { text?: string; base64?: string; mimeType?: string } = {};

      if (inputType === 'text') {
        inputData.text = rawText;
      } else if (file) {
        if (file.type === 'application/pdf') {
          // Convert PDF to Base64
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
          });
          inputData.base64 = base64;
          inputData.mimeType = 'application/pdf';
        } else if (file.name.endsWith('.docx')) {
           // Parse DOCX in browser
           const arrayBuffer = await file.arrayBuffer();
           const result = await mammoth.extractRawText({ arrayBuffer });
           inputData.text = result.value;
        } else {
           // Plain text / MD
           inputData.text = await file.text();
        }
      }

      const analysis = await optimizeSmartContent(inputData, { type: contentType, audience, goal });
      setResult(analysis);
    } catch (err) {
      alert("Optimization failed. Please check the file/text and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
            <Sparkles className="text-banana-500 fill-banana-500/20" /> Smart Content SEO
          </h2>
          <p className="text-zinc-400 mt-2 max-w-2xl text-sm leading-relaxed">
            Upload drafts or paste content. Our senior AI strategist will rewrite, optimize, and structure it for maximum ranking potential.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-xl space-y-6">
            <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
              <button 
                onClick={() => setInputType('text')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${inputType === 'text' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Paste Text
              </button>
              <button 
                onClick={() => setInputType('file')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${inputType === 'file' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Upload File
              </button>
            </div>

            {inputType === 'text' ? (
              <textarea 
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste your draft, article, or notes here..."
                className="w-full h-64 input-premium rounded-lg p-4 text-sm resize-none"
              />
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-64 border-2 border-dashed border-zinc-800 hover:border-banana-500/40 hover:bg-zinc-900/40 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={handleFileChange} />
                {file ? (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-banana-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-6 w-6 text-banana-500" />
                    </div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="mt-4 text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1 bg-red-500/10 rounded-full"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-12 h-12 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                       <Upload className="h-6 w-6 text-zinc-400 group-hover:text-banana-500 transition-colors" />
                    </div>
                    <p className="text-zinc-300 font-medium">Click to upload</p>
                    <p className="text-xs text-zinc-500 mt-2">Supports: PDF, DOCX, TXT, MD</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Content Type</label>
                <select value={contentType} onChange={e => setContentType(e.target.value)} className="w-full mt-1 input-premium rounded-lg p-2.5 text-sm appearance-none">
                  <option>Blog Post</option>
                  <option>Landing Page</option>
                  <option>Product Description</option>
                  <option>Service Page</option>
                  <option>Press Release</option>
                </select>
              </div>
              <div>
                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Target Audience</label>
                 <input value={audience} onChange={e => setAudience(e.target.value)} className="w-full mt-1 input-premium rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Primary Goal</label>
                 <input value={goal} onChange={e => setGoal(e.target.value)} className="w-full mt-1 input-premium rounded-lg p-2.5 text-sm" />
              </div>
            </div>

            <button 
              onClick={handleProcess}
              disabled={loading || (!file && !rawText && inputType === 'text')}
              className="w-full btn-primary py-3.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Optimize Content'}
            </button>
          </div>
        </div>

        {/* RESULTS COLUMN */}
        <div className="lg:col-span-8">
          {!result ? (
            <div className="h-full min-h-[500px] glass-panel rounded-xl flex flex-col items-center justify-center text-zinc-500 space-y-4 border-dashed border border-zinc-800/60 bg-zinc-900/20">
               <div className="bg-zinc-900/80 p-6 rounded-full border border-zinc-800 shadow-inner">
                 <Sparkles className="h-10 w-10 text-zinc-700" />
               </div>
               <div className="text-center max-w-xs">
                 <p className="text-zinc-400 font-medium">AI Output Area</p>
                 <p className="text-xs text-zinc-600 mt-1">Upload content to receive optimized text, technical data, and strategic insights.</p>
               </div>
            </div>
          ) : (
            <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-full max-h-[800px] border-zinc-800">
              {/* Score Header */}
              <div className="bg-zinc-900/60 border-b border-zinc-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm">
                <div className="flex gap-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">SEO Health</span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-bold ${result.seoScore > 80 ? 'text-green-500' : result.seoScore > 50 ? 'text-banana-500' : 'text-red-500'}`}>{result.seoScore}</span>
                      <span className="text-zinc-600 text-sm">/100</span>
                    </div>
                  </div>
                  <div className="w-px bg-zinc-800 h-10 self-center hidden md:block"></div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Critical Issues</span>
                    <span className="text-white font-medium flex items-center gap-2 mt-1">
                       {result.criticalIssues.length > 0 ? (
                         <span className="flex items-center gap-2 text-red-400"><AlertTriangle size={16}/> {result.criticalIssues.length} Detected</span>
                       ) : (
                         <span className="flex items-center gap-2 text-green-500"><CheckCircle size={16}/> All Good</span>
                       )}
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-black/40 rounded-lg p-1 border border-zinc-800/50">
                  <button onClick={() => setActiveTab('content')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'content' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Content</button>
                  <button onClick={() => setActiveTab('technical')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'technical' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Technical</button>
                  <button onClick={() => setActiveTab('insights')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'insights' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Insights</button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-zinc-950/30 scroll-smooth">
                {activeTab === 'content' && (
                  <div className="prose prose-invert prose-banana max-w-none">
                     <div className="whitespace-pre-wrap font-sans leading-relaxed text-zinc-300 text-base">
                       {result.optimizedContent}
                     </div>
                  </div>
                )}

                {activeTab === 'technical' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-banana-500 uppercase font-bold flex items-center gap-2 tracking-wider"><File className="w-3 h-3"/> Meta Title</label>
                      <div className="bg-black/40 p-4 rounded-lg border border-zinc-800 text-white font-medium">{result.meta.title}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-banana-500 uppercase font-bold flex items-center gap-2 tracking-wider"><FileText className="w-3 h-3"/> Meta Description</label>
                      <div className="bg-black/40 p-4 rounded-lg border border-zinc-800 text-zinc-300 leading-relaxed">{result.meta.description}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-banana-500 uppercase font-bold flex items-center gap-2 tracking-wider"><LinkIcon className="w-3 h-3"/> URL Slug</label>
                      <div className="bg-black/40 p-4 rounded-lg border border-zinc-800 text-blue-400 font-mono text-sm">/{result.meta.slug}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-banana-500 uppercase font-bold flex items-center gap-2 tracking-wider"><Hash className="w-3 h-3"/> Schema Markup (JSON-LD)</label>
                      <pre className="bg-black/40 p-4 rounded-lg border border-zinc-800 text-green-400 font-mono text-xs overflow-x-auto custom-scrollbar">
                        {result.schemaMarkup}
                      </pre>
                    </div>
                  </div>
                )}

                {activeTab === 'insights' && (
                  <div className="space-y-8">
                    <div>
                       <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><AlertTriangle size={16} className="text-red-500"/> Critical Issues Fixed</h4>
                       <ul className="space-y-3">
                         {result.criticalIssues.map((issue, i) => (
                           <li key={i} className="bg-red-500/5 border border-red-500/10 p-4 rounded-lg text-red-200 text-sm flex gap-3 items-start">
                             <div className="min-w-[6px] h-[6px] rounded-full bg-red-500 mt-1.5"></div>
                             {issue}
                           </li>
                         ))}
                       </ul>
                    </div>

                    <div>
                       <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><Sparkles size={16} className="text-banana-500"/> Strategic Changes</h4>
                       <ul className="space-y-3">
                         {result.insights.map((insight, i) => (
                           <li key={i} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg text-zinc-300 text-sm flex gap-3 items-start">
                             <div className="min-w-[6px] h-[6px] rounded-full bg-banana-500 mt-1.5"></div>
                             {insight}
                           </li>
                         ))}
                       </ul>
                    </div>

                    <div>
                       <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><LinkIcon size={16} className="text-blue-500"/> Internal Linking Opportunities</h4>
                       <div className="grid gap-4">
                         {result.internalLinks.map((link, i) => (
                           <div key={i} className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-lg">
                             <p className="text-blue-400 font-bold text-sm mb-1 flex items-center gap-2"><LinkIcon size={12}/> {link.anchor}</p>
                             <p className="text-zinc-400 text-sm leading-relaxed">{link.context}</p>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};