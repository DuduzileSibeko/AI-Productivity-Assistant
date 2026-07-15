import { AlertCircle } from "lucide-react";
import { type ReactNode } from "react";

export function FeatureHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">{title}</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">{description}</p>
        <div className="mt-4 flex items-start gap-2 rounded-md bg-accent/15 border border-accent/30 px-3 py-2 text-xs text-foreground/80">
          <AlertCircle className="h-4 w-4 mt-0.5 text-accent-foreground shrink-0" />
          <span>
            <strong>Responsible AI:</strong> Outputs are AI-generated. Review facts, tone, and
            recipient details before sending, sharing, or acting on the result.
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
