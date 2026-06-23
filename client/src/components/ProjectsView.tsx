/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Folder, 
  GitBranch, 
  GitPullRequest, 
  Layers, 
  Plus, 
  TrendingUp, 
  Code, 
  CheckSquare, 
  Star,
  Clock,
  ExternalLink,
  Users
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  progress: number;
  color: string;
  milestones: string[];
  team: string[];
}

interface ProjectsViewProps {
  projects: Project[];
  onAddProject: (project: Omit<Project, 'id' | 'progress' | 'color' | 'team'>) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
}

export default function ProjectsView({ projects, onAddProject, onUpdateProject }: ProjectsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [milestonesText, setMilestonesText] = useState('');

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddProject({
      name,
      code: code || 'PROJ-GEN',
      description,
      milestones: milestonesText ? milestonesText.split(',').map(s => s.trim()) : ['Initial Draft Setup'],
    });
    setName('');
    setCode('');
    setDescription('');
    setMilestonesText('');
    setShowAddForm(false);
  };

  const handleToggleMilestone = (projectId: string, milestoneIndex: number) => {
    const project = projects.find((proj) => proj.id === projectId);
    if (!project) return;
    const currentMilestonePercent = Math.round(100 / Math.max(1, project.milestones.length));
    const newProgress = Math.min(100, Math.max(0, project.progress + (project.progress > 50 ? -currentMilestonePercent : currentMilestonePercent)));
    onUpdateProject(projectId, { progress: newProgress });
  };

  return (
    <div className="space-y-6">
      {/* Upper overview header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl">
        <div>
          <h2 className="font-sans text-xl font-bold text-slate-900">Workspace Projects Directory</h2>
          <p className="font-sans text-xs text-slate-500 mt-1">
            Group individual task segments into major academic courses and technical development repositories.
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold tracking-wider rounded-xl transition-all flex items-center gap-1.5 uppercase cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" /> create project
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProject} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold text-slate-500 tracking-wider block">PROJECT NAME</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Quantum Compiler, Advanced Economics Paper" 
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold text-slate-500 tracking-wider block">IDENTIFIER CODE</label>
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., CS-501, BIO-Paper1" 
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-[10px] font-bold text-slate-500 tracking-wider block">DESCRIPTION</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide high-level context of what this epic entails..." 
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 h-20 transition-colors"
            ></textarea>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-[10px] font-bold text-slate-500 tracking-wider block">MILESTONES (Comma-separated)</label>
            <input 
              type="text" 
              value={milestonesText}
              onChange={(e) => setMilestonesText(e.target.value)}
              placeholder="Milestone A, Milestone B, Final submission" 
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 border border-slate-200 hover:bg-white text-slate-600 font-mono text-xs font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold rounded-xl cursor-pointer shadow-xs"
            >
              Initialize Project Epic
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <Folder className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="mt-3 text-sm text-slate-500 font-sans">No projects yet. Create your first workspace epic.</p>
          </div>
        ) : projects.map((proj) => {
          // Use Clean Minimalism accent blue or similar clean tones
          const barColor = proj.color === '#ba1a1a' ? '#E11D48' : '#2563EB';

          return (
            <div key={proj.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300">
              <div className="space-y-4">
                {/* Card overhead info */}
                <div className="flex justify-between items-start gap-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg">
                    {proj.code}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-medium">Epic Folder</span>
                </div>

                {/* Title & description */}
                <div>
                  <h3 className="font-sans text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {proj.name}
                  </h3>
                  <p className="font-sans text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                {/* Project metrics */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-400">Activity:</span>
                    <span className="font-mono font-bold text-blue-600">{proj.progress}% Done</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${proj.progress}%`, backgroundColor: barColor }}
                    ></div>
                  </div>
                </div>

                {/* Milestones / actions */}
                <div className="space-y-2 pt-2">
                  <label className="font-mono text-[10px] font-bold text-slate-400 tracking-wider block uppercase">Action Milestones (Toggle level):</label>
                  <div className="space-y-1.5">
                    {proj.milestones.map((milestone, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleToggleMilestone(proj.id, idx)}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-sans text-slate-700 transition-colors select-none"
                      >
                        <div className="w-4 h-4 rounded-lg border border-slate-200 flex items-center justify-center bg-white shrink-0 group-hover:border-blue-600 transition-colors shadow-xs">
                          {proj.progress > (idx * (100 / proj.milestones.length)) && (
                            <div className="w-2.4 h-2.4 bg-blue-600 rounded-md" />
                          )}
                        </div>
                        <span className="truncate font-medium">{milestone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team details */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{proj.team.length} Members</span>
                </span>
                <span className="font-mono text-[10px] italic text-slate-400">Ready for review</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
