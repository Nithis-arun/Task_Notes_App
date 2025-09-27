import { RequestHandler } from "express";
import { NewNote, Note, UpdateNote } from "@shared/api";
import { readDB, writeDB } from "../store";
import { randomUUID } from "crypto";

const nowISO = () => new Date().toISOString();

export const listNotes: RequestHandler = async (req, res) => {
  const db = await readDB();
  const { q } = req.query as { q?: string };
  let items = db.notes;
  if (q) {
    const term = q.toLowerCase();
    items = items.filter(
      (n) => n.title.toLowerCase().includes(term) || n.content.toLowerCase().includes(term),
    );
  }
  res.json({ items, total: items.length });
};

export const createNote: RequestHandler = async (req, res) => {
  const payload = req.body as NewNote;
  if (!payload || !payload.title?.trim()) {
    return res.status(400).json({ error: "title is required" });
  }
  const db = await readDB();
  const note: Note = {
    id: randomUUID(),
    title: payload.title.trim(),
    content: payload.content ?? "",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  db.notes.unshift(note);
  await writeDB(db);
  res.status(201).json(note);
};

export const updateNote: RequestHandler = async (req, res) => {
  const id = req.params.id;
  const patch = req.body as UpdateNote;
  const db = await readDB();
  const idx = db.notes.findIndex((n) => n.id === id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  const prev = db.notes[idx];
  const next: Note = {
    ...prev,
    title: patch.title !== undefined ? patch.title : prev.title,
    content: patch.content !== undefined ? patch.content : prev.content,
    updatedAt: nowISO(),
  };
  db.notes[idx] = next;
  await writeDB(db);
  res.json(next);
};

export const deleteNote: RequestHandler = async (req, res) => {
  const id = req.params.id;
  const db = await readDB();
  const before = db.notes.length;
  db.notes = db.notes.filter((n) => n.id !== id);
  if (db.notes.length === before) return res.status(404).json({ error: "not found" });
  await writeDB(db);
  res.status(204).end();
};
