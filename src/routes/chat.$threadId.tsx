import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Loader2, Plus, Send, Square, Trash2, MessagesSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { threadStore } from "@/lib/thread-store";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — ProdAI" },
      { name: "description", content: "Chat with an AI workplace assistant." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    threadStore.ensure(threadId);
  }, [threadId]);

  const threads = useSyncExternalStore(
    threadStore.subscribe,
    threadStore.getSnapshot,
    threadStore.getServerSnapshot,
  );
  const active = threads.find((t) => t.id === threadId);
  const initialMessages = useMemo(() => active?.messages ?? [], [active]);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => console.error("chat error", e),
  });

  useEffect(() => {
    threadStore.updateMessages(threadId, messages);
  }, [messages, threadId]);

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage({ text });
  };

  const newThread = () => {
    const id = crypto.randomUUID();
    navigate({ to: "/chat/$threadId", params: { threadId: id } });
  };

  const deleteThread = (id: string) => {
    threadStore.remove(id);
    if (id === threadId) {
      const remaining = threadStore.getSnapshot();
      if (remaining[0]) {
        navigate({ to: "/chat/$threadId", params: { threadId: remaining[0].id } });
      } else {
        newThread();
      }
    }
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-0px)] md:h-screen">
        <div className="hidden md:flex w-64 flex-col border-r border-border bg-card">
          <div className="p-3 border-b border-border">
            <Button onClick={newThread} className="w-full" size="sm">
              <Plus className="mr-2 h-4 w-4" /> New chat
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {threads.length === 0 && (
              <div className="text-xs text-muted-foreground p-3">No chats yet.</div>
            )}
            {threads.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm",
                  t.id === threadId ? "bg-primary/10 text-foreground" : "hover:bg-muted text-muted-foreground",
                )}
              >
                <Link
                  to="/chat/$threadId"
                  params={{ threadId: t.id }}
                  className="flex-1 truncate"
                  title={t.title}
                >
                  {t.title}
                </Link>
                <button
                  type="button"
                  onClick={() => deleteThread(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  aria-label="Delete chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border text-xs text-muted-foreground">
            Chats are not saved and will be lost on refresh.
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center px-6 text-center">
                <img src={logo} width={72} height={72} alt="ProdAI" className="mb-4" />
                <h2 className="font-serif text-3xl">Ask ProdAI anything.</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Draft, brainstorm, summarize, or plan. This chat runs in memory only — refresh to start fresh.
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {[
                    "Draft a professional apology email to a client",
                    "Summarize this meeting…",
                    "Plan my Monday around 3 deep-work priorities",
                    "Explain OKRs like I'm new to the concept",
                  ].map((p) => (
                    <button
                      key={p}
                      onClick={() => setInput(p)}
                      className="text-left rounded-lg border border-border bg-card p-3 text-sm hover:border-primary/40 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
                {messages.map((m) => {
                  const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
                  const isUser = m.role === "user";
                  return (
                    <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 max-w-[85%]",
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground",
                        )}
                      >
                        {isUser ? (
                          <div className="whitespace-pre-wrap">{text}</div>
                        ) : (
                          <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:font-serif dark:prose-invert">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {status === "submitted" && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                  </div>
                )}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-border bg-card p-3"
          >
            <div className="mx-auto max-w-3xl flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                rows={2}
                placeholder="Ask ProdAI…"
                className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {isLoading ? (
                <Button type="button" size="icon" variant="outline" onClick={() => stop()} aria-label="Stop">
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send">
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="mx-auto max-w-3xl mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <MessagesSquare className="h-3 w-3" /> Responses are AI-generated. Verify important information.
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
