/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task, TimelineEvent, InboxItem, WorkspaceConfig } from '../types';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  AlarmClock, 
  Terminal, 
  ShoppingCart, 
  Mail, 
  MessageSquare, 
  Check, 
  ChevronRight, 
  Search, 
  Trash2, 
  Archive,
  ArrowUpRight,
  Sparkles,
  GitPullRequest,
  CheckSquare,
  Bookmark,
  Bell
} from 'lucide-react';

interface DashboardProps {
  config: WorkspaceConfig;
  todayDate: string;
  tasks: Task[];
  events: TimelineEvent[];
  inbox: InboxItem[];
  onToggleTask: (id: string) => void;
  onDelayTask: (id: string) => void;
  onArchiveInbox: (id: string) => void;
  onArchiveAllInbox: () => void;
  onSelectAllInbox: () => void;
  onAddQuickTask: (title: string, priority: 'high' | 'medium' | 'low') => void;
}

export default function Dashboard({
  config,
  todayDate,
  tasks,
  events,
  inbox,
  onToggleTask,
  onDelayTask,
  onArchiveInbox,
  onArchiveAllInbox,
  onSelectAllInbox,
  onAddQuickTask
}: DashboardProps) {
  
  // States for interactive drawer & filters
  const [selectedInboxItem, setSelectedInboxItem] = useState<InboxItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllInbox, setShowAllInbox] = useState(false);

  // Filter tasks that are High priority and incomplete
  const highPriorityTasks = tasks.filter(task => task.priority === 'high' && !task.completed);
  const openTasksCount = tasks.filter(task => !task.completed).length;
  const completedTasksCount = tasks.filter(task => task.completed).length;
  const allTasksCount = tasks.length;
  
  // Calculate day progress ring parameters
  const dayProgressPercentage = allTasksCount > 0 
    ? Math.round((completedTasksCount / allTasksCount) * 100) 
    : 0;

  // SVG parameters for standard 24px/48px radius ring
  const circleRadius = 40;
  const circumference = circleRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (dayProgressPercentage / 100) * circumference;

  // Search filter across tasks, timeline, or inbox
  const filteredInbox = inbox.filter(item => {
    if (item.archived) return false;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const displayInboxItems = showAllInbox ? filteredInbox : filteredInbox.slice(0, 4);

  // Return source logo/icon helper
  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'github':
        return <GitPullRequest className="w-4 h-4 text-blue-600" />;
      case 'reminders':
        return <ShoppingCart className="w-4 h-4 text-blue-600" />;
      case 'email':
      case 'gmail':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'calendar':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'slack':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'jira':
        return <Terminal className="w-4 h-4 text-blue-600" />;
      default:
        return <Bookmark className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Today Overview Banner Container (Matches mockup precisely) */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white p-6 md:p-8 border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden select-none">
        
        {/* Decorative thin accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>

        <div className="md:col-span-8 space-y-2">
          <h2 className="font-mono text-xs font-bold text-blue-600 uppercase tracking-[0.15em]">Today Overview</h2>
          <h3 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {new Date(`${todayDate}T00:00:00`).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h3>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-500 text-xs font-sans pt-1">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <span>{openTasksCount} Open Tasks</span>
            </div>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full hidden sm:block"></div>
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Next: {events.find((event) => !event.isAvailableSlot)?.title || 'No scheduled blocks'}</span>
            </div>
            {config.connectedIntegrations.length > 0 && (
              <>
                <div className="w-1.5 h-1.5 bg-slate-200 rounded-full hidden sm:block"></div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase font-bold">
                  <span>Stack Connected: {config.connectedIntegrations.join(', ')}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Circular Progress Area on Right */}
        <div className="md:col-span-4 flex justify-start md:justify-end items-center gap-4 pt-4 md:pt-0">
          <div className="relative flex items-center justify-center">
            <svg className="w-20 h-20 md:w-24 md:h-24 transform -rotate-90">
              {/* Background circle */}
              <circle 
                cx="48" 
                cy="48" 
                r={circleRadius} 
                className="text-slate-100 fill-none"
                strokeWidth="6" 
              />
              {/* Foreground circle with animation */}
              <circle 
                cx="48" 
                cy="48" 
                r={circleRadius} 
                className="text-blue-600 fill-none transition-all duration-700 ease-out"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="font-mono text-xs md:text-sm font-bold text-slate-900">{dayProgressPercentage}%</span>
            </div>
          </div>
          <div>
            <p className="font-sans text-xs md:text-sm text-slate-500 font-medium">Day Progress</p>
            <p className="font-mono text-xs font-bold text-slate-900 tracking-wider uppercase mt-0.5">
              {completedTasksCount}/{allTasksCount} Done
            </p>
          </div>
        </div>
      </section>

      {/* Grid of central block widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 2. Left Column: Chronological Day Timeline */}
        <section className="lg:col-span-4 bg-white p-5 md:p-6 border border-slate-200 rounded-2xl shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-mono text-xs font-bold text-slate-950 uppercase tracking-wider">Timeline</h4>
            <span className="text-slate-400 font-mono text-xs font-medium">GMT-5</span>
          </div>

          <div className="relative pl-6 border-l border-slate-200 space-y-6">
            {events.map((event) => {
              if (event.isAvailableSlot) {
                return (
                  <div 
                    key={event.id}
                    className="py-3 bg-slate-50 border-l-2 border-dashed border-blue-600/40 -ml-6 pl-10 pr-2 rounded-r-xl"
                  >
                    <p className="font-mono text-[11px] text-blue-600 font-bold italic">
                      {event.durationMinutes}m Available Focus Time
                    </p>
                  </div>
                );
              }

              return (
                <div key={event.id} className="relative group select-none">
                  {/* Circle dot accent */}
                  <div className="absolute -left-[30px] top-1.5 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-full group-hover:bg-blue-600 transition-colors"></div>
                  
                  <div className="space-y-0.5">
                    <p className="font-mono text-[11px] text-slate-400 font-medium">{event.time}</p>
                    <h5 className="font-sans text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h5>
                    <p className="font-sans text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-600" /> {event.location}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Right Column: High Priority Core & Unified Inbox */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* High Priority Core Action List */}
          <section className="bg-white p-5 md:p-6 border border-slate-200 rounded-2xl shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">High Priority Core</h4>
              <span className="font-mono text-xs font-bold text-rose-700 uppercase bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg tracking-widest">
                {highPriorityTasks.length} Critical Actions
              </span>
            </div>

            <div className="space-y-3">
              {highPriorityTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <CheckSquare className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="font-sans text-xs">All high-priority actions cleared! High-efficiency state achieved.</p>
                </div>
              ) : (
                highPriorityTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex flex-col sm:flex-row items-add-center justify-between p-4 bg-white hover:bg-slate-50/75 border border-slate-100 hover:border-slate-200 rounded-xl transition-all duration-200 group relative overflow-hidden gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 font-mono text-[9px] font-bold uppercase rounded border border-rose-100 select-none">
                        HIGH
                      </span>
                      <div>
                        <h5 className="font-sans text-sm md:text-base font-bold text-slate-900 truncate max-w-xs md:max-w-md select-text">
                          {task.title}
                        </h5>
                        <p className="font-mono text-[10px] text-rose-600 flex items-center gap-1 mt-0.5">
                          <AlarmClock className="w-3.5 h-3.5 shrink-0" />
                          Due in {task.dueInHours || 12}h
                        </p>
                      </div>
                    </div>

                    {/* Action buttons revealed on card hover (Desktop/Mobile responsive flex) */}
                    <div className="flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity w-full sm:w-auto justify-end">
                      <button 
                        onClick={() => onToggleTask(task.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-sans text-[10px] font-bold tracking-wider rounded-lg uppercase cursor-pointer transition-all active:translate-y-px"
                      >
                        Done [D]
                      </button>
                      <button 
                        onClick={() => onDelayTask(task.id)}
                        className="px-3 py-1 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 font-sans text-[10px] font-bold tracking-wider rounded-lg uppercase cursor-pointer"
                      >
                        Delay
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 4. Unified Inbox Triage Grid */}
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
              <div>
                <h4 className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">Unified Inbox</h4>
                <p className="font-sans text-[11px] text-slate-500 mt-0.5">Triaged notifications from active workspaces.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={onSelectAllInbox}
                  className="text-slate-500 font-mono text-[10px] font-bold uppercase tracking-wider hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Select All
                </button>
                <button 
                  onClick={onArchiveAllInbox}
                  className="text-slate-500 font-mono text-[10px] font-bold uppercase tracking-wider hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Archive All ({inbox.filter(i => !i.archived).length})
                </button>
              </div>
            </div>

            {/* High Density Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F8FAFC] border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-2.5 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source</th>
                    <th className="px-6 py-2.5 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item Description</th>
                    <th className="px-6 py-2.5 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900">
                  {displayInboxItems.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-xs font-sans text-slate-400 space-y-2">
                        <Check className="w-8 h-8 mx-auto text-emerald-500 bg-emerald-50 rounded-full p-1.5" />
                        <p>Inbox fully triaged & archived!</p>
                      </td>
                    </tr>
                  ) : (
                    displayInboxItems.map((item) => (
                      <tr 
                        key={item.id} 
                        onClick={() => setSelectedInboxItem(item)}
                        className="cursor-pointer transition-colors hover:bg-slate-50 group"
                      >
                        {/* Source column */}
                        <td className="px-6 py-3.5 flex items-center gap-2 select-none">
                          {getSourceIcon(item.source)}
                          <span className="font-mono text-xs font-bold text-slate-950 tracking-wide capitalize">
                            {item.source}
                          </span>
                        </td>
                        
                        {/* Description column */}
                        <td className="px-6 py-3.5 max-w-sm">
                          <span className="font-sans text-xs md:text-sm text-slate-900 group-hover:text-blue-600 transition-colors font-semibold block truncate">
                            {item.title}
                          </span>
                        </td>

                        {/* Relative added time */}
                        <td className="px-6 py-3.5 text-right font-mono text-xs text-slate-500">
                          <span className="group-hover:hidden">{item.timeDelta}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onArchiveInbox(item.id);
                            }}
                            className="hidden group-hover:inline-flex items-center gap-1.5 p-1 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 rounded-lg transition-all"
                            title="Achieve notification"
                          >
                            <Archive className="w-3 h-3 shrink-0" /> Triage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* View pagination controls */}
            {filteredInbox.length > 4 && (
              <div className="p-4 bg-slate-50/50 text-center border-t border-slate-100">
                <button 
                  onClick={() => setShowAllInbox(!showAllInbox)}
                  className="font-mono text-xs font-bold tracking-widest text-blue-600 uppercase hover:underline cursor-pointer"
                >
                  {showAllInbox ? 'Collapse Inbox Items' : `View All ${filteredInbox.length} Inbox Items`}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Inbox Detail / Quick Triage Action Drawer */}
      {selectedInboxItem && (
        <div className="fixed inset-0 bg-slate-900/30 z-40 flex justify-end transition-opacity backdrop-blur-xs">
          <div className="bg-white border-l border-slate-200 w-full max-w-md h-full p-6 md:p-8 flex flex-col justify-between shadow-xl animate-slideLeft">
            
            {/* Header controls inside slide panel */}
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {getSourceIcon(selectedInboxItem.source)}
                  <span className="font-sans text-xs font-bold uppercase tracking-widest text-slate-900">Triage item</span>
                </div>
                <button 
                  onClick={() => setSelectedInboxItem(null)}
                  className="text-slate-400 hover:text-slate-900 font-semibold p-1 hover:bg-slate-50 rounded-lg text-xs"
                >
                  ✕ CLOSE CARD
                </button>
              </div>

              {/* Title & Body Context */}
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[10px] text-slate-400">{selectedInboxItem.timeDelta} via {selectedInboxItem.source}</span>
                  <h3 className="font-sans text-lg font-bold text-slate-900 mt-1 leading-snug">
                    {selectedInboxItem.title}
                  </h3>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs leading-relaxed text-slate-600 font-sans">
                  {selectedInboxItem.detailText || (
                    <p>No extra descriptions crawled for this item yet. This triage notice arrived on your developer webhook regarding remote updates. Action or archive this segment accordingly.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick conversion and archive buttons */}
            <div className="space-y-2 border-t border-slate-100 pt-6">
              <button 
                onClick={() => {
                  onAddQuickTask(selectedInboxItem.title, 'high');
                  onArchiveInbox(selectedInboxItem.id);
                  setSelectedInboxItem(null);
                }}
                className="w-full py-3 bg-blue-600 text-white font-sans text-xs font-bold tracking-wider rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" /> Convert to core High task
              </button>

              <button 
                onClick={() => {
                  onArchiveInbox(selectedInboxItem.id);
                  setSelectedInboxItem(null);
                }}
                className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-sans text-xs font-bold tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Archive className="w-4 h-4" /> Just archive alert
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
