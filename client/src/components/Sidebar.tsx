/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart2, 
  CheckSquare, 
  Calendar, 
  Folder, 
  Archive, 
  HelpCircle, 
  Plus, 
  Settings, 
  User, 
  Sliders,
  Play
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'tasks' | 'calendar' | 'projects';
  setActiveTab: (tab: 'dashboard' | 'tasks' | 'calendar' | 'projects') => void;
  onOpenNewTaskModal: () => void;
  onOpenArchivedModal: () => void;
  onOpenHelpModal: () => void;
  onLaunchWizard: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenNewTaskModal,
  onOpenArchivedModal,
  onOpenHelpModal,
  onLaunchWizard
}: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-slate-200 flex flex-col justify-between py-6 px-4 z-10 select-none shadow-[1px_0_3px_rgba(0,0,0,0.01)]">
      
      {/* Brand Header */}
      <div>
        <div className="mb-8 pl-2">
          <div className="flex items-center gap-2">
            <h1 className="font-sans text-xl font-extrabold tracking-tight text-slate-900">FlowHub</h1>
            <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">v1.2</span>
          </div>
          <p className="font-mono text-[9px] text-slate-400 uppercase tracking-[0.15em] mt-1">
            Personal Workspace
          </p>
        </div>

        {/* Primary Tab Navigation */}
        <nav className="space-y-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-sans text-xs font-semibold uppercase tracking-wider text-left border cursor-pointer
              ${activeTab === 'dashboard' 
                ? 'bg-blue-50/70 text-blue-600 border-transparent shadow-xs' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent'
              }
            `}
          >
            <BarChart2 className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-sans text-xs font-semibold uppercase tracking-wider text-left border cursor-pointer
              ${activeTab === 'tasks' 
                ? 'bg-blue-50/70 text-blue-600 border-transparent shadow-xs' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent'
              }
            `}
          >
            <CheckSquare className="w-4 h-4 shrink-0" />
            <span>Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-sans text-xs font-semibold uppercase tracking-wider text-left border cursor-pointer
              ${activeTab === 'calendar' 
                ? 'bg-blue-50/70 text-blue-600 border-transparent shadow-xs' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent'
              }
            `}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-sans text-xs font-semibold uppercase tracking-wider text-left border cursor-pointer
              ${activeTab === 'projects' 
                ? 'bg-blue-50/70 text-blue-600 border-transparent shadow-xs' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent'
              }
            `}
          >
            <Folder className="w-4 h-4 shrink-0" />
            <span>Projects</span>
          </button>
        </nav>
      </div>

      {/* Button & Auxiliary controls */}
      <div className="mt-auto space-y-4">
        {/* Quick Setup Wizard Launch Button */}
        <button 
          onClick={onLaunchWizard}
          className="w-full py-2 border border-dashed border-slate-200 hover:border-blue-600 hover:bg-blue-50/30 text-slate-500 hover:text-blue-600 text-[10px] font-mono font-bold tracking-widest rounded-xl uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" /> RE-RUN WIZARD
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onOpenNewTaskModal}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> New Task [N]
        </button>

        {/* Subsidiary Link List */}
        <div className="pt-4 border-t border-slate-100 space-y-1">
          <button 
            onClick={onOpenArchivedModal}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all font-sans text-xs font-medium uppercase tracking-wider text-left cursor-pointer"
          >
            <Archive className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Archived</span>
          </button>

          <button 
            onClick={onOpenHelpModal}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all font-sans text-xs font-medium uppercase tracking-wider text-left cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Help & Hotkeys</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
