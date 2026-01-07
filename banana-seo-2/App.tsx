import React, { useState, useEffect } from 'react';
import { User, AppView } from './types';
import { storageService } from './services/storageService';
import { notificationService } from './services/notificationService';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { KeywordResearch } from './components/KeywordResearch';
import { ContentAnalyzer } from './components/ContentAnalyzer';
import { ProjectManager } from './components/ProjectManager';
import { SmartContentSEO } from './components/SmartContentSEO';
import { generateStrategy } from './services/geminiService';
import { Loader2, AlertCircle } from 'lucide-react';

// --- Auth Component (Inline) ---
const AuthScreen: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLoading) return;

    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isLogin && !name) {
      setError('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    try {
      // Send security notification (simulated backend call)
      await notificationService.sendLoginNotification(email);

      const user: User = { 
        id: `u-${Date.now()}`, 
        email, 
        name: name || email.split('@')[0] 
      };
      
      storageService.saveUser(user);
      onLogin(user);
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl animate-fade-in border-zinc-800/60 bg-[#09090b]/90">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-banana-500/10 mb-4 ring-1 ring-banana-500/20 shadow-lg shadow-banana-500/10">
             <span className="text-4xl block drop-shadow-sm">🍌</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome to Banana SEO</h1>
          <p className="text-zinc-400 text-sm">Professional AI SEO Platform</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
              <input 
                type="text" 
                className="input-premium w-full rounded-lg p-3"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
            <input 
              type="email" 
              className="input-premium w-full rounded-lg p-3"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              className="input-premium w-full rounded-lg p-3"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full btn-primary py-3.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-zinc-800/50 pt-6">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm text-zinc-500 hover:text-banana-500 transition-colors font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Strategy Planner Component ---
const StrategyPlanner: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [type, setType] = useState('E-commerce');
  const [goals, setGoals] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGen = async () => {
    if (!domain || !goals) return;
    setLoading(true);
    try {
      const html = await generateStrategy(domain, type, goals);
      setPlan(html);
    } catch(e) {
      alert("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Strategy Planner</h2>
        <p className="text-zinc-400">Generate a comprehensive 3-month execution plan.</p>
      </div>
      
      <div className="glass-panel p-8 rounded-xl border-zinc-800/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Domain</label>
             <input 
                placeholder="e.g. myshop.com" 
                className="input-premium w-full rounded-lg p-3"
                value={domain} onChange={e => setDomain(e.target.value)}
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Business Type</label>
             <select 
              className="input-premium w-full rounded-lg p-3 appearance-none"
              value={type} onChange={e => setType(e.target.value)}
             >
              <option>E-commerce</option>
              <option>SaaS</option>
              <option>Local Business</option>
              <option>Blog / Publisher</option>
              <option>Agency</option>
            </select>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Primary Goal</label>
             <input 
                placeholder="e.g. +20% Organic Traffic" 
                className="input-premium w-full rounded-lg p-3"
                value={goals} onChange={e => setGoals(e.target.value)}
             />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleGen} 
            disabled={loading || !domain}
            className="btn-primary py-3 px-8 rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin"/> : 'Generate Strategy Plan'}
          </button>
        </div>
      </div>

      {plan && (
        <div className="glass-panel p-10 rounded-xl prose prose-invert max-w-none animate-slide-up border-zinc-800/60 bg-zinc-900/40">
          <div dangerouslySetInnerHTML={{__html: plan}} />
        </div>
      )}
    </div>
  )
}

// --- Main App ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);

  useEffect(() => {
    const existing = storageService.getUser();
    if (existing) setUser(existing);
  }, []);

  const handleLogout = () => {
    storageService.clearUser();
    setUser(null);
  };

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  return (
    <Layout user={user} currentView={view} onChangeView={setView} onLogout={handleLogout}>
      {view === AppView.DASHBOARD && <Dashboard />}
      {view === AppView.RESEARCH && <KeywordResearch />}
      {view === AppView.ANALYZER && <ContentAnalyzer />}
      {view === AppView.PROJECTS && <ProjectManager />}
      {view === AppView.STRATEGY && <StrategyPlanner />}
      {view === AppView.SMART_SEO && <SmartContentSEO />}
    </Layout>
  );
}