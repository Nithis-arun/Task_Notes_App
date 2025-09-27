import { useEffect } from "react";
import { TaskPanel } from "@/components/tracker/TaskComponents";
import { NotesPanel } from "@/components/tracker/NoteComponents";

export default function Index() {
  useEffect(() => {
    // Preload theme choice
    const theme = localStorage.getItem("theme");
    if (!theme) localStorage.setItem("theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  return (
    <div className="grid gap-8">
      <Hero />
      <div className="grid gap-10">
        <section id="tasks" className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Daily Task Tracker</h2>
          <TaskPanel />
        </section>
        <section id="notes" className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Notes</h2>
          <NotesPanel />
        </section>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded-2xl border bg-gradient-to-br from-violet-600 to-blue-600 text-white p-6 sm:p-10">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">TaskNote · One app for daily tasks and notes</h1>
          <p className="mt-3 max-w-prose text-white/90">
            A fast, modern tracker API and UI for mobile and Windows. Capture tasks, set priorities and due times, and keep notes side-by-side.
          </p>
        </div>
      </div>
    </section>
  );
}
