import { NewNote, NewTask, Note, Paginated, Task, UpdateNote, UpdateTask } from "@shared/api";

function authHeader() {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildUrl(input: RequestInfo) {
  const asStr = String(input || "");
  try {
    // if absolute URL, return as-is
    new URL(asStr);
    return asStr;
  } catch {
    // relative -> resolve against current origin
    return new URL(asStr, window.location.origin).toString();
  }
}

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const url = buildUrl(input);
  const method = (init?.method || "GET").toUpperCase();
  const isGet = method === "GET";
  const cacheKey = isGet ? `cache:${new URL(url).pathname}` : null;

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...authHeader(),
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    // allow empty responses
    const txt = await res.text();
    try {
      const parsed = JSON.parse(txt) as T;
      // cache GET responses for offline fallback
      if (isGet && cacheKey) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(parsed));
        } catch {}
      }
      return parsed;
    } catch {
      // not JSON, return as any
      return (txt as unknown) as T;
    }
  } catch (err: any) {
    // Network or CORS error - fallback to cache for GET
    if (isGet && cacheKey) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          console.warn("Network error, returning cached response for", url);
          return JSON.parse(cached) as T;
        }
      } catch (e) {
        // ignore
      }
    }
    throw new Error(err?.message ? `Network error: ${err.message}` : "Network error");
  }
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; name?: string }) =>
      http<{ token: string; user: { id: string; email: string; name: string } }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      http<{ token: string; user: { id: string; email: string; name: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => http<{ id: string; email: string; name: string }>("/api/auth/me"),
    logout: () => fetch(buildUrl("/api/auth/logout"), { method: "POST", headers: { ...authHeader() } }),
  },
  tasks: {
    list: (params?: { day?: string; q?: string }) => http<Paginated<Task>>(`/api/tasks${toQuery(params)}`),
    create: (data: NewTask) => http<Task>("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: UpdateTask) => http<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetch(buildUrl(`/api/tasks/${id}`), { method: "DELETE", headers: { ...authHeader() } }),
  },
  notes: {
    list: (params?: { q?: string }) => http<Paginated<Note>>(`/api/notes${toQuery(params)}`),
    create: (data: NewNote) => http<Note>("/api/notes", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: UpdateNote) => http<Note>(`/api/notes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetch(buildUrl(`/api/notes/${id}`), { method: "DELETE", headers: { ...authHeader() } }),
  },
};

function toQuery(params: Record<string, string | undefined> | undefined) {
  if (!params) return "";
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.append(k, v);
  });
  const str = q.toString();
  return str ? `?${str}` : "";
}
