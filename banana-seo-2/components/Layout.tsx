import React from 'react';
import { User, AppView } from '../types';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  Briefcase, 
  Zap, 
  LogOut, 
  Menu,
  Sparkles
} from 'lucide-react';

interface LayoutProps {
  user: User;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, currentView, onChangeView, onLogout, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label, highlight = false }: { view: AppView; icon: any; label: string; highlight?: boolean }) => (
    <button
      onClick={() => {
        onChangeView(view);
        setMobileMenuOpen(false);
      }}
      className={`relative w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group font-medium ${
        currentView === view 
          ? 'bg-banana-500/10 text-banana-500 border border-banana-500/20' 
          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'
      } ${highlight && currentView !== view ? 'text-banana-400' : ''}`}
    >
      <Icon size={18} className={`transition-colors ${currentView === view ? 'text-banana-500' : highlight ? 'text-banana-500' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
      <span className="text-sm">{label}</span>
      {highlight && currentView !== view && (
         <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-banana-500 animate-pulse" />
      )}
      {currentView === view && (
        <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-banana-500" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex font-sans selection:bg-banana-500/30">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 flex-col border-r border-zinc-900 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 h-screen z-30">
        <div className="p-8 pb-8 flex items-center gap-3">
          <div className="bg-banana-500/10 p-2 rounded-lg border border-banana-500/20 shadow-[0_0_15px_-5px_rgba(234,179,8,0.3)]">
             <span className="text-2xl drop-shadow-md">🍌</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">Banana SEO</h1>
            <span className="text-[10px] uppercase tracking-widest text-banana-500 font-semibold opacity-90">Pro SaaS</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 py-4">
          <p className="px-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 mt-2">Platform</p>
          <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Overview" />
          <NavItem view={AppView.PROJECTS} icon={Briefcase} label="Projects" />
          
          <p className="px-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 mt-8">Intelligence</p>
          <NavItem view={AppView.SMART_SEO} icon={Sparkles} label="Smart Content SEO" highlight />
          <NavItem view={AppView.RESEARCH} icon={Search} label="Keyword Research" />
          <NavItem view={AppView.ANALYZER} icon={FileText} label="Quick Analyzer" />
          <NavItem view={AppView.STRATEGY} icon={Zap} label="Strategy Planner" />
        </nav>

        <div className="p-4 mx-4 mb-6">
          <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/50 p-3 hover:bg-zinc-900/80 transition-colors group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold border border-zinc-700">
                {user.name[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">{user.name}</p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-zinc-800 flex items-center justify-between px-4 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-2">
             <span className="text-xl">🍌</span>
             <span className="font-bold text-sm">Banana SEO</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-zinc-300 p-2">
            <Menu size={20} />
          </button>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-zinc-950/95 backdrop-blur-xl pt-20 px-6 space-y-4">
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 text-zinc-500 p-2">
               <Menu size={24} />
            </button>
            <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Overview" />
            <NavItem view={AppView.SMART_SEO} icon={Sparkles} label="Smart Content SEO" highlight />
            <NavItem view={AppView.PROJECTS} icon={Briefcase} label="Projects" />
            <NavItem view={AppView.RESEARCH} icon={Search} label="Keyword Research" />
            <NavItem view={AppView.ANALYZER} icon={FileText} label="Quick Analyzer" />
            <NavItem view={AppView.STRATEGY} icon={Zap} label="Strategy Planner" />
             <button onClick={onLogout} className="w-full text-left px-4 py-4 text-red-400 font-medium border-t border-zinc-800 mt-4">Sign Out</button>
          </div>
        )}

        <div className="flex-1 overflow-auto p-6 md:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};