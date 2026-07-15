import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";
import {
  LayoutDashboard,
  Mail,
  FileText,
  CalendarClock,
  Search,
  MessagesSquare,
  BookOpen,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/summarize", label: "Meeting Summarizer", icon: FileText },
  { to: "/planner", label: "Task Planner", icon: CalendarClock },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/chat", label: "AI Chatbot", icon: MessagesSquare },
  { to: "/docs", label: "Docs", icon: BookOpen },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
          <img src={logo} alt="ProdAI logo" width={36} height={36} className="rounded-md" />
          <div>
            <div className="font-serif text-xl leading-none text-sidebar-foreground">ProdAI</div>
            <div className="text-xs text-muted-foreground mt-1">Workplace Assistant</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                activeProps={{
                  className: cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                  ),
                }}
                activeOptions={{ exact: item.to === "/" }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-sidebar-border text-xs text-muted-foreground">
          AI outputs may need review. Verify before sending.
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-3 border-b border-border px-4 py-3 bg-card">
          <img src={logo} alt="ProdAI" width={28} height={28} />
          <span className="font-serif text-lg">ProdAI</span>
        </header>
        <nav className="md:hidden flex overflow-x-auto gap-1 border-b border-border px-3 py-2 bg-card">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="shrink-0 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
              activeProps={{ className: "shrink-0 rounded-md px-3 py-1.5 text-xs bg-primary text-primary-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
