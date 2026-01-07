import React, { useState } from 'react';
import { generateKeywords } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { KeywordResult, KeywordProject } from '../types';
import { COUNTRIES } from '../constants';
import { Search, Loader2, Save, Plus } from 'lucide-react';

export const KeywordResearch: React.FC = () => {
  const [seed, setSeed] = useState('');
  const [country, setCountry] = useState('United States of America');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [projects] = useState<KeywordProject[]>(storageService.getProjects());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seed.trim()) return;
    
    setLoading(true);
    setError('');
    setResults([]);
    
    try {
      const data = await generateKeywords(seed, country);
      setResults(data);
    } catch (err) {
      setError("Failed to fetch keywords. Please check your API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveToProject = () => {
    if (!selectedProject || results.length === 0) return;
    
    const project = projects.find(p => p.id === selectedProject);
    if (project) {
      // Merge unique keywords
      const newKeywords = [...project.keywords];
      results.forEach(r => {
        if (!newKeywords.find(k => k.keyword === r.keyword)) {
          newKeywords.push(r);
        }
      });
      project.keywords = newKeywords;
      storageService.saveProject(project);
      alert(`Saved ${results.length} keywords to ${project.name}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Keyword Research</h2>
        <p className="text-zinc-400">Discover high-opportunity keywords powered by Gemini AI.</p>
      </div>

      <div className="glass-panel p-8 rounded-xl border-zinc-800/60">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-5">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Seed Keyword</label>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-zinc-500" size={18} />
              <input 
                type="text" 
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="e.g. vegan protein powder"
                className="input-premium w-full rounded-lg pl-12 pr-4 py-3 text-sm"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Target Market</label>
            <div className="relative">
              <select 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="input-premium w-full rounded-lg px-4 py-3 appearance-none text-sm"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={loading || !seed}
              className="w-full md:w-auto btn-primary py-3 px-8 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Research'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Results ({results.length})</h3>
            
            <div className="flex gap-3">
              <select 
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-sm rounded-lg px-4 py-2 text-white outline-none focus:border-banana-500"
              >
                <option value="">Select Project to Save</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button 
                onClick={saveToProject}
                disabled={!selectedProject}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} /> Save
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden border-zinc-800/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/40 text-zinc-500 text-[10px] uppercase tracking-wider border-b border-zinc-800/60">
                    <th className="p-5 font-bold">Keyword</th>
                    <th className="p-5 font-bold">Volume</th>
                    <th className="p-5 font-bold">Difficulty</th>
                    <th className="p-5 font-bold">Intent</th>
                    <th className="p-5 font-bold">Competition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {results.map((r, i) => (
                    <tr key={i} className="hover:bg-zinc-800/40 transition-colors group">
                      <td className="p-5 text-white font-medium group-hover:text-banana-400 transition-colors">{r.keyword}</td>
                      <td className="p-5 text-zinc-300 font-mono text-sm">{r.volume}</td>
                      <td className="p-5">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                          r.difficulty < 40 ? 'bg-green-500/10 text-green-500' :
                          r.difficulty < 70 ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {r.difficulty}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className="text-zinc-300 text-xs border border-zinc-700/60 px-2 py-1 rounded bg-zinc-900/50">
                          {r.intent}
                        </span>
                      </td>
                      <td className="p-5 text-zinc-400 text-sm">{r.competition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};