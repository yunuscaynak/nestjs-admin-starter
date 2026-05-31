import { cn } from "@/lib/utils";

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-deep)] p-2",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "rounded-xl border border-transparent px-4 py-3 text-left text-sm font-semibold transition",
        active
          ? "border-[var(--line)] bg-[var(--panel-soft)] text-[var(--foreground)]"
          : "bg-transparent text-[var(--ink-muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--ink)]",
        className,
      )}
      {...props}
    />
  );
}
