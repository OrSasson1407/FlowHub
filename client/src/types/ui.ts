/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Task {
  id: string;
  title: string;
  dueInHours?: number; // e.g. 4 for "Due in 4h"
  dueDate?: string;     // custom due string if any
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  notes?: string;
  category?: string; // e.g. "Work", "Personal", "Study"
}

export interface TimelineEvent {
  id: string;
  time: string;           // e.g., "09:00 AM"
  title: string;
  location: string;       // e.g., "Engineering Room 4"
  durationMinutes: number; // e.g., 60
  isAvailableSlot?: boolean; // If true, it represents a free slot like "90m Available Time"
}

export type InboxSource = 'github' | 'reminders' | 'email' | 'gmail' | 'slack' | 'jira' | 'calendar' | 'system';

export interface InboxItem {
  id: string;
  source: InboxSource;
  title: string;
  timeDelta: string;
  archived: boolean;
  detailText?: string;
  url?: string;
}

export interface WorkspaceConfig {
  email: string;
  calendarSynced: 'google' | 'outlook' | null;
  connectedIntegrations: string[];
  setupCompleted: boolean;
  hasSeenWizard: boolean;
}
