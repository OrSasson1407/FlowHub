/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TimelineEvent } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Sparkles, 
  Heart,
  Globe,
  Settings,
  HelpCircle,
  TrendingUp
} from 'lucide-react';

interface CalendarViewProps {
  events: TimelineEvent[];
  onAddEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

export default function CalendarView({
  events,
  onAddEvent,
  onDeleteEvent
}: CalendarViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('02:00 PM');
  const [location, setLocation] = useState('Conference Room A');
  const [duration, setDuration] = useState(60);
  const [timezone, setTimezone] = useState('GMT-5');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      title: title.trim(),
      time,
      location,
      durationMinutes: duration,
      isAvailableSlot: false
    });

    setTitle('');
    setShowAddModal(false);
  };

  const handleBookAvailableSlot = (minutes: number, indexBefore: number) => {
    // Quick booking helper
    setTitle(`Dev Block: System Hack`);
    setTime(`12:30 PM`);
    setLocation(`Flow Station 3`);
    setDuration(minutes);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Upper overview header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 text-[9px] font-mono tracking-widest bg-slate-900 text-white rounded-md uppercase font-bold">LIVE AGENT</span>
            <h2 className="font-sans text-xl font-bold text-slate-900">Focus & Meeting Agenda</h2>
          </div>
          <p className="font-sans text-xs text-slate-500 mt-1">
            Analyze available focus blocks, schedule milestones, and sync tasks to time intervals.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 border border-slate-200 px-3 py-1.5 rounded-xl bg-slate-50">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-mono text-xs font-semibold">{timezone}</span>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold tracking-wider rounded-xl transition-all flex items-center gap-1.5 uppercase cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Book meeting
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Scheduler Form inside Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/30 flex items-center justify-center z-50 p-4 transition-opacity backdrop-blur-xs animate-fadeIn">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 w-full max-w-md shadow-xl animate-scaleIn">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-sans text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" /> Book Time Block
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-405 hover:text-slate-900 font-bold p-1 hover:bg-slate-50 rounded-lg text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] font-bold text-slate-500 tracking-wider block">EVENT TITLE</label>
                  <input 
                    type="text" 
                    required 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Standup, Exam Study, Deep Focus, Review" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] font-bold text-slate-500 tracking-wider block">TIME (EST/Local)</label>
                    <input 
                      type="text" 
                      required 
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="e.g. 02:00 PM" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] font-bold text-slate-500 tracking-wider block">DURATION (MINUTES)</label>
                    <input 
                      type="number" 
                      required 
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      placeholder="60" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[10px] font-bold text-slate-500 tracking-wider block">LOCATION / URL</label>
                  <input 
                    type="text" 
                    required 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Engineering Room 4, Virtual Meet, Flow Mode" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-mono text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                  >
                    Insert Block
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Timeline main scheduler container (matches mockup exactly) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 md:p-8 rounded-2xl relative shadow-sm">
          <div className="flex justify-between items-center mb-8 pb-3 border-b border-slate-150">
            <h3 className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">Chronological Schedule Timeline</h3>
            <span className="font-mono text-xs text-slate-400 italic">GMT-5 Schedule Base</span>
          </div>

          <div className="relative pl-8 border-l-2 border-slate-200 space-y-6">
            {events.map((event, index) => {
              // If it's a gap block description:
              if (event.isAvailableSlot) {
                return (
                  <div 
                    key={event.id}
                    className="py-4 bg-slate-50 px-4 border-l-4 border-dashed border-blue-600/40 -ml-8 pl-12 flex items-center justify-between rounded-r-2xl transition-all hover:bg-blue-50/10"
                  >
                    <div>
                      <p className="font-mono text-xs font-bold italic text-blue-600">
                        ⚡ {event.durationMinutes}m Available Focus Block
                      </p>
                      <p className="font-sans text-[11px] text-slate-400 mt-0.5">No schedule overlaps detected here.</p>
                    </div>
                    <button 
                      onClick={() => handleBookAvailableSlot(event.durationMinutes, index)}
                      className="px-3 py-1 bg-blue-600 text-white font-sans text-[10px] font-bold tracking-wider rounded-lg transition-all hover:bg-blue-700 uppercase cursor-pointer"
                    >
                      Book focus
                    </button>
                  </div>
                );
              }

              // Normal node
              return (
                <div key={event.id} className="relative group transition-all">
                  {/* Circle dot node on line */}
                  <div className="absolute -left-[39px] top-1.5 w-4 h-4 bg-white border-4 border-blue-600 rounded-full group-hover:scale-125 transition-all"></div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-3.5 border border-slate-100 hover:border-blue-500/20 rounded-xl hover:bg-slate-50/50 transition-colors gap-3 bg-white">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-xs font-semibold text-slate-500">{event.time}</span>
                        <span className="text-[10px] font-mono text-slate-400">• {event.durationMinutes}m</span>
                      </div>
                      <h4 className="font-sans text-base font-bold text-slate-900">{event.title}</h4>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onDeleteEvent(event.id)}
                        className="p-1 px-2 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-lg transition-all cursor-pointer text-[10px] font-sans font-bold uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Info pane (Gives amazing professional aesthetic density!) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
            <h4 className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Workspace Diagnostics
            </h4>
            <div className="space-y-3 font-sans text-xs text-slate-500">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Total Booked Intervals:</span>
                <span className="font-mono font-bold text-slate-900">{events.filter(e => !e.isAvailableSlot).length} Sessions</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Free Focus Room:</span>
                <span className="font-mono font-bold text-emerald-700">90 Minutes</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Overlap Risks:</span>
                <span className="font-mono font-bold text-emerald-600">0 critical warnings</span>
              </div>
              <div className="flex justify-between">
                <span>Connected Provider:</span>
                <span className="font-mono font-bold text-blue-600">Standard (Direct)</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl text-center space-y-2 shadow-xs">
            <Sparkles className="w-6 h-6 mx-auto text-blue-600" />
            <h5 className="font-sans text-sm font-bold text-slate-900">Autopilot Scheduling</h5>
            <p className="font-sans text-xs text-slate-500">
              Enable Google or Exchange sync from the Wizard. FlowHub will auto-inject available spaces between high priority tickets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
