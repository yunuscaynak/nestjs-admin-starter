import { cn } from "@/lib/utils";

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-[24px] border border-[var(--line)] bg-[rgba(34,40,49,0.55)] p-2 shadow-[inset_0_1px_0_rgba(238,238,238,0.06)]",
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
        "rounded-[20px] px-4 py-3 text-left text-sm font-semibold transition",
        active
          ? "bg-[linear-gradient(135deg,var(--panel),var(--accent))] text-[var(--foreground)] shadow-[0_16px_36px_rgba(0,173,181,0.2)]"
          : "bg-transparent text-[var(--ink-muted)] hover:bg-[rgba(57,62,70,0.72)] hover:text-[var(--ink)]",
        className,
      )}
      {...props}
    />
  );
}
