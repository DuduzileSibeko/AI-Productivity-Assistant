import type { UIMessage } from "ai";

export type Thread = { id: string; title: string; messages: UIMessage[]; createdAt: number };

type Listener = () => void;

class ThreadStore {
  private threads = new Map<string, Thread>();
  private listeners = new Set<Listener>();
  private cachedList: Thread[] = [];

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  };

  getSnapshot = (): Thread[] => this.cachedList;
  getServerSnapshot = (): Thread[] => [];

  private recomputeAndEmit() {
    this.cachedList = Array.from(this.threads.values()).sort(
      (a, b) => b.createdAt - a.createdAt,
    );
    this.listeners.forEach((l) => l());
  }

  ensure = (id: string) => {
    if (this.threads.has(id)) return;
    this.threads.set(id, {
      id,
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
    });
    this.recomputeAndEmit();
  };

  updateMessages = (id: string, messages: UIMessage[]) => {
    const t = this.threads.get(id);
    if (!t) return;
    if (t.messages === messages) return;
    if (t.messages.length === messages.length && messages.length === 0) return;
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
    this.recomputeAndEmit();
  };

  remove = (id: string) => {
    if (!this.threads.delete(id)) return;
    this.recomputeAndEmit();
  };
}

export const threadStore = new ThreadStore();
