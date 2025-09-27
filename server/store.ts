import { promises as fs } from "fs";
import path from "path";
import { Note, Task } from "@shared/api";

const DATA_PATH = path.join(import.meta.dirname, "data", "db.json");

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: string; // ISO
}

interface DBShape {
  tasks: Task[];
  notes: Note[];
  users: User[];
  sessions: Session[];
}

async function ensureFile() {
  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.access(DATA_PATH);
  } catch {
    const initial: DBShape = { tasks: [], notes: [], users: [], sessions: [] };
    await fs.writeFile(DATA_PATH, JSON.stringify(initial, null, 2), "utf-8");
  }
}

export async function readDB(): Promise<DBShape> {
  await ensureFile();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const parsed = JSON.parse(raw) as Partial<DBShape>;
  return {
    tasks: parsed.tasks ?? [],
    notes: parsed.notes ?? [],
    users: parsed.users ?? [],
    sessions: parsed.sessions ?? [],
  };
}

export async function writeDB(db: DBShape): Promise<void> {
  await ensureFile();
  await fs.writeFile(DATA_PATH, JSON.stringify(db, null, 2), "utf-8");
}
