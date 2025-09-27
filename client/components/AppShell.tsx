import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sun, Moon, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-violet-950">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Brand />
          <Nav />
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">Hi, {user.name}</span>
                <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
              </>
            ) : (
              <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent">Login</Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>
            TaskNote · Daily Tasks and Notes · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-white grid place-items-center shadow">
        <CheckSquare className="h-4 w-4" />
      </div>
      <span className="text-lg">TaskNote</span>
    </Link>
  );
}

function Nav() {
  const location = useLocation();
  const link = (
    <Link
      to="/"
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium",
        location.pathname === "/" ? "bg-primary text-primary-foreground" : "hover:bg-accent",
      )}
    >
      Home
    </Link>
  );
  return <nav className="hidden sm:block">{link}</nav>;
}

function ThemeToggle() {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        const root = document.documentElement;
        root.classList.toggle("dark");
        localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
      }}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 dark:hidden" />
      <Moon className="h-4 w-4 hidden dark:block" />
    </Button>
  );
}
