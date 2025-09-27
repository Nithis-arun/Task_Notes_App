import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      navigate("/");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm"
      >
        <motion.h1
          layout
          className="text-2xl font-extrabold tracking-tight text-center bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent"
        >
          {mode === "login" ? "Welcome back" : "Create your account"}
        </motion.h1>
        <p className="text-center text-sm text-muted-foreground mt-1">
          {mode === "login" ? "Sign in to track your workouts, tasks, and notes." : "Start your gym journey with milestones."}
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          {mode === "register" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" />
            </motion.div>
          )}
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button type="submit" className="mt-2">
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          {mode === "login" ? (
            <button className="underline underline-offset-4" onClick={() => setMode("register")}>Need an account? Sign up</button>
          ) : (
            <button className="underline underline-offset-4" onClick={() => setMode("login")}>Have an account? Sign in</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
