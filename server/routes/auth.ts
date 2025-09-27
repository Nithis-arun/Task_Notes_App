import { RequestHandler } from "express";
import { randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { readDB, writeDB, User } from "../store";

const now = () => new Date();
const nowISO = () => now().toISOString();
const SESSION_TTL_HOURS = 72;

function hashPassword(password: string, salt: string) {
  const buf = scryptSync(password, salt, 64);
  return buf.toString("hex");
}

function createSession(userId: string) {
  const token = randomUUID();
  const expires = new Date(now().getTime() + SESSION_TTL_HOURS * 3600 * 1000);
  return { token, userId, expiresAt: expires.toISOString() };
}

export const register: RequestHandler = async (req, res) => {
  const { email, password, name } = req.body as { email?: string; password?: string; name?: string };
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  const emailNorm = String(email).trim().toLowerCase();
  const db = await readDB();
  if (db.users.some((u) => u.email === emailNorm)) return res.status(409).json({ error: "email already in use" });
  const salt = randomUUID();
  const user: User = {
    id: randomUUID(),
    email: emailNorm,
    name: name?.trim() || emailNorm.split("@")[0],
    passwordHash: hashPassword(password, salt),
    passwordSalt: salt,
    createdAt: nowISO(),
  };
  db.users.push(user);
  const session = createSession(user.id);
  db.sessions.push(session);
  await writeDB(db);
  res.status(201).json({ token: session.token, user: { id: user.id, email: user.email, name: user.name } });
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  const emailNorm = String(email).trim().toLowerCase();
  const db = await readDB();
  const user = db.users.find((u) => u.email === emailNorm);
  if (!user) return res.status(401).json({ error: "invalid credentials" });
  const hash = hashPassword(password, user.passwordSalt);
  const ok = timingSafeEqual(Buffer.from(hash), Buffer.from(user.passwordHash));
  if (!ok) return res.status(401).json({ error: "invalid credentials" });
  const session = createSession(user.id);
  db.sessions.push(session);
  await writeDB(db);
  res.json({ token: session.token, user: { id: user.id, email: user.email, name: user.name } });
};

export const me: RequestHandler = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "unauthorized" });
  const token = auth.slice(7);
  const db = await readDB();
  const session = db.sessions.find((s) => s.token === token);
  if (!session) return res.status(401).json({ error: "invalid session" });
  if (new Date(session.expiresAt).getTime() < now().getTime()) return res.status(401).json({ error: "session expired" });
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) return res.status(401).json({ error: "invalid user" });
  res.json({ id: user.id, email: user.email, name: user.name });
};

export const logout: RequestHandler = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(204).end();
  const token = auth.slice(7);
  const db = await readDB();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  await writeDB(db as any);
  res.status(204).end();
};
