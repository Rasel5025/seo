import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { KeywordProject } from '../types';
import { Trash2, Plus, Globe } from 'lucide-react';

export const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<KeywordProject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDomain, setNewProjectDomain] = useState('');

  useEffect(() => {
    setProjects(storageService.getProjects());
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || !newProjectDomain) return;

    const newProject: KeywordProject = {
      id: Date.now().toString(),
      name: newProjectName,
      domain: newProjectDomain,
      keywords: [],
      createdAt: Date.now()
    };

    storageService.saveProject(newProject);
    setProjects(storageService.getProjects());
    setNewProjectName('');
    setNewProjectDomain('');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure? This will delete all saved keywords for this project.")) {
      storageService.deleteProject(id);
      setProjects(storageService.getProjects());
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-10">
       <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Projects</h2>
          <p className="text-zinc-400">Manage your SEO campaigns and keyword buckets.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary py-2.5 px-6 rounded-lg flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(project => (
          <div key={project.id} className="glass-panel rounded-xl p-8 hover:bg-zinc-900/60 transition-all group relative border-zinc-800/60">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-zinc-800/50 p-4 rounded-xl text-banana-500 ring-1 ring-inset ring-zinc-700/50 shadow-inner">
                <Globe size={28} />
              </div>
              <button 
                onClick={() => handleDelete(project.id)}
                className="text-zinc-600 hover:text-red-500 transition-colors p-2 hover:bg-zinc-800 rounded-lg opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">{project.name}</h3>
            <p className="text-zinc-500 text-sm mb-6 font-medium">{project.domain}</p>
            
            <div className="pt-6 border-t border-zinc-800/50 flex justify-between items-center">
              <span className="text-sm text-zinc-400 font-medium">Stored Keywords</span>
              <span className="bg-zinc-900 border border-zinc-800 text-white px-3 py-1 rounded-full text-xs font-bold">
                {project.keywords.length}
              </span>
            </div>
          </div>
        ))}
        
        {projects.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
            <Globe className="mx-auto h-12 w-12 text-zinc-600 mb-4 opacity-50" />
            <h3 className="text-white font-bold text-lg mb-2">No projects yet</h3>
            <p className="text-zinc-500 max-w-sm mx-auto">Create your first project to start organizing keywords and tracking strategy.</p>
          </div>
        )}
      </div>

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-panel border-zinc-700 rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all scale-100 bg-[#09090b]">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Project</h3>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Project Name</label>
                <input 
                  autoFocus
                  className="input-premium w-full rounded-lg p-3"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="My Awesome Client"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Domain URL</label>
                <input 
                  className="input-premium w-full rounded-lg p-3"
                  value={newProjectDomain}
                  onChange={e => setNewProjectDomain(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-800 text-white font-medium py-3 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary py-3 rounded-lg transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};