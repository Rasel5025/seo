import { KeywordProject, User } from '../types';

const KEYS = {
  USER: 'banana_seo_user',
  PROJECTS: 'banana_seo_projects',
};

export const storageService = {
  getUser: (): User | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user: User): void => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  clearUser: (): void => {
    localStorage.removeItem(KEYS.USER);
  },

  getProjects: (): KeywordProject[] => {
    const data = localStorage.getItem(KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  },

  saveProject: (project: KeywordProject): void => {
    const projects = storageService.getProjects();
    // Update if exists, else add
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
  },

  deleteProject: (id: string): void => {
    const projects = storageService.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(filtered));
  }
};