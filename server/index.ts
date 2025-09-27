import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { createTask, deleteTask, listTasks, updateTask } from "./routes/tasks";
import { createNote, deleteNote, listNotes, updateNote } from "./routes/notes";
import { login, me, register, logout } from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Tasks API
  app.get("/api/tasks", listTasks);
  app.post("/api/tasks", createTask);
  app.patch("/api/tasks/:id", updateTask);
  app.delete("/api/tasks/:id", deleteTask);

  // Notes API
  app.get("/api/notes", listNotes);
  app.post("/api/notes", createNote);
  app.patch("/api/notes/:id", updateNote);
  app.delete("/api/notes/:id", deleteNote);

  // Auth API
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.get("/api/auth/me", me);
  app.post("/api/auth/logout", logout);

  return app;
}
