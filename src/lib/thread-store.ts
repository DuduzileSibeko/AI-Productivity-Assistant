import type { UIMessage } from "ai";

export type Thread = { id: string; title: string; messages: UIMessage[]; createdAt: number };

type Listener = () => void;

class ThreadStore {
  private threads = new Map<string, Thread>();
  private listeners = new Set<Listener>();

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  private emit() {
    this.listeners.forEach((l) => l());
  }

  list = (): Thread[] => {
    return Array.from(this.threads.values()).sort((a, b) => b.createdAt - a.createdAt);
  };

  get = (id: string): Thread | undefined => this.threads.get(id);

  ensure = (id: string) => {
    if (!this.threads.has(id)) {
      this.threads.set(id, {
        id,
        title: "New chat",
        messages: [],
        createdAt: Date.now(),
      });
      this.emit();
    }
  };

  updateMessages = (id: string, messages: UIMessage[]) => {
    const t = this.threads.get(id);
    if (!t) return;
    t.messages = messages;
    if (t.title === "New chat") {
      const firstUser = messages.find((m) => m.role === "user");
      if (firstUser) {
        const text = firstUser.parts
          .map((p) => (p.type === "text" ? p.text : ""))
          .join(" ")
          .trim();
        if (text) t.title = text.slice(0, 40) + (text.length > 40 ? "…" : "");
      }
    }
    this.emit();
  };

  remove = (id: string) => {
    this.threads.delete(id);
    this.emit();
  };
}

export const threadStore = new ThreadStore();
