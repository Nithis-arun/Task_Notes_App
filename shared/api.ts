/**
 * Shared code between client and server
 * Types for the Daily Task Tracker + Notes API
 */

// Demo type (kept for reference) 
export interface DemoResponse {
  message: string;
}

export type ID = string;

export interface Task {
  id: ID;
  title: string;
  description?: string;
  dueDate?: string; // ISO string (date-only or datetime)
  priority: "low" | "medium" | "high";
  completed: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface NewTask {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: Task["priority"];
}

export interface UpdateTask {
  title?: string;
  description?: string;
  dueDate?: string | null; // null clears the date
  priority?: Task["priority"];
  completed?: boolean;
}

export interface Note {
  id: ID;
  title: string;
  content: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface NewNote {
  title: string;
  content: string;
}

export interface UpdateNote {
  title?: string;
  content?: string;
}

// API response shapes
export interface Paginated<T> {
  items: T[];
  total: number;
}
