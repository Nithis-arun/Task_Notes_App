import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { NewNote, Note } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";

export function NotesPanel() {
  const [q, setQ] = useState("");
  return (
    <div className="grid gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Input placeholder="Search notes" value={q} onChange={(e) => setQ(e.target.value)} className="sm:ml-auto max-w-sm" />
      </div>
      <div className="grid lg:grid-cols-[1fr,420px] gap-6">
        <NoteList q={q} />
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold mb-2">Add Note</h3>
          <NoteForm />
        </div>
      </div>
    </div>
  );
}

function NoteList({ q }: { q?: string }) {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({ queryKey: ["notes", { q }], queryFn: () => api.notes.list({ q }) });

  const remove = useMutation({
    mutationFn: (id: string) => api.notes.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading notes…</div>;
  if (isError) return (
    <div className="p-6 text-sm text-red-600">
      Error loading notes: {String(error)}
      <div className="mt-3"><button className="underline" onClick={() => (window.location.href = window.location.href)}>Reload</button></div>
    </div>
  );

  return (
    <div className="rounded-xl border bg-card p-2 sm:p-4">
      <h3 className="font-semibold mb-2">Notes</h3>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data?.items.map((n) => (
          <li key={n.id} className="rounded-lg border p-3 bg-background flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium truncate">{n.title}</p>
              <InlineEdit note={n} />
              <Button variant="ghost" size="icon" onClick={() => remove.mutate(n.id)} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-5 whitespace-pre-wrap">{n.content}</p>
          </li>
        ))}
      </ul>
      {data && data.items.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">No notes</div>
      )}
    </div>
  );
}

function InlineEdit({ note }: { note: Note }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const update = useMutation({
    mutationFn: () => api.notes.update(note.id, { title }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      setEditing(false);
    },
  });
  return editing ? (
    <div className="flex items-center gap-2 ml-auto">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 w-32" />
      <Button size="sm" onClick={() => update.mutate()} disabled={!title.trim()}>
        Save
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setEditing(false)} aria-label="Cancel">
        ×
      </Button>
    </div>
  ) : (
    <Button variant="ghost" size="icon" onClick={() => setEditing(true)} aria-label="Edit" className="ml-auto">
      <Pencil className="h-4 w-4" />
    </Button>
  );
}

function NoteForm() {
  const qc = useQueryClient();
  const [form, setForm] = useState<NewNote>({ title: "", content: "" });
  const create = useMutation({
    mutationFn: () => api.notes.create({ title: form.title.trim(), content: form.content }),
    onSuccess: () => {
      setForm({ title: "", content: "" });
      qc.invalidateQueries({ queryKey: ["notes"] });
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
      <Input placeholder="Note title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
      <Textarea placeholder="Content" value={form.content}
        onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
        className="min-h-[160px]"
      />
      <Button type="submit" disabled={!form.title.trim()}>Add Note</Button>
    </form>
  );
}
