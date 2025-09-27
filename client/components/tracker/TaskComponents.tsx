import React, { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { NewTask, Task } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";

export function TaskPanel() {
  const [view, setView] = useState<"today" | "all">("today");
  const [q, setQ] = useState("");
  const day = useMemo(() => (view === "today" ? new Date().toISOString().slice(0, 10) : undefined), [view]);
  return (
    <div className="grid gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="inline-flex rounded-md border p-1">
          <button
            className={
              "px-3 py-1.5 text-sm rounded-md " + (view === "today" ? "bg-primary text-primary-foreground" : "hover:bg-accent")
            }
            onClick={() => setView("today")}
          >
            Today
          </button>
          <button
            className={
              "px-3 py-1.5 text-sm rounded-md " + (view === "all" ? "bg-primary text-primary-foreground" : "hover:bg-accent")
            }
            onClick={() => setView("all")}
          >
            All
          </button>
        </div>
        <Input placeholder="Search tasks" value={q} onChange={(e) => setQ(e.target.value)} className="sm:ml-auto max-w-sm" />
      </div>
      <div className="grid lg:grid-cols-[1fr,420px] gap-6">
        <TaskList day={day} q={q} />
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold mb-2">Add Task</h3>
          <TaskForm onCreated={() => {}} />
        </div>
      </div>
    </div>
  );
}

function TaskList({ day, q }: { day?: string; q?: string }) {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tasks", { day, q }],
    queryFn: () => api.tasks.list({ day, q }),
  });

  const toggle = useMutation({
    mutationFn: (task: Task) => api.tasks.update(task.id, { completed: !task.completed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.tasks.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading tasks…</div>;
  if (isError) return (
    <div className="p-6 text-sm text-red-600">
      Error loading tasks: {String(error)}
      <div className="mt-3">
        <button className="underline" onClick={() => (window.location.href = window.location.href)}>Reload</button>
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border bg-card p-2 sm:p-4">
      <h3 className="font-semibold mb-2">Tasks {day ? `· ${day}` : ""}</h3>
      <ul className="divide-y">
        {data?.items.map((t) => (
          <li key={t.id} className="flex items-start gap-3 py-3">
            <button
              className="mt-1 text-muted-foreground hover:text-primary"
              onClick={() => toggle.mutate(t)}
              aria-label={t.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {t.completed ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5" />}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={t.completed ? "line-through text-muted-foreground" : ""}>{t.title}</p>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[10px] font-medium "+
                    (t.priority === "high"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      : t.priority === "medium"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300")
                  }
                >
                  {t.priority}
                </span>
                {t.dueDate && (
                  <span className="text-xs text-muted-foreground">due {new Date(t.dueDate).toLocaleString()}</span>
                )}
              </div>
              {t.description && (
                <p className="text-sm text-muted-foreground mt-0.5">{t.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <InlineEdit task={t} />
              <Button variant="ghost" size="icon" onClick={() => remove.mutate(t.id)} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
        {data && data.items.length === 0 && (
          <li className="py-8 text-center text-sm text-muted-foreground">No tasks</li>
        )}
      </ul>
    </div>
  );
}

function InlineEdit({ task }: { task: Task }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const update = useMutation({
    mutationFn: () => api.tasks.update(task.id, { title }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setEditing(false);
    },
  });
  return editing ? (
    <div className="flex items-center gap-2">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 w-40" />
      <Button size="sm" onClick={() => update.mutate()} disabled={!title.trim()}>
        Save
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setEditing(false)} aria-label="Cancel">
        ×
      </Button>
    </div>
  ) : (
    <Button variant="ghost" size="icon" onClick={() => setEditing(true)} aria-label="Edit">
      <Pencil className="h-4 w-4" />
    </Button>
  );
}

function TaskForm({ onCreated }: { onCreated?: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<NewTask>({ title: "", description: "", dueDate: "", priority: "medium" });
  const create = useMutation({
    mutationFn: () =>
      api.tasks.create({
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
        priority: form.priority,
      }),
    onSuccess: () => {
      setForm({ title: "", description: "", dueDate: "", priority: "medium" });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      onCreated?.();
    },
  });

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        create.mutate();
      }}
    >
      <Input placeholder="Task title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
      <Textarea placeholder="Description (optional)" value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input type="datetime-local" value={form.dueDate}
          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
        />
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={form.priority}
          onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as any }))}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <Button type="submit" disabled={!form.title.trim()}>
        Add Task
      </Button>
    </form>
  );
}
