import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border border-[var(--line)] bg-[var(--panel-deep)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]",
        className,
      )}
      {...props}
    />
  );
}
