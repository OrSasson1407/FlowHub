/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task } from '../types';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Plus, 
  Clock, 
  AlertCircle, 
  Check, 
  Inbox,
  Filter,
  Layers,
  Archive,
  Star
} from 'lucide-react';

interface TasksListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  onDeleteTask: (id: string) => void;
  onArchiveTask: (id: string) => void;
}

export default function TasksList({ 
  tasks, 
  onToggleTask, 
  onAddTask, 
  onDeleteTask,
  onArchiveTask
}: TasksListProps) {
  const [filter, setFilter] = useState<'all' | 'high' | 'active' | 'completed'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueHours, setDueHours] = useState<number>(12);
  const [category, setCategory] = useState('Work');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      priority: newPriority,
      dueInHours: dueHours,
      category: category,
      notes: ''
    });

    setNewTitle('');
    setShowAddForm(false);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'high') return task.priority === 'high' && !task.completed;
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all'
  });

  const highCount = tasks.filter(t => t.priority === 'high' && !t.completed).length;
  const activeCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="space-y-6">
      {/* Backlog Header banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl">
        <div>
          <h2 className="font-sans text-xl font-bold text-slate-900">Workspace Task Engineering</h2>
          <p className="font-sans text-xs text-slate-500 mt-1">
            Map out work segments, technical debt reviews, and homework backlogs.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold tracking-wider rounded-xl transition-all flex items-center gap-1.5 uppercase cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> {showAddForm ? 'Hide Form' : 'Insert task'}
          </button>
        </div>
      </div>

      {/* Advanced Inline insertion Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 space-y-1">
              <label className="font-mono text-[10px] font-bold text-slate-500 tracking-wider block">TASK TITLE</label>
              <input 
                type="text" 
                required 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Update documentation, complete priority review" 
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:border-blue-600 text-slate-900 transition-colors"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="font-mono text-[10px] font-bold text-slate-500 tracking-wider block">PRIORITY</label>
              <select 
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-sans focus:outline-none focus:border-blue-600 text-slate-900 transition-colors"
              >
                <option value="high">HIGH (Core)</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="font-mono text-[10px] font-bold text-slate-500 tracking-wider block">TARGET DUE</label>
              <select 
                value={dueHours} 
                onChange={(e) => setDueHours(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-sans focus:outline-none focus:border-blue-600 text-slate-900 transition-colors"
              >
                <option value={4}>In 4 Hours</option>
                <option value={12}>In 12 Hours</option>
                <option value={18}>In 18 Hours</option>
                <option value={24}>In 24 Hours</option>
                <option value={48}>In 2 Days</option>
                <option value={168}>In 1 Week</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="font-mono text-[10px] font-bold text-slate-500 tracking-wider block">CATEGORY</label>
              <input 
                type="text" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Work, Study" 
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:border-blue-600 text-slate-900 transition-colors"
              />
            </div>
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
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold rounded-xl cursor-pointer"
            >
              Add Backlog Item
            </button>
          </div>
        </form>
      )}

      {/* Filter and stats segments */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-50 border border-slate-200 rounded-2xl gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 font-mono text-xs font-semibold rounded-lg uppercase transition-colors cursor-pointer
              ${filter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'}
            `}
          >
            All Backlog ({tasks.length})
          </button>
          <button 
            onClick={() => setFilter('high')}
            className={`px-3 py-1 font-mono text-xs font-semibold rounded-lg uppercase transition-colors cursor-pointer
              ${filter === 'high' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'}
            `}
          >
            High Priority ({highCount})
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-3 py-1 font-mono text-xs font-semibold rounded-lg uppercase transition-colors cursor-pointer
              ${filter === 'active' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'}
            `}
          >
            Active ({activeCount})
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 font-mono text-xs font-semibold rounded-lg uppercase transition-colors cursor-pointer
              ${filter === 'completed' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'}
            `}
          >
            Completed ({tasks.filter(t => t.completed).length})
          </button>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Total Complete: <span className="font-bold text-blue-600">{tasks.filter(t => t.completed).length}</span> / {tasks.length}
        </div>
      </div>

      {/* Tasks listing area */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Inbox className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="font-sans text-sm">No tasks found matching this priority level.</p>
            <button 
              onClick={() => {
                setNewTitle('Brand new high priority action item');
                setNewPriority('high');
                setShowAddForm(true);
              }}
              className="text-xs font-mono font-semibold text-blue-600 hover:underline"
            >
              Add a new Task
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className={`flex items-center justify-between p-4 group transition-colors hover:bg-slate-50/70 ${task.completed ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-4 min-w-0 max-w-[70%]">
                  {/* Custom checkbox */}
                  <button 
                    onClick={() => onToggleTask(task.id)}
                    className="text-blue-600 transition-transform cursor-pointer shrink-0"
                  >
                    {task.completed ? (
                      <div className="w-5 h-5 bg-emerald-50 rounded-lg border border-emerald-500 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-emerald-700 font-bold" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-lg border border-slate-300 hover:border-blue-600 transition-colors" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <span 
                      onClick={() => onToggleTask(task.id)}
                      className={`font-sans text-sm md:text-base font-bold text-slate-900 block cursor-pointer select-none truncate ${task.completed ? 'line-through text-slate-400 font-normal shadow-none' : ''}`}
                    >
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] text-slate-500 font-medium tracking-wider uppercase bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">
                        {task.category || 'General'}
                      </span>
                      {task.dueInHours && !task.completed && (
                        <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Due in {task.dueInHours}h
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Left indicators & right Actions */}
                <div className="flex items-center gap-3">
                  {/* Badge */}
                  <span className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg tracking-widest ${
                    task.priority === 'high' 
                      ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                      : task.priority === 'medium'
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : 'bg-slate-50 text-slate-600 border border-slate-100'
                  }`}>
                    {task.priority}
                  </span>

                  {/* Actions (visible on hover) */}
                  <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onArchiveTask(task.id)}
                      className="p-1 px-1.5 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-lg hover:text-blue-600 transition-all cursor-pointer"
                      title="Archive task"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 px-1.5 border border-slate-200 hover:bg-rose-50 text-slate-500 rounded-lg hover:text-rose-600 transition-all cursor-pointer"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visual Proposing of quick keys */}
      <div className="p-4 bg-slate-50 text-center rounded-xl border border-dashed border-slate-200 text-xs font-mono text-slate-500 justify-center">
        💡 <span className="font-semibold text-slate-800">Workspace Power Tip:</span> Press <kbd className="bg-white border border-slate-200 text-slate-800 font-semibold px-1 rounded shadow-sm text-[10px]">N</kbd> on any screen to quick-insert a task, or <kbd className="bg-white border border-slate-200 text-slate-800 font-semibold px-1 rounded shadow-sm text-[10px]">D</kbd> to toggle the topmost Priority item.
      </div>
    </div>
  );
}
