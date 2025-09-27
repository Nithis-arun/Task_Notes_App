import { RequestHandler } from "express";
import { NewTask, Task, UpdateTask } from "@shared/api";
import { readDB, writeDB } from "../store";
import { randomUUID } from "crypto";

const nowISO = () => new Date().toISOString();

export const listTasks: RequestHandler = async (req, res) => {
  const db = await readDB();
  const { day, q } = req.query as { day?: string; q?: string };
  let items = db.tasks;
  if (day) {
    // filter by date (YYYY-MM-DD)
    items = items.filter((t) => t.dueDate?.slice(0, 10) === day);
  }
  if (q) {
    const term = q.toLowerCase();
    items = items.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        (t.description ?? "").toLowerCase().includes(term),
    );
  }
  res.json({ items, total: items.length });
};

export const createTask: RequestHandler = async (req, res) => {
  const payload = req.body as NewTask;
  if (!payload || !payload.title?.trim()) {
    return res.status(400).json({ error: "title is required" });
  }
  const db = await readDB();
  const task: Task = {
    id: randomUUID(),
    title: payload.title.trim(),
    description: payload.description?.trim() || undefined,
    dueDate: payload.dueDate,
    priority: payload.priority ?? "medium",
    completed: false,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  db.tasks.unshift(task);
  await writeDB(db);
  res.status(201).json(task);
};

export const updateTask: RequestHandler = async (req, res) => {
  const id = req.params.id;
  const patch = req.body as UpdateTask;
  const db = await readDB();
  const idx = db.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  const prev = db.tasks[idx];
  const next: Task = {
    ...prev,
    title: patch.title !== undefined ? patch.title : prev.title,
    description:
      patch.description !== undefined ? patch.description || undefined : prev.description,
    dueDate: patch.dueDate === null ? undefined : patch.dueDate ?? prev.dueDate,
    priority: patch.priority ?? prev.priority,
    completed: patch.completed ?? prev.completed,
    updatedAt: nowISO(),
  };
  db.tasks[idx] = next;
  await writeDB(db);
  res.json(next);
};

export const deleteTask: RequestHandler = async (req, res) => {
  const id = req.params.id;
  const db = await readDB();
  const before = db.tasks.length;
  db.tasks = db.tasks.filter((t) => t.id !== id);
  if (db.tasks.length === before) return res.status(404).json({ error: "not found" });
  await writeDB(db);
  res.status(204).end();
};
